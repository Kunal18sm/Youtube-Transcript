import sys
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)
sys.path.insert(0, script_dir)

log_path = os.path.join(script_dir, "server.log")
log_file = open(log_path, "a", encoding="utf-8", buffering=1)
sys.stdout = log_file
sys.stderr = log_file

import uvicorn

if __name__ == "__main__":
    try:
        uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False, log_level="info")
    except Exception as e:
        log_file.write(f"Error starting server: {e}\n")
        log_file.flush()
