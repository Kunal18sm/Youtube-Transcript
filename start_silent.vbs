Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\yash9\OneDrive\Desktop\transcript"
WshShell.Run "cmd /c python start_server.py", 0, False
