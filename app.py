import re
import html
import os
import tempfile
import glob
import random
import socket
import time
import json
import hashlib
import secrets
from typing import Optional, List, Dict, Any
import requests
import yt_dlp
from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass
from pymongo import MongoClient, ASCENDING
from pymongo.errors import PyMongoError
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    RequestBlocked,
    CouldNotRetrieveTranscript,
    YouTubeTranscriptApiException,
    VideoUnavailable,
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
    if not p:
        return None
    if not p.startswith("http://") and not p.startswith("https://") and not p.startswith("socks5://"):
        user = os.getenv("PROXY_USER", "").strip()
        pwd = os.getenv("PROXY_PASS", "").strip()
        if user and pwd:
            p = f"http://{user}:{pwd}@{p}"
        else:
            p = f"http://{p}"
    return p

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

class TimeoutHTTPAdapter(requests.adapters.HTTPAdapter):
    def __init__(self, timeout: float = 4.0, *args, **kwargs):
        self.timeout = timeout
        super().__init__(*args, **kwargs)

    def send(self, request, **kwargs):
        kwargs.setdefault("timeout", self.timeout)
        return super().send(request, **kwargs)

def get_yt_api(use_proxy: bool = True) -> YouTubeTranscriptApi:
    """Create YouTubeTranscriptApi instance with realistic desktop headers, optional cookies, and proxy support."""
    session = requests.Session()
    adapter = TimeoutHTTPAdapter(timeout=4.0)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-User": "?1",
        "Sec-Fetch-Dest": "document",
    })

    cookies_raw = os.getenv("YOUTUBE_COOKIES", "").strip()
    if cookies_raw:
        for line in cookies_raw.splitlines():
            line = line.strip()
            if not line or line.startswith("#"):
                continue
            if "\t" in line:
                parts = line.split("\t")
                if len(parts) >= 7:
                    session.cookies.set(parts[5].strip(), parts[6].strip(), domain=".youtube.com")
            else:
                for item in line.split(";"):
                    if "=" in item:
                        k, v = item.strip().split("=", 1)
                        session.cookies.set(k.strip(), v.strip(), domain=".youtube.com")

    if use_proxy:
        proxy_url = get_proxy_url()
        if proxy_url:
            session.proxies.update({
                "http": proxy_url,
                "https": proxy_url,
            })
    return YouTubeTranscriptApi(http_client=session)

def fetch_transcript_list_safely(video_id: str):
    """Attempt fetching transcript list with proxy, auto-fallback to direct session with cookies."""
    api = get_yt_api(use_proxy=True)
    try:
        return api.list(video_id)
    except RequestBlocked:
        if get_proxy_url():
            direct_api = get_yt_api(use_proxy=False)
            return direct_api.list(video_id)
        raise

def parse_vtt_content(content: str) -> List[Dict[str, Any]]:
    """Parse WebVTT content into clean, timestamped transcript snippets."""
    def ts_to_sec(ts: str) -> float:
        parts = ts.strip().split(":")
        if len(parts) == 3:
            h, m, s = parts
            return int(h) * 3600 + int(m) * 60 + float(s)
        elif len(parts) == 2:
            m, s = parts
            return int(m) * 60 + float(s)
        return float(ts)

    blocks = re.split(r"\n\s*\n", content)
    snippets = []
    last_text = ""
    
    for block in blocks:
        lines = [l.strip() for l in block.strip().splitlines() if l.strip()]
        if not lines or lines[0].startswith("WEBVTT") or lines[0].startswith("Kind:") or lines[0].startswith("Language:"):
            continue
        
        time_match = None
        time_idx = -1
        for i, line in enumerate(lines):
            m = re.search(r"(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)\s*-->\s*(\d{1,2}:\d{2}(?::\d{2})?(?:\.\d+)?)", line)
            if m:
                time_match = m
                time_idx = i
                break
        
        if not time_match:
            continue
            
        start_sec = ts_to_sec(time_match.group(1))
        end_sec = ts_to_sec(time_match.group(2))
        duration = max(0.1, round(end_sec - start_sec, 2))
        
        text_lines = lines[time_idx + 1:]
        clean_lines = []
        for tl in text_lines:
            t = re.sub(r"<[^>]+>", "", tl)
            t = html.unescape(t).strip()
            if t and t not in clean_lines:
                clean_lines.append(t)
        
        if not clean_lines:
            continue
            
        text = " ".join(clean_lines).strip()
        text = re.sub(r"\s+", " ", text)
        
        if not text or text == last_text:
            continue
            
        if last_text and text.startswith(last_text) and len(text) > len(last_text):
            new_part = text[len(last_text):].strip()
            if new_part:
                snippets.append({
                    "start": round(start_sec, 2),
                    "duration": round(duration, 2),
                    "end": round(end_sec, 2),
                    "formatted_time": format_timestamp(start_sec),
                    "text": new_part
                })
                last_text = text
                continue
                
        snippets.append({
            "start": round(start_sec, 2),
            "duration": round(duration, 2),
            "end": round(end_sec, 2),
            "formatted_time": format_timestamp(start_sec),
            "text": text
        })
        last_text = text
        
    return snippets

