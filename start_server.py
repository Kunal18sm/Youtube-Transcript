import sys
import os

log_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "server.log")
log_file = open(log_path, "a", encoding="utf-8")
if sys.stdout is None:
    sys.stdout = log_file
if sys.stderr is None:
    sys.stderr = log_file

script_dir = os.path.dirname(os.path.abspath(__file__))
os.chdir(script_dir)
sys.path.insert(0, script_dir)

import uvicorn

if __name__ == "__main__":
    try:
        uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=False, log_level="info")
    except Exception as e:
        log_file.write(f"Error starting server: {e}\n")
        log_file.flush()
