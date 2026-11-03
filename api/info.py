import os
import sys

# Ensure parent directory is in path
root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from app import get_video_info_data

app = FastAPI(title="YouTube Info API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
@app.get("/info")
@app.get("/api/info")
def info_route(url: str = Query(..., description="YouTube URL or Video ID")):
    return get_video_info_data(url)
