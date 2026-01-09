# Chronos one-click startup script (Windows PowerShell)

# Set the API token for the backend
$env:CHRONOS_API_TOKEN = "chronos-dev-token"

# Activate the Python virtual environment (assumes .venv in repo root)
& "$PSScriptRoot\.venv\Scripts\Activate.ps1"

# Start the FastAPI backend (uvicorn) in a new terminal window
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd $PSScriptRoot; python -m uvicorn main:app --host 127.0.0.1 --port 8000'

# Start the Cloudflare tunnel in a new terminal window
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd $PSScriptRoot; & "C:\Users\ajmva\bin\cloudflared.exe" tunnel --url http://localhost:8000'

# Start the React UI in a new terminal window
Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd $PSScriptRoot\chronos-ui; npm run dev'

# Open the UI in the default browser
Start-Process "http://localhost:5173"
