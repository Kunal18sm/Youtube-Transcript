# 🎬 YouTube Transcript Pro

Ek powerful, 100% FREE aur super-fast YouTube Transcript Generator tool jo **2 se 5 ghante tak ki lambi videos** ka bhi pura transcript seconds me nikaal deta hai.

---

## ✨ Features

- ⚡ **Super Fast & Unlimited:** 4+ ghante ki video ka transcript bhi 2 se 3 second me ready.
- ⏱️ **Clickable Timestamps:** Kisi bhi timestamp par click karne par video seedha us point se play hone lagti hai.
- 📝 **Multiple View Modes:**
  - **Timeline View:** Timestamp ke sath segment by segment.
  - **Paragraph View:** Clean readable paragraphs me formatted.
  - **Raw Text View:** AI summary ya reading ke liye continuous text.
- 🔍 **Live Search:** Poore transcript me kisi bhi keyword ko live search aur highlight kare.
- 🤖 **1-Click AI Prompt:** ChatGPT aur Claude ke liye ready-made prompt copy kare (summary & key takeaways ke sath).
- 💾 **Export Options:**
  - Copy to Clipboard
  - Download as `.txt` (Text file)
  - Download as `.srt` (Video editing subtitle format)
  - Download as `.json` (Full developer data)
- 🌐 **Multi-Language & Hindi Support:** Agar video me Hindi ya doosri bhashayein hain, to dropdown se select karein.
- 💻 **CLI Support:** Terminal se direct script chalakar file save karne ki suvidha.

---

## 🚀 Kaise Start Karein (How to Run)

### Render par YouTube transcript issue

Render ka free server cloud data-center IP se YouTube ko request karta hai, jise YouTube kabhi-kabhi block kar deta hai. Project ki local `.env` file Render par upload nahi hoti. Isliye Render dashboard me service ke **Environment** section me `YOUTUBE_COOKIES` set karein, phir service redeploy karein. `render.yaml` is variable ko blueprint deploy ke waqt prompt karne ke liye declare karta hai.

Cookie value apne browser se YouTube ke liye export ki hui cookies honi chahiye; ise public repository me commit ya kisi ke saath share na karein. Cookies expire ho sakti hain, to kaam band hone par nayi cookies export karke Render me update karein. YouTube ki blocking policy ke kaaran koi guaranteed, permanently free server-side bypass nahi hai.

### Tarika 1: 1-Click Launch (Sabse Aasan)
Apne folder me maujood **`run.bat`** file par double-click karein:
1. Server automatically start ho jayega.
2. Aapka browser `http://127.0.0.1:8000` par khul jayega.

---

### Tarika 2: Terminal / Command Prompt se

```bash
# 1. Dependencies install karein (agar pehle nahi kiya hai)
python -m pip install -r requirements.txt

# 2. Server start karein
python -m uvicorn app:app --port 8000
```
Iske baad browser me kholein: **`http://127.0.0.1:8000`**

---

### Tarika 3: CLI Mode (Bina Browser Khole Terminal se Save Karein)

Aap seedhe terminal se bhi kisi bhi video ka transcript save kar sakte hain:

```bash
# Preview dekhne ke liye:
python cli.py "https://www.youtube.com/watch?v=VIDEO_ID"

# Text file me save karne ke liye:
python cli.py "https://www.youtube.com/watch?v=VIDEO_ID" --save transcript.txt

# SRT Subtitle file me save karne ke liye:
python cli.py "https://www.youtube.com/watch?v=VIDEO_ID" --srt --save subtitles.srt
```

---

## 📁 Project Structure

- `app.py` — FastAPI backend (YouTube Transcript Engine & APIs)
- `cli.py` — Terminal/Command-line tool
- `run.bat` — Windows 1-click double-click launcher
- `static/index.html` — Sleek, responsive modern UI
- `static/app.js` — Client-side logic, YouTube sync, Search & Exports
- `static/styles.css` — Custom styling and animations
- `requirements.txt` — Python dependencies
