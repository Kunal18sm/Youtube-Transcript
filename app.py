import re
import html
import os
from typing import Optional, List, Dict, Any
import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    RequestBlocked,
    CouldNotRetrieveTranscript,
    YouTubeTranscriptApiException
)

app = FastAPI(title="YouTube Transcript Pro", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_video_id(url_or_id: str) -> Optional[str]:
    """Extract 11-char YouTube video ID from various URL formats or raw ID."""
    clean = url_or_id.strip()
    if re.match(r'^[a-zA-Z0-9_-]{11}$', clean):
        return clean
    
    patterns = [
        r'(?:v=|\/v\/|embed\/|shorts\/|live\/|youtu\.be\/|\/e\/)([a-zA-Z0-9_-]{11})',
        r'[\?&]v=([a-zA-Z0-9_-]{11})'
    ]
    for pattern in patterns:
        m = re.search(pattern, clean)
        if m:
            return m.group(1)
    return None

def format_timestamp(seconds: float) -> str:
    """Format seconds into HH:MM:SS or MM:SS."""
    total_sec = int(seconds)
    hours = total_sec // 3600
    minutes = (total_sec % 3600) // 60
    secs = total_sec % 60
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"

def seconds_to_srt_time(seconds: float) -> str:
    """Format seconds to SRT time format: 00:00:00,000."""
    total_ms = int(round(seconds * 1000))
    hours = total_ms // 3600000
    minutes = (total_ms % 3600000) // 60000
    secs = (total_ms % 60000) // 1000
    ms = total_ms % 1000
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"

def get_proxy_url() -> Optional[str]:
    p = os.getenv("PROXY_URL", "").strip() or os.getenv("HTTPS_PROXY", "").strip() or os.getenv("HTTP_PROXY", "").strip()
    return p if p else None

def fetch_oembed_metadata(video_id: str) -> Dict[str, Any]:
    """Fetch video title, author, thumbnail using public oEmbed."""
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        proxy = get_proxy_url()
        proxies = {"http": proxy, "https": proxy} if proxy else None
        res = requests.get(url, timeout=5, proxies=proxies)
        if res.status_code == 200:
            data = res.json()
            return {
                "title": data.get("title", f"Video ({video_id})"),
                "author": data.get("author_name", "Unknown Channel"),
                "author_url": data.get("author_url", ""),
                "thumbnail": data.get("thumbnail_url", f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"),
            }
    except Exception:
        pass
    
    return {
        "title": f"YouTube Video ({video_id})",
        "author": "YouTube",
        "author_url": "",
        "thumbnail": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
    }

def get_yt_api() -> YouTubeTranscriptApi:
    """Create YouTubeTranscriptApi instance with realistic desktop headers, optional cookies, and proxy support."""
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
    })

    # Optional YouTube Cookies to bypass datacenter IP restrictions for free
    cookies_str = os.getenv("YOUTUBE_COOKIES", "").strip()
    if cookies_str:
        for item in cookies_str.split(";"):
            if "=" in item:
                k, v = item.strip().split("=", 1)
                session.cookies.set(k.strip(), v.strip(), domain=".youtube.com")

    proxy_url = get_proxy_url()
    if proxy_url:
        session.proxies.update({
            "http": proxy_url,
            "https": proxy_url,
        })
    return YouTubeTranscriptApi(http_client=session)

def get_video_info_data(url: str) -> Dict[str, Any]:
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL or Video ID. Please check the link.")
    
    meta = fetch_oembed_metadata(video_id)
    api = get_yt_api()
    languages = []
    try:
        transcript_list = api.list(video_id)
        for t in transcript_list:
            languages.append({
                "language": t.language,
                "language_code": t.language_code,
                "is_generated": t.is_generated,
                "is_translatable": t.is_translatable,
            })
    except TranscriptsDisabled:
        raise HTTPException(status_code=404, detail="Subtitles/Captions are disabled by the creator for this video.")
    except NoTranscriptFound:
        raise HTTPException(status_code=404, detail="No transcript found for this video on YouTube.")
    except RequestBlocked:
        raise HTTPException(status_code=429, detail="YouTube blocked cloud datacenter IP. Configure PROXY_URL in environment variables to bypass.")
    except Exception as e:
        err = str(e).lower()
        if "no longer available" in err or "private" in err:
            raise HTTPException(status_code=404, detail="This video is unavailable, private, or a live stream with no captions yet.")
        if "subtitles are disabled" in err:
            raise HTTPException(status_code=404, detail="Subtitles/Captions are disabled for this video.")
        raise HTTPException(status_code=500, detail=f"Could not retrieve transcripts: {str(e)[:120]}")

    if not languages:
        raise HTTPException(status_code=404, detail="No transcripts found for this video.")

    return {
        "video_id": video_id,
        "title": meta["title"],
        "author": meta["author"],
        "author_url": meta["author_url"],
        "thumbnail": meta["thumbnail"],
        "languages": languages
    }

