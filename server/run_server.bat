@echo off
echo Starting CreatorIQ Backend Engine...
cd /d "%~dp0"
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --port 8000
pause
