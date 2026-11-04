import re
import html
import os
import tempfile
import glob
from typing import Optional, List, Dict, Any
import requests
import yt_dlp
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
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
