import os
import sys
from typing import Optional

# Ensure parent directory is in path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app import get_transcript_data

app = FastAPI(title="YouTube Transcript API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/transcript")
@app.get("/api/transcript")
def transcript_route(
    url: str = Query(..., description="YouTube URL or Video ID"),
    lang: Optional[str] = Query(None, description="Language code")
):
    return get_transcript_data(url, lang)
