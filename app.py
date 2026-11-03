import re
import html
from typing import Optional, List, Dict, Any
import requests
from fastapi import FastAPI, HTTPException, Query
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, PlainTextResponse
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

# Enable CORS
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
    # Check if raw 11-char ID
    if re.match(r'^[a-zA-Z0-9_-]{11}$', clean):
        return clean
    
    # Check common YouTube URL patterns
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

def fetch_oembed_metadata(video_id: str) -> Dict[str, Any]:
    """Fetch video title, author, thumbnail using public oEmbed."""
    try:
        url = f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json"
        res = requests.get(url, timeout=5)
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

@app.get("/api/info")
@app.get("/info")
def get_video_info(url: str = Query(..., description="YouTube URL or Video ID")):
    """Get video metadata and list of available transcript languages."""
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL or Video ID. Please check the link.")
    
    meta = fetch_oembed_metadata(video_id)
    
    api = YouTubeTranscriptApi()
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
        raise HTTPException(status_code=429, detail="YouTube is rate-limiting requests. Please try again in a few moments.")
    except Exception as e:
        err = str(e)
        if "no longer available" in err.lower():
            raise HTTPException(status_code=404, detail="This video is no longer available or is private.")
        if "subtitles are disabled" in err.lower():
            raise HTTPException(status_code=404, detail="Subtitles/Captions are disabled for this video.")
        raise HTTPException(status_code=500, detail=f"Could not retrieve transcripts: {err.splitlines()[0] if err.splitlines() else err}")

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

@app.get("/api/transcript")
@app.get("/transcript")
def get_transcript(
    url: str = Query(..., description="YouTube URL or Video ID"),
    lang: Optional[str] = Query(None, description="Preferred language code (e.g., 'en', 'hi')")
):
    """Fetch complete transcript with timestamps, word stats, and formatted outputs."""
    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL or Video ID.")
    
    meta = fetch_oembed_metadata(video_id)
    api = YouTubeTranscriptApi()

    try:
        transcript_list = api.list(video_id)
    except TranscriptsDisabled:
        raise HTTPException(status_code=404, detail="Captions/Subtitles are disabled for this video.")
    except NoTranscriptFound:
        raise HTTPException(status_code=404, detail="No transcript found for this video.")
    except RequestBlocked:
        raise HTTPException(status_code=429, detail="YouTube temporarily throttled requests. Try again shortly.")
    except Exception as e:
        err = str(e)
        if "no longer available" in err.lower():
            raise HTTPException(status_code=404, detail="This video is no longer available or is private.")
        if "subtitles are disabled" in err.lower():
            raise HTTPException(status_code=404, detail="Subtitles/Captions are disabled for this video.")
        raise HTTPException(status_code=500, detail=f"Failed to query transcripts: {err.splitlines()[0] if err.splitlines() else err}")

    # Language selection logic
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
            # If specified lang not found directly, check if we can translate
            try:
                # Find any transcript that is translatable
                for t in transcript_list:
                    if t.is_translatable:
                        target_transcript = t.translate(lang)
                        break
            except Exception:
                pass
    
    if not target_transcript:
        # Default priority: manually created en, then hi, then any manual, then auto
        try:
            target_transcript = transcript_list.find_manually_created_transcript(['en', 'hi'])
        except Exception:
            try:
                target_transcript = transcript_list.find_generated_transcript(['en', 'hi'])
            except Exception:
                # Fallback to the first available transcript
                target_transcript = next(iter(transcript_list), None)
    
    if not target_transcript:
        raise HTTPException(status_code=404, detail="No suitable transcript could be found.")

    # Fetch the transcript snippets
    try:
        raw_snippets = target_transcript.fetch()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error downloading transcript snippets: {str(e)}")

    snippets = []
    plain_text_parts = []
    total_words = 0
    max_time = 0.0

    for item in raw_snippets:
        # Unescape any HTML entities like &#39; &amp; etc.
        clean_text = html.unescape(item.text).strip()
        # Clean newlines inside a single segment
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

    # Paragraph grouping (group snippets separated by less than ~2.5 seconds or until ~30-50 words)
    paragraphs = []
    current_para = []
    current_start = 0.0
    current_words = 0

    for s in snippets:
        if not current_para:
            current_start = s["start"]
        current_para.append(s["text"])
        current_words += len(s["text"].split())

        # Check if we should flush paragraph
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

    # Generate SRT format
    srt_lines = []
    for idx, s in enumerate(snippets, start=1):
        srt_lines.append(str(idx))
        srt_lines.append(f"{seconds_to_srt_time(s['start'])} --> {seconds_to_srt_time(s['end'])}")
        srt_lines.append(s["text"])
        srt_lines.append("")
    srt_content = "\n".join(srt_lines)

    # Pure plain text (continuous)
    plain_text = " ".join(plain_text_parts)

    # Plain text with timestamps
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

# Serve frontend static files
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(BASE_DIR, "public", "static")
if not os.path.exists(static_dir):
    static_dir = os.path.join(BASE_DIR, "static")

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")

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