def get_transcript_data(url: str, lang: Optional[str] = None) -> Dict[str, Any]:
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL or Video ID. Please check the link.")
    
    meta = fetch_oembed_metadata(video_id)
    api = get_yt_api()

    try:
        transcript_list = api.list(video_id)
    except TranscriptsDisabled:
        raise HTTPException(status_code=404, detail="Captions/Subtitles are disabled for this video by creator.")
    except NoTranscriptFound:
        raise HTTPException(status_code=404, detail="No transcript found for this video.")
    except RequestBlocked:
        raise HTTPException(status_code=429, detail="YouTube blocked cloud datacenter IP. Configure PROXY_URL in environment variables to bypass.")
    except Exception as e:
        err = str(e).lower()
        if "no longer available" in err or "private" in err:
            raise HTTPException(status_code=404, detail="This video is unavailable, private, or an ongoing live stream with no captions.")
        if "subtitles are disabled" in err:
            raise HTTPException(status_code=404, detail="Subtitles/Captions are turned off for this video.")
        raise HTTPException(status_code=500, detail=f"Failed to query transcripts: {str(e)[:120]}")

    target_transcript = None
    all_langs = []
    for t in transcript_list:
        all_langs.append({
            "language": t.language,
            "language_code": t.language_code,
            "is_generated": t.is_generated,
            "is_translatable": t.is_translatable,
        })
    
    if lang:
        try:
            target_transcript = transcript_list.find_transcript([lang])
        except Exception:
            try:
                for t in transcript_list:
                    if t.is_translatable:
                        target_transcript = t.translate(lang)
                        break
            except Exception:
                pass
    
    if not target_transcript:
        try:
            target_transcript = transcript_list.find_manually_created_transcript(['en', 'hi'])
        except Exception:
            try:
                target_transcript = transcript_list.find_generated_transcript(['en', 'hi'])
            except Exception:
                target_transcript = next(iter(transcript_list), None)
    
    if not target_transcript:
        raise HTTPException(status_code=404, detail="No suitable transcript found for this video.")

    try:
        raw_snippets = target_transcript.fetch()
    except Exception as e:
        err_msg = str(e)
        if "blocking requests from your IP" in err_msg or "IpBlocked" in err_msg or "RequestBlocked" in err_msg:
            raise HTTPException(
                status_code=429,
                detail="YouTube blocked requests from this datacenter IP. Note: Free Webshare proxies are Datacenter IPs which YouTube detects. You can use a Residential Proxy or click 'Paste Transcript Directly' to create MCQs."
            )
        if "502" in err_msg or "Bad Gateway" in err_msg:
            raise HTTPException(
                status_code=502,
                detail="YouTube's subtitle server responded with 502 Bad Gateway (common for live streams or newly uploaded videos). You can paste the transcript directly to proceed."
            )
        raise HTTPException(status_code=500, detail=f"Error downloading transcript: {err_msg[:140]}")

    snippets = []
    plain_text_parts = []
    total_words = 0
    max_time = 0.0

    for item in raw_snippets:
        clean_text = html.unescape(item.text).strip()
        clean_text = re.sub(r'\s+', ' ', clean_text)
        if not clean_text:
            continue
        
        start = float(item.start)
        duration = float(item.duration)
        end = start + duration
        if end > max_time:
            max_time = end
        
        formatted_time = format_timestamp(start)
        words = len(clean_text.split())
        total_words += words
        
        snippets.append({
            "start": round(start, 2),
            "duration": round(duration, 2),
            "end": round(end, 2),
            "formatted_time": formatted_time,
            "text": clean_text
        })
        plain_text_parts.append(clean_text)

    paragraphs = []
    current_para = []
    current_start = 0.0
    current_words = 0

    for s in snippets:
        if not current_para:
            current_start = s["start"]
        current_para.append(s["text"])
        current_words += len(s["text"].split())

        if current_words >= 45 or s["text"].endswith(('.', '?', '!')):
            paragraphs.append({
                "start": current_start,
                "formatted_time": format_timestamp(current_start),
                "text": " ".join(current_para)
            })
            current_para = []
            current_words = 0

    if current_para:
        paragraphs.append({
            "start": current_start,
            "formatted_time": format_timestamp(current_start),
            "text": " ".join(current_para)
        })

    srt_lines = []
    for idx, s in enumerate(snippets, start=1):
        srt_lines.append(str(idx))
        srt_lines.append(f"{seconds_to_srt_time(s['start'])} --> {seconds_to_srt_time(s['end'])}")
        srt_lines.append(s["text"])
        srt_lines.append("")
    srt_content = "\n".join(srt_lines)

    plain_text = " ".join(plain_text_parts)
    timestamped_text = "\n".join([f"[{s['formatted_time']}] {s['text']}" for s in snippets])

    return {
        "video_id": video_id,
        "title": meta["title"],
        "author": meta["author"],
        "author_url": meta["author_url"],
        "thumbnail": meta["thumbnail"],
        "language": target_transcript.language,
        "language_code": target_transcript.language_code,
        "is_generated": target_transcript.is_generated,
        "available_languages": all_langs,
        "total_snippets": len(snippets),
        "total_words": total_words,
        "duration_seconds": round(max_time, 2),
        "formatted_duration": format_timestamp(max_time),
        "estimated_reading_time_min": max(1, round(total_words / 200)),
        "snippets": snippets,
        "paragraphs": paragraphs,
        "plain_text": plain_text,
        "timestamped_text": timestamped_text,
        "srt_content": srt_content
    }

