import os
import re
import json
import math
from typing import List, Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor, as_completed
import requests

def load_env_file():
    """Load variables from .env file into os.environ."""
    env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"")
                    if k not in os.environ:
                        os.environ[k] = v

load_env_file()

def get_gemini_api_key() -> Optional[str]:
    load_env_file()
    return os.environ.get("GEMINI_API_KEY")

def call_gemini(prompt: str, api_key: str) -> List[Dict[str, Any]]:
    """Call Gemini API with structured JSON output and fallback models."""
    models_to_try = [
        "gemini-flash-lite-latest",
        "gemini-flash-latest",
        "gemini-3.5-flash",
        "gemini-2.5-pro"
    ]

    last_error = None
    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.2, # Low temperature for accurate, factual, concept-heavy questions
            }
        }

        try:
            res = requests.post(url, json=payload, timeout=60)
            if res.status_code == 200:
                data = res.json()
                raw_text = data["candidates"][0]["content"]["parts"][0]["text"].strip()
                raw_text = re.sub(r"^```(?:json)?\s*", "", raw_text)
                raw_text = re.sub(r"\s*```$", "", raw_text)
                parsed = json.loads(raw_text)
                if isinstance(parsed, dict) and "questions" in parsed:
                    return parsed["questions"]
                elif isinstance(parsed, list):
                    return parsed
                return []
            else:
                last_error = f"Model {model} status {res.status_code}: {res.text[:120]}"
        except Exception as e:
            last_error = f"Model {model} exception: {str(e)}"
            continue

    raise RuntimeError(f"Gemini API request failed: {last_error}")

def normalize_mcq(item: Dict[str, Any], default_id: int) -> Optional[Dict[str, Any]]:
    """Validate and normalize a question object to strict standard format."""
    q_text = item.get("question") or item.get("q")
    if not q_text or len(str(q_text).strip()) < 8:
        return None

    raw_options = item.get("options") or []
    if not isinstance(raw_options, list) or len(raw_options) < 4:
        return None

    # Clean options and ensure A), B), C), D) prefixes
    clean_options = []
    letters = ["A", "B", "C", "D"]
    for i, opt in enumerate(raw_options[:4]):
        opt_str = re.sub(r"^[A-Da-d][\)\.\:\-]\s*", "", str(opt).strip())
        clean_options.append(f"{letters[i]}) {opt_str}")

    # Determine correct answer letter
    raw_ans = str(item.get("correct_answer") or item.get("answer") or "A").strip()
    correct_letter = "A"
    for let in letters:
        if raw_ans.upper().startswith(let):
            correct_letter = let
            break
        elif let in raw_ans.upper() and len(raw_ans) == 1:
            correct_letter = let
            break

    # If answer was written as text matching one of the options
    if correct_letter == "A" and raw_ans.upper() not in ["A", "B", "C", "D"]:
        for i, opt in enumerate(clean_options):
            if raw_ans.lower() in opt.lower():
                correct_letter = letters[i]
                break

    return {
        "id": default_id,
        "question": str(q_text).strip(),
        "options": clean_options,
        "correct_answer": correct_letter,
        "explanation": str(item.get("explanation") or "Refer to the video timestamp for detailed topic explanation.").strip(),
        "timestamp": str(item.get("timestamp") or "00:00").strip(),
        "difficulty": str(item.get("difficulty") or "Medium").capitalize()
    }