def build_transcript_payload(
    video_id: str,
    meta: Dict[str, Any],
    lang_name: str,
    lang_code: str,
    is_generated: bool,
    available_langs: List[Dict[str, Any]],
    snippets: List[Dict[str, Any]]
) -> Dict[str, Any]:
    plain_text_parts = []
    total_words = 0
    max_time = 0.0

    for s in snippets:
        plain_text_parts.append(s["text"])
        total_words += len(s["text"].split())
        if s.get("end", 0.0) > max_time:
            max_time = s["end"]

    paragraphs = []
    current_para = []
    current_start = 0.0
    current_words = 0

    for s in snippets:
        if not current_para:
            current_start = s["start"]
        current_para.append(s["text"])
        current_words += len(s["text"].split())
        if current_words >= 45 or s["text"].endswith(('.', '?', '!', '।')):
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
        "title": meta.get("title", f"Video ({video_id})"),
        "author": meta.get("author", "YouTube Channel"),
        "author_url": meta.get("author_url", ""),
        "thumbnail": meta.get("thumbnail", f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"),
        "language": lang_name,
        "language_code": lang_code,
        "is_generated": is_generated,
        "available_languages": available_langs,
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

def fetch_transcript_data_ytdlp(video_id: str, lang: Optional[str] = None, meta: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
    """Fallback Engine using yt-dlp with client impersonation and auto-retry to bypass datacenter blocks."""
    if not meta:
        meta = fetch_oembed_metadata(video_id)

    url = f"https://www.youtube.com/watch?v={video_id}"

    with tempfile.TemporaryDirectory() as tmpdir:
        out_tmpl = os.path.join(tmpdir, "%(id)s.%(ext)s")
        langs_to_try = []
        if lang:
            langs_to_try.append(f"{lang}.*")
        langs_to_try.extend(["hi.*", "en.*"])

        def attempt_ydl(use_proxy: Optional[str], player_clients: List[str]):
            ydl_opts = {
                "skip_download": True,
                "writesubtitles": True,
                "writeautomaticsub": True,
                "subtitleslangs": langs_to_try,
                "subtitlesformat": "vtt",
                "outtmpl": out_tmpl,
                "quiet": True,
                "no_warnings": True,
                "socket_timeout": 6,
                "extractor_args": {"youtube": {"player_client": player_clients}},
            }
            if use_proxy:
                ydl_opts["proxy"] = use_proxy

            info_dict = None
            try:
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info_dict = ydl.extract_info(url, download=True)
            except Exception:
                pass
            return info_dict

        configured_proxy = get_proxy_url()
        info = None

        # Pass 1: Try with configured proxy if provided
        if configured_proxy:
            info = attempt_ydl(configured_proxy, ["tv_embedded", "android_creator"])

        vtt_files = glob.glob(os.path.join(tmpdir, "*.vtt"))

        # Pass 2: If proxy failed/bot-blocked or wasn't provided, try DIRECT without proxy
        if not vtt_files:
            info = attempt_ydl(None, ["tv_embedded", "android_creator"])
            vtt_files = glob.glob(os.path.join(tmpdir, "*.vtt"))

        # Pass 3: If still no vtt files, try with visionos and android
        if not vtt_files:
            info = attempt_ydl(None, ["visionos", "android", "mweb"])
            vtt_files = glob.glob(os.path.join(tmpdir, "*.vtt"))

        if not vtt_files:
            raise HTTPException(
                status_code=404,
                detail="No transcript or captions found for this video on YouTube."
            )

        chosen_vtt = vtt_files[0]
        if lang:
            for vf in vtt_files:
                if f".{lang}." in vf or f".{lang}-" in vf:
                    chosen_vtt = vf
                    break
        else:
            for vf in vtt_files:
                if ".hi" in vf:
                    chosen_vtt = vf
                    break
                elif ".en" in vf:
                    chosen_vtt = vf

        with open(chosen_vtt, "r", encoding="utf-8") as f:
            vtt_content = f.read()

        snippets = parse_vtt_content(vtt_content)
        if not snippets:
            raise HTTPException(status_code=404, detail="Subtitles found but could not parse text cues.")

        detected_lang = "Hindi" if ".hi" in chosen_vtt else ("English" if ".en" in chosen_vtt else "Auto")
        detected_code = "hi" if ".hi" in chosen_vtt else ("en" if ".en" in chosen_vtt else "auto")

        video_meta = {
            "title": (info.get("title") if info else None) or meta.get("title", f"Video ({video_id})"),
            "author": (info.get("uploader") if info else None) or meta.get("author", "YouTube Channel"),
            "author_url": (info.get("uploader_url") if info else None) or meta.get("author_url", ""),
            "thumbnail": (info.get("thumbnail") if info else None) or meta.get("thumbnail", f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"),
        }

        all_langs = []
        if info:
            for code in (info.get("subtitles") or {}).keys():
                all_langs.append({"language": code, "language_code": code, "is_generated": False, "is_translatable": True})
            for code in (info.get("automatic_captions") or {}).keys():
                all_langs.append({"language": code, "language_code": code, "is_generated": True, "is_translatable": True})

        if not all_langs:
            all_langs.append({"language": detected_lang, "language_code": detected_code, "is_generated": True, "is_translatable": False})

        return build_transcript_payload(
            video_id=video_id,
            meta=video_meta,
            lang_name=detected_lang,
            lang_code=detected_code,
            is_generated=True,
            available_langs=all_langs,
            snippets=snippets
        )

def fetch_video_info_ytdlp(video_id: str, meta: Dict[str, Any]) -> Dict[str, Any]:
    """Fallback info extractor using yt-dlp."""
    url = f"https://www.youtube.com/watch?v={video_id}"
    ydl_opts = {
        "skip_download": True,
        "quiet": True,
        "no_warnings": True,
        "ignoreerrors": True,
        "socket_timeout": 6,
        "extractor_args": {"youtube": {"player_client": ["tv_embedded", "android_creator"]}},
    }
    proxy_url = get_proxy_url()
    info = None
    if proxy_url:
        try:
            ydl_opts["proxy"] = proxy_url
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
        except Exception:
            pass

    if not info:
        try:
            ydl_opts.pop("proxy", None)
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(url, download=False)
        except Exception:
            info = None

    languages = []
    if info:
        for code in (info.get("subtitles") or {}).keys():
            languages.append({"language": code, "language_code": code, "is_generated": False, "is_translatable": True})
        for code in (info.get("automatic_captions") or {}).keys():
            languages.append({"language": code, "language_code": code, "is_generated": True, "is_translatable": True})

    if not languages:
        languages.append({"language": "Auto Captions", "language_code": "auto", "is_generated": True, "is_translatable": True})

    return {
        "video_id": video_id,
        "title": (info.get("title") if info else None) or meta.get("title", f"Video ({video_id})"),
        "author": (info.get("uploader") if info else None) or meta.get("author", "YouTube Channel"),
        "author_url": (info.get("uploader_url") if info else None) or meta.get("author_url", ""),
        "thumbnail": (info.get("thumbnail") if info else None) or meta.get("thumbnail", f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"),
        "languages": languages
    }

def get_video_info_data(url: str) -> Dict[str, Any]:
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL or Video ID. Please check the link.")
    
    meta = fetch_oembed_metadata(video_id)
    languages = []
    try:
        transcript_list = fetch_transcript_list_safely(video_id)
        for t in transcript_list:
            languages.append({
                "language": t.language,
                "language_code": t.language_code,
                "is_generated": t.is_generated,
                "is_translatable": t.is_translatable,
            })
        return {
            "video_id": video_id,
            "title": meta["title"],
            "author": meta["author"],
            "author_url": meta["author_url"],
            "thumbnail": meta["thumbnail"],
            "languages": languages
        }
    except Exception:
        # Fallback to yt-dlp metadata
        return fetch_video_info_ytdlp(video_id, meta)

def get_transcript_data(url: str, lang: Optional[str] = None) -> Dict[str, Any]:
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL or Video ID. Please check the link.")
    
    meta = fetch_oembed_metadata(video_id)

    # Engine 1: Standard YouTubeTranscriptApi
    try:
        transcript_list = fetch_transcript_list_safely(video_id)
        all_langs = []
        for t in transcript_list:
            all_langs.append({
                "language": t.language,
                "language_code": t.language_code,
                "is_generated": t.is_generated,
                "is_translatable": t.is_translatable,
            })

        target_transcript = None
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
            raise Exception("No suitable transcript found via API")

        raw_snippets = target_transcript.fetch()
        clean_snippets = []
        for item in raw_snippets:
            ct = html.unescape(item.text).strip()
            ct = re.sub(r'\s+', ' ', ct)
            if not ct:
                continue
            start = float(item.start)
            duration = float(item.duration)
            end = start + duration
            clean_snippets.append({
                "start": round(start, 2),
                "duration": round(duration, 2),
                "end": round(end, 2),
                "formatted_time": format_timestamp(start),
                "text": ct
            })

        if clean_snippets:
            return build_transcript_payload(
                video_id=video_id,
                meta=meta,
                lang_name=target_transcript.language,
                lang_code=target_transcript.language_code,
                is_generated=target_transcript.is_generated,
                available_langs=all_langs,
                snippets=clean_snippets
            )
    except Exception:
        # Engine 1 failed (RequestBlocked, 502, Cloud IP Block, etc.)
        # Fallback seamlessly to Engine 2 (yt-dlp VTT engine)
        pass

    # Engine 2: yt-dlp VTT Engine (bypasses datacenter blocks & 502 Bad Gateway)
    try:
        return fetch_transcript_data_ytdlp(video_id, lang, meta)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Could not extract transcript for video {video_id}: {str(e)[:120]}"
        )

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
@app.get("/api/health")
@app.get("/api/status")
def health_check():
    u_col, _ = get_mongo()
    mongo_status = "connected" if u_col is not None else "offline"
    return {
        "status": "online",
        "mongo": mongo_status,
        "message": f"YT Transcript Pro Backend is ONLINE (MongoDB: {mongo_status})",
        "port": 8000
    }

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
SHARED_QUIZZES_DIR = os.path.join(BASE_DIR, "data", "shared_quizzes")
os.makedirs(SHARED_QUIZZES_DIR, exist_ok=True)

# ==============================================================================
# MONGODB CONNECTION & DATABASE SETUP
# ==============================================================================
MONGODB_URI = os.getenv("MONGODB_URI", "").strip()
_mongo_client = None
_mongo_db = None
_quiz_users_col = None
_quiz_quizzes_col = None

def get_mongo():
    global _mongo_client, _mongo_db, _quiz_users_col, _quiz_quizzes_col
    if _quiz_users_col is not None and _quiz_quizzes_col is not None:
        return _quiz_users_col, _quiz_quizzes_col

    uri = os.getenv("MONGODB_URI", "").strip() or MONGODB_URI
    if not uri:
        return None, None

    try:
        if _mongo_client is None:
            _mongo_client = MongoClient(uri, serverSelectionTimeoutMS=4000, connectTimeoutMS=4000)

        # Target the database from URI or default to 'sahkaar_sevasetu'
        db_name = "sahkaar_sevasetu"
        try:
            if "mongodb.net/" in uri:
                parsed = uri.split("mongodb.net/")[1].split("?")[0].strip()
                if parsed:
                    db_name = parsed
        except Exception:
            pass

        _mongo_db = _mongo_client[db_name]
        _quiz_users_col = _mongo_db["quiz_users"]
        _quiz_quizzes_col = _mongo_db["quiz_quizzes"]

        # Ensure performance indexes gracefully
        for col, idx, kwargs in [
            (_quiz_users_col, [("username", ASCENDING)], {"unique": True}),
            (_quiz_quizzes_col, [("code", ASCENDING)], {}),
            (_quiz_quizzes_col, [("username", ASCENDING)], {}),
            (_quiz_quizzes_col, [("id", ASCENDING), ("username", ASCENDING)], {})
        ]:
            try:
                col.create_index(idx, **kwargs)
            except Exception:
                pass

        return _quiz_users_col, _quiz_quizzes_col
    except Exception as e:
        print(f"[MongoDB] Connection error: {e}")
        return None, None

# Try initializing on startup
get_mongo()

def hash_password(password: str) -> str:
    # Industry standard PBKDF2-HMAC-SHA256 with 100,000 iterations
    salt = "yt_quiz_salt_2026_secured_v2"
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000).hex()

def verify_password(stored_hash: str, password: str) -> bool:
    if not stored_hash or not password:
        return False
    # 1. PBKDF2 verification
    if hash_password(password) == stored_hash:
        return True
    # 2. Legacy sha256 fallback (auto-upgrade on login)
    legacy_salt = "yt_quiz_salt_2026_secured"
    legacy_hash = hashlib.sha256(f"{legacy_salt}{password}".encode("utf-8")).hexdigest()
    return legacy_hash == stored_hash

FAILED_LOGINS: Dict[str, List[float]] = {}

def check_login_rate_limit(username: str):
    now = time.time()
    attempts = [t for t in FAILED_LOGINS.get(username, []) if now - t < 300]
    FAILED_LOGINS[username] = attempts
    if len(attempts) >= 5:
        wait_sec = int(300 - (now - attempts[0]))
        raise HTTPException(
            status_code=429, 
            detail=f"Too many failed login attempts for this user ID. Security lockout: please wait {max(5, wait_sec)} seconds."
        )

def record_failed_login(username: str):
    now = time.time()
    attempts = [t for t in FAILED_LOGINS.get(username, []) if now - t < 300]
    attempts.append(now)
    FAILED_LOGINS[username] = attempts

def clear_failed_login(username: str):
    FAILED_LOGINS.pop(username, None)

def sanitize_username(uname: Any) -> str:
    if not uname or not isinstance(uname, str):
        raise HTTPException(status_code=400, detail="Username must be a valid text string.")
    clean = uname.strip().lower()
    if not re.match(r'^[a-z0-9_]{3,30}$', clean):
        raise HTTPException(status_code=400, detail="Username must be 3-30 characters (letters, numbers, underscores only).")
    return clean

def sanitize_code(code_val: Any) -> str:
    if not code_val or not isinstance(code_val, str):
        raise HTTPException(status_code=400, detail="Invalid quiz code format.")
    clean = re.sub(r'[^a-zA-Z0-9]', '', code_val).upper()
    if clean.startswith("YT"):
        clean = clean[2:]
    if len(clean) < 4 or len(clean) > 16:
        raise HTTPException(status_code=400, detail="Quiz code must be 4 to 16 alphanumeric characters.")
    return clean

def sanitize_mongo_dict(data: Any) -> Any:
    """Strictly sanitize payload to prevent NoSQL operator injection."""
    if isinstance(data, dict):
        clean = {}
        for k, v in data.items():
            k_str = str(k).strip()
            if k_str.startswith("$") or "." in k_str:
                continue
            clean[k_str] = sanitize_mongo_dict(v)
        return clean
    elif isinstance(data, list):
        return [sanitize_mongo_dict(item) for item in data]
    return data

def get_lan_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"

def generate_clean_code(quizzes_col=None) -> str:
    for _ in range(25):
        cand = str(random.randint(100000, 999999))
        fp = os.path.join(SHARED_QUIZZES_DIR, f"{cand}.json")
        if os.path.exists(fp):
            continue
        if quizzes_col is not None:
            try:
                if quizzes_col.find_one({"code": cand}):
                    continue
            except Exception:
                pass
        return cand
    return str(int(time.time()))[-6:]

# ==============================================================================
# AUTH REQUEST MODELS & ENDPOINTS (Simple Login & Logout)
# ==============================================================================
class AuthPayload(BaseModel):
    username: str
    password: str

class QuizSavePayload(BaseModel):
    username: Optional[str] = None
    quiz: Dict[str, Any]

class QuizImportPayload(BaseModel):
    code: str
    username: Optional[str] = None
    section: Optional[str] = None

class QuizDeletePayload(BaseModel):
    id: str
    username: Optional[str] = None

class QuizUpdatePayload(BaseModel):
    id: str
    username: Optional[str] = None
    title: Optional[str] = None
    section: Optional[str] = None

@app.post("/api/auth/login")
def auth_login_endpoint(payload: AuthPayload):
    users_col, quizzes_col = get_mongo()
    if users_col is None:
        raise HTTPException(status_code=503, detail="MongoDB is currently offline or unreachable. Check internet connection.")

    uname = sanitize_username(payload.username)
    pwd = (payload.password or "").strip()

    if len(pwd) < 3 or len(pwd) > 128:
        raise HTTPException(status_code=400, detail="Password must be between 3 and 128 characters.")

    check_login_rate_limit(uname)

    user = users_col.find_one({"username": uname})
    if user:
        if not verify_password(user.get("password_hash", ""), pwd):
            record_failed_login(uname)
            raise HTTPException(status_code=401, detail="Incorrect password for this user ID.")
        
        # Upgrade to PBKDF2 if was legacy
        if user.get("password_hash") != hash_password(pwd):
            users_col.update_one({"username": uname}, {"$set": {"password_hash": hash_password(pwd)}})
    else:
        # Simple auto-registration on first login
        users_col.insert_one({
            "username": uname,
            "password_hash": hash_password(pwd),
            "created_at": time.time(),
            "created_at_str": time.strftime("%Y-%m-%d %H:%M:%S")
        })

    clear_failed_login(uname)

    # Cryptographically secure random session token
    token = secrets.token_hex(32)
    users_col.update_one({"username": uname}, {"$set": {"session_token": token, "last_login": time.time()}})

    cloud_count = quizzes_col.count_documents({"username": uname}) if quizzes_col is not None else 0

    return {
        "success": True,
        "username": uname,
        "token": token,
        "cloud_quizzes": cloud_count,
        "message": f"Welcome, {uname}!"
    }

@app.post("/api/auth/register")
def auth_register_endpoint(payload: AuthPayload):
    users_col, _ = get_mongo()
    if users_col is None:
        raise HTTPException(status_code=503, detail="MongoDB is currently offline or unreachable.")

    uname = sanitize_username(payload.username)
    pwd = (payload.password or "").strip()

    if len(pwd) < 3 or len(pwd) > 128:
        raise HTTPException(status_code=400, detail="Password must be between 3 and 128 characters.")

    existing = users_col.find_one({"username": uname})
    if existing:
        raise HTTPException(status_code=400, detail=f"User ID '{uname}' already exists. Please login instead.")

    token = secrets.token_hex(32)
    users_col.insert_one({
        "username": uname,
        "password_hash": hash_password(pwd),
        "session_token": token,
        "created_at": time.time(),
        "created_at_str": time.strftime("%Y-%m-%d %H:%M:%S")
    })

    return {
        "success": True,
        "username": uname,
        "token": token,
        "cloud_quizzes": 0,
        "message": f"Account '{uname}' registered successfully!"
    }

@app.get("/api/auth/me")
def auth_me_endpoint(username: str = Query(...)):
    users_col, quizzes_col = get_mongo()
    uname = sanitize_username(username)
    if users_col is None:
        return {"online": False, "username": uname, "cloud_quizzes": 0}

    user = users_col.find_one({"username": uname}, {"password_hash": 0, "_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User ID not found.")

    count = quizzes_col.count_documents({"username": uname}) if quizzes_col is not None else 0
    return {
        "online": True,
        "username": uname,
        "cloud_quizzes": count
    }

# ==============================================================================
# CLOUD QUIZ ENDPOINTS (Save, Sync, Share, Import to ID)
# ==============================================================================
@app.post("/api/quiz/save")
def save_quiz_to_cloud(payload: QuizSavePayload):
    _, quizzes_col = get_mongo()
    if not payload.quiz or not isinstance(payload.quiz, dict):
        raise HTTPException(status_code=400, detail="Invalid quiz payload.")

    quiz_data = sanitize_mongo_dict(payload.quiz)
    username = sanitize_username(payload.username) if payload.username else None

    raw_id = str(quiz_data.get("id") or quiz_data.get("storageId") or f"quiz_{int(time.time()*1000)}")
    storage_id = re.sub(r'[^a-zA-Z0-9_\-]', '', raw_id)[:64]
    quiz_data["id"] = storage_id
    quiz_data["storageId"] = storage_id

    # Assign or retain 6-digit short code
    code = str(quiz_data.get("code") or quiz_data.get("share_code") or "").strip()
    if not code or len(code) < 4:
        code = generate_clean_code(quizzes_col)
    else:
        code = sanitize_code(code)

    quiz_data["code"] = code
    quiz_data["share_code"] = code
    quiz_data["updated_at"] = time.time()
    if username:
        quiz_data["username"] = username

    saved_to_mongo = False
    if quizzes_col is not None:
        try:
            doc_to_save = dict(quiz_data)
            doc_to_save.pop("_id", None)
            
            existing = None
            if username:
                if code and len(code) >= 4:
                    existing = quizzes_col.find_one({"code": code, "username": username})
                if not existing and storage_id:
                    existing = quizzes_col.find_one({"id": storage_id, "username": username})
            else:
                if code and len(code) >= 4:
                    existing = quizzes_col.find_one({"code": code})
                if not existing and storage_id:
                    existing = quizzes_col.find_one({"id": storage_id})

            if existing:
                quizzes_col.replace_one({"_id": existing["_id"]}, doc_to_save)
            else:
                quizzes_col.insert_one(doc_to_save)
            saved_to_mongo = True
        except Exception as e:
            print(f"[MongoDB] Save error: {e}")

    # Also backup to local shared quizzes file
    try:
        local_fp = os.path.join(SHARED_QUIZZES_DIR, f"{code}.json")
        with open(local_fp, "w", encoding="utf-8") as f:
            json.dump(quiz_data, f, ensure_ascii=False, indent=2)
    except Exception:
        pass

    lan_ip = get_lan_ip()
    return {
        "success": True,
        "code": code,
        "id": storage_id,
        "saved_to_mongo": saved_to_mongo,
        "share_url": f"http://{lan_ip}:8000/?quiz={code}",
        "local_url": f"http://localhost:8000/?quiz={code}"
    }

@app.get("/api/user/quizzes")
def get_user_quizzes(username: str = Query(...)):
    _, quizzes_col = get_mongo()
    uname = sanitize_username(username)
    if quizzes_col is None:
        return {"quizzes": [], "mongo": "offline"}

    try:
        cursor = quizzes_col.find({"username": uname}, {"_id": 0}).sort("updated_at", -1)
        quizzes = list(cursor)
        return {
            "success": True,
            "username": uname,
            "quizzes": quizzes,
            "total": len(quizzes)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cloud quizzes: {e}")

@app.post("/api/quiz/share")
def share_quiz_endpoint(quiz: Dict[str, Any]):
    if not quiz or not isinstance(quiz, dict):
        raise HTTPException(status_code=400, detail="Invalid quiz data")

    quiz_data = sanitize_mongo_dict(quiz)
    _, quizzes_col = get_mongo()
    code = str(quiz_data.get("code") or quiz_data.get("share_code") or "").strip()
    if not code or len(code) < 4:
        code = generate_clean_code(quizzes_col)
    else:
        code = sanitize_code(code)

    quiz_data["code"] = code
    quiz_data["share_code"] = code
    quiz_data["shared_at"] = time.strftime("%Y-%m-%d %H:%M:%S")

    # Retain or set username if present
    uname = sanitize_username(quiz_data.get("username")) if quiz_data.get("username") else None
    if uname:
        quiz_data["username"] = uname
    elif quizzes_col is not None:
        try:
            prev = quizzes_col.find_one({"code": code}, {"username": 1})
            if prev and prev.get("username"):
                quiz_data["username"] = prev["username"]
        except Exception:
            pass

    # Save to MongoDB if available
    if quizzes_col is not None:
        try:
            doc = dict(quiz_data)
            doc.pop("_id", None)
            quizzes_col.replace_one({"code": code}, doc, upsert=True)
        except Exception as e:
            print(f"[MongoDB] Share error: {e}")

    # Save to local file
    try:
        file_path = os.path.join(SHARED_QUIZZES_DIR, f"{code}.json")
        with open(file_path, "w", encoding="utf-8") as f:
            json.dump(quiz_data, f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[Local Share] File save error: {e}")

    lan_ip = get_lan_ip()
    return {
        "code": code,
        "share_url": f"http://{lan_ip}:8000/?quiz={code}",
        "local_url": f"http://localhost:8000/?quiz={code}",
        "title": quiz_data.get("title", "Video Quiz"),
        "total_questions": len(quiz_data.get("questions", []))
    }

@app.get("/api/quiz/shared/{code}")
def get_shared_quiz_endpoint(code: str):
    clean_code = sanitize_code(code)

    # 1. First look up from MongoDB
    _, quizzes_col = get_mongo()
    if quizzes_col is not None:
        try:
            doc = quizzes_col.find_one({"code": clean_code}, {"_id": 0})
            if doc:
                return doc
        except Exception:
            pass

    # 2. Fallback to local files
    file_path = os.path.join(SHARED_QUIZZES_DIR, f"{clean_code}.json")
    if not os.path.exists(file_path):
        matches = glob.glob(os.path.join(SHARED_QUIZZES_DIR, "*.json"))
        matched_file = None
        for m in matches:
            base_name = os.path.splitext(os.path.basename(m))[0].upper()
            if base_name == clean_code:
                matched_file = m
                break
        if matched_file:
            file_path = matched_file
        else:
            raise HTTPException(status_code=404, detail=f"Quiz code '{code}' not found.")

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read shared quiz: {e}")

@app.post("/api/quiz/import_code")
def import_quiz_by_code(payload: QuizImportPayload):
    clean_code = sanitize_code(payload.code)

    _, quizzes_col = get_mongo()
    quiz_data = None

    # Search MongoDB
    if quizzes_col is not None:
        try:
            quiz_data = quizzes_col.find_one({"code": clean_code}, {"_id": 0})
        except Exception:
            pass

    # Fallback to local file
    if not quiz_data:
        file_path = os.path.join(SHARED_QUIZZES_DIR, f"{clean_code}.json")
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    quiz_data = json.load(f)
            except Exception:
                pass

    if not quiz_data:
        raise HTTPException(status_code=404, detail=f"Quiz code '{payload.code}' not found.")

    username = sanitize_username(payload.username) if payload.username else None
    saved_to_cloud = False

    # If user on this device is logged in, link/save this quiz to their MongoDB account!
    if username and quizzes_col is not None:
        try:
            new_storage_id = f"quiz_{int(time.time()*1000)}"
            clone_doc = dict(quiz_data)
            clone_doc["id"] = new_storage_id
            clone_doc["storageId"] = new_storage_id
            clone_doc["username"] = username
            if payload.section:
                clean_sec = re.sub(r'[^\w\s\-_]', '', str(payload.section))[:50].strip()
                clone_doc["section"] = clean_sec or "General"
            clone_doc["updated_at"] = time.time()
            clone_doc["savedAt"] = time.strftime("%b %d, %Y")
            clone_doc.pop("_id", None)

            quizzes_col.replace_one(
                {"id": new_storage_id, "username": username},
                clone_doc,
                upsert=True
            )
            quiz_data = clone_doc
            saved_to_cloud = True
        except Exception as e:
            print(f"[MongoDB] Import save to user error: {e}")

    return {
        "success": True,
        "quiz": quiz_data,
        "saved_to_cloud": saved_to_cloud,
        "username": username
    }

@app.delete("/api/quiz/delete")
def delete_quiz_endpoint(payload: QuizDeletePayload):
    _, quizzes_col = get_mongo()
    username = sanitize_username(payload.username) if payload.username else None
    clean_id = re.sub(r'[^a-zA-Z0-9_\-]', '', str(payload.id))[:64]
    if quizzes_col is not None and username and clean_id:
        try:
            quizzes_col.delete_one({"id": clean_id, "username": username})
            return {"success": True, "message": "Deleted from cloud"}
        except Exception as e:
            print(f"[MongoDB] Delete error: {e}")
    return {"success": True}

@app.put("/api/quiz/update")
def update_quiz_endpoint(payload: QuizUpdatePayload):
    _, quizzes_col = get_mongo()
    username = sanitize_username(payload.username) if payload.username else None
    clean_id = re.sub(r'[^a-zA-Z0-9_\-]', '', str(payload.id))[:64]
    if quizzes_col is not None and username and clean_id:
        try:
            update_fields = {}
            if payload.title:
                update_fields["title"] = html.escape(str(payload.title).strip())[:120]
            if payload.section:
                update_fields["section"] = re.sub(r'[^\w\s\-_]', '', str(payload.section))[:50].strip()
            if update_fields:
                update_fields["updated_at"] = time.time()
                quizzes_col.update_one(
                    {"id": clean_id, "username": username},
                    {"$set": update_fields}
                )
            return {"success": True}
        except Exception as e:
            print(f"[MongoDB] Update error: {e}")
    return {"success": True}

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
    return FileResponse(
        p,
        media_type="application/javascript",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

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
            return FileResponse(
                c,
                headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
            )
    return {"message": "YouTube Transcript Pro API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