from pydantic import BaseModel
from quiz_generator import generate_mcq_quiz

class QuizRequest(BaseModel):
    video_id: Optional[str] = None
    url: Optional[str] = None
    transcript_text: Optional[str] = None
    title: Optional[str] = "Video Quiz"
    num_questions: int = 10
    difficulty: str = "all"

class TranslateRequest(BaseModel):
    text: Optional[str] = None
    question: Optional[str] = None
    options: Optional[List[str]] = None
    explanation: Optional[str] = None
    target_lang: str = "hi"

def translate_str(text: str, target: str = "hi") -> str:
    if not text:
        return ""
    import urllib.parse
    url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl={target}&dt=t&q={urllib.parse.quote(text)}"
    try:
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            return "".join([part[0] for part in r.json()[0] if part[0]])
    except Exception:
        pass
    return text

@app.post("/api/translate")
@app.post("/translate")
def translate_endpoint(req: TranslateRequest):
    if req.question:
        trans_q = translate_str(req.question, req.target_lang)
        trans_opts = [translate_str(opt, req.target_lang) for opt in (req.options or [])]
        trans_exp = translate_str(req.explanation or "", req.target_lang)
        return {
            "question": trans_q,
            "options": trans_opts,
            "explanation": trans_exp
        }
    return {"translated_text": translate_str(req.text or "", req.target_lang)}

# FastAPI Local Endpoints
@app.get("/api/info")
@app.get("/info")
def get_video_info(url: str = Query(..., description="YouTube URL or Video ID")):
    return get_video_info_data(url)

@app.get("/api/transcript")
@app.get("/transcript")
def get_transcript(
    url: str = Query(..., description="YouTube URL or Video ID"),
    lang: Optional[str] = Query(None, description="Preferred language code (e.g., 'en', 'hi')")
):
    return get_transcript_data(url, lang)

@app.post("/api/generate-quiz")
@app.post("/generate-quiz")
def create_quiz(req: QuizRequest):
    text = req.transcript_text
    title = req.title or "Video Quiz"
    if not text:
        vid_url = req.url or req.video_id
        if not vid_url:
            raise HTTPException(status_code=400, detail="Either url, video_id, or transcript_text must be provided.")
        t_data = get_transcript_data(vid_url)
        text = t_data["timestamped_text"]
        title = t_data.get("title", title)
    
    try:
        quiz = generate_mcq_quiz(
            transcript_text=text,
            title=title,
            num_questions=req.num_questions,
            difficulty=req.difficulty
        )
        return quiz
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve frontend static files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(BASE_DIR, "public", "static")
if not os.path.exists(static_dir):
    static_dir = os.path.join(BASE_DIR, "static")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/manifest.json")
def get_manifest():
    p = os.path.join(BASE_DIR, "public", "manifest.json")
    if not os.path.exists(p):
        p = os.path.join(BASE_DIR, "static", "manifest.json")
    return FileResponse(p)

@app.get("/sw.js")
def get_sw():
    p = os.path.join(BASE_DIR, "public", "sw.js")
    if not os.path.exists(p):
        p = os.path.join(BASE_DIR, "static", "sw.js")
    return FileResponse(p, media_type="application/javascript")

@app.get("/icon-192.png")
def get_icon192():
    p = os.path.join(BASE_DIR, "public", "icon-192.png")
    if not os.path.exists(p):
        p = os.path.join(BASE_DIR, "static", "icon-192.png")
    return FileResponse(p)

@app.get("/icon-512.png")
def get_icon512():
    p = os.path.join(BASE_DIR, "public", "icon-512.png")
    if not os.path.exists(p):
        p = os.path.join(BASE_DIR, "static", "icon-512.png")
    return FileResponse(p)

@app.get("/favicon.ico")
def get_favicon():
    p = os.path.join(BASE_DIR, "public", "icon-192.png")
    if not os.path.exists(p):
        p = os.path.join(BASE_DIR, "static", "icon-192.png")
    return FileResponse(p, media_type="image/png")

@app.get("/")
def serve_index():
    candidates = [
        os.path.join(BASE_DIR, "public", "index.html"),
        os.path.join(BASE_DIR, "static", "index.html"),
    ]
    for c in candidates:
        if os.path.exists(c):
            return FileResponse(c)
    return {"message": "YouTube Transcript Pro API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