def generate_chunk_mcqs(
    chunk_text: str,
    target_count: int,
    difficulty: str,
    api_key: str
) -> List[Dict[str, Any]]:
    """Generate high-yield, strictly subject-matter MCQs for a specific transcript chunk."""
    prompt = f"""You are a strict, top-tier academic exam creator (UPSC / GATE / Medical / Computer Science Professor).
Your task is to analyze this lecture segment and create EXACTLY {target_count} rigorous, high-yield Multiple Choice Questions (MCQs).

MANDATORY LANGUAGE RULE:
- ALL questions, options, and explanations MUST be written strictly in clear, professional ACADEMIC ENGLISH, even if the video transcript is in Hindi, Hinglish, Spanish, or any other language.

CRITICAL QUALITY RULES:
1. FOCUS 100% EXCLUSIVELY ON THE REAL SUBJECT MATTER TAUGHT IN THIS SEGMENT.
2. STRICTLY FORBIDDEN TOPICS (ZERO TOLERANCE):
   - DO NOT create questions about the speaker's greetings, introductions, channel names, Telegram links, Instagram handles, subscribe/like requests, or sponsor ads.
   - DO NOT ask meta-questions like 'What did the speaker mention first?' or 'What is the channel called?'.
3. ONLY ask questions testing:
   - Specific technical concepts, definitions, rules, syntax, facts, theories, mechanisms, historical events, mathematical formulas, or problem-solving approaches taught in the content.
4. Each question must test a DISTINCT and MEANINGFUL concept.
5. Provide 4 realistic, distinct options (A, B, C, D) with ONLY ONE correct answer.
6. Provide an exact timestamp (e.g. 14:25) from the text where this was taught.
7. Provide a detailed, educational explanation in English.

TRANSCRIPT SEGMENT:
---
{chunk_text}
---

OUTPUT FORMAT:
Return a JSON array of objects with keys:
"question", "options" (array of 4 strings), "correct_answer" (letter 'A', 'B', 'C', or 'D'), "explanation", "timestamp", "difficulty" ('Easy', 'Medium', or 'Hard')
"""
    return call_gemini(prompt, api_key)

def generate_mcq_quiz(
    transcript_text: str,
    title: str = "Video Quiz",
    num_questions: int = 10,
    difficulty: str = "all"
) -> Dict[str, Any]:
    """
    Generate maximum high-yield questions (from 5 up to 500+) by splitting
    long video transcripts into chronological topic chunks and running multi-pass generation.
    """
    api_key = get_gemini_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY not found in environment or .env file.")

    target_total = max(3, min(500, int(num_questions)))

    # Split transcript into lines/snippets
    lines = [line.strip() for line in transcript_text.splitlines() if line.strip()]
    if not lines:
        lines = [transcript_text]

    # Decide batching strategy based on target question count
    # Each LLM call can reliably output ~15 to 25 detailed MCQs without quality degradation
    max_per_call = 20
    num_batches = math.ceil(target_total / max_per_call)
    num_batches = max(1, min(25, num_batches))

    questions_per_batch = math.ceil(target_total / num_batches)

    # Chunk the transcript lines evenly across batches
    chunk_size = math.ceil(len(lines) / num_batches)
    chunks = []
    for i in range(num_batches):
        start_idx = i * chunk_size
        end_idx = min(len(lines), (i + 1) * chunk_size)
        chunk_lines = lines[start_idx:end_idx]
        if chunk_lines:
            chunks.append("\n".join(chunk_lines))

    if not chunks:
        chunks = [transcript_text[:120000]]

    all_raw_questions = []

    # Parallel execution with ThreadPoolExecutor for speed
    with ThreadPoolExecutor(max_workers=min(4, len(chunks))) as executor:
        future_to_chunk = {
            executor.submit(
                generate_chunk_mcqs,
                chunk,
                questions_per_batch,
                difficulty,
                api_key
            ): idx for idx, chunk in enumerate(chunks)
        }

        # Collect ordered by chunk index
        ordered_results = [None] * len(chunks)
        for future in as_completed(future_to_chunk):
            chunk_idx = future_to_chunk[future]
            try:
                q_list = future.result()
                ordered_results[chunk_idx] = q_list
            except Exception as e:
                print(f"[Warning] Batch {chunk_idx + 1} failed: {e}")
                ordered_results[chunk_idx] = []

    for q_list in ordered_results:
        if q_list:
            all_raw_questions.extend(q_list)

    # Normalize, deduplicate, and index all questions
    final_questions = []
    seen_questions = set()

    for item in all_raw_questions:
        norm = normalize_mcq(item, default_id=len(final_questions) + 1)
        if norm:
            # Check duplicate question text
            q_clean = norm["question"].lower().strip()
            if q_clean not in seen_questions:
                seen_questions.add(q_clean)
                norm["id"] = len(final_questions) + 1
                final_questions.append(norm)

        if len(final_questions) >= target_total:
            break

    if not final_questions:
        raise RuntimeError("No valid content-related questions could be extracted from this transcript.")

    return {
        "title": title,
        "total_questions": len(final_questions),
        "requested_count": target_total,
        "difficulty": difficulty,
        "questions": final_questions
    }
