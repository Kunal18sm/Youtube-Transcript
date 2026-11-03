import sys
import argparse
from app import extract_video_id, get_transcript, fetch_oembed_metadata

def main():
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except Exception:
            pass

    parser = argparse.ArgumentParser(description="YouTube Transcript Pro CLI — Extract transcripts with timestamps")
    parser.add_argument("url", help="YouTube video URL or Video ID")
    parser.add_argument("--lang", default=None, help="Preferred language code (e.g. en, hi)")
    parser.add_argument("--save", default=None, help="Save transcript to specified file path (.txt, .srt, .json)")
    parser.add_argument("--srt", action="store_true", help="Output in SRT subtitle format")
    parser.add_argument("--no-time", action="store_true", help="Output plain text without timestamps")

    args = parser.parse_args()

    video_id = extract_video_id(args.url)
    if not video_id:
        print("[!] Error: Invalid YouTube URL or ID.")
        sys.exit(1)

    print(f"[*] Fetching transcript for video: {video_id}...")
    try:
        data = get_transcript(args.url, lang=args.lang)
    except Exception as e:
        print(f"[!] Error: {e}")
        sys.exit(1)

    print(f"[+] Title: {data['title']}")
    print(f"[+] Channel: {data['author']}")
    print(f"[+] Duration: {data['formatted_duration']} ({data['total_words']} words, {data['total_snippets']} segments)")
    print(f"[+] Language: {data['language']} ({data['language_code']})\n")

    if args.srt:
        output_content = data["srt_content"]
    elif getattr(args, "no_time", False):
        output_content = data["plain_text"]
    else:
        output_content = data["timestamped_text"]

    if args.save:
        with open(args.save, "w", encoding="utf-8") as f:
            f.write(output_content)
        print(f"[+] Successfully saved to: {args.save}")
    else:
        # Print preview
        lines = output_content.splitlines()
        print("--- Transcript Preview (First 20 lines) ---")
        for line in lines[:20]:
            print(line)
        if len(lines) > 20:
            print(f"... [{len(lines) - 20} more lines. Use --save file.txt to save all]")

if __name__ == "__main__":
    main()
