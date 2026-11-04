Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\yash9\OneDrive\Desktop\transcript"
WshShell.Run """C:\Program Files\Python314\pythonw.exe"" start_server.py", 0, False
