# Chronos one-click startup script (Windows PowerShell)

# Set the API token for the backend
$TOKEN = "chronos-dev-token"
$env:CHRONOS_API_TOKEN = $TOKEN

# Activate the Python virtual environment (assumes .venv in repo root)
& "$PSScriptRoot\.venv\Scripts\Activate.ps1"

# Start the FastAPI backend (uvicorn) in a new terminal window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
cd '$PSScriptRoot'
python -m uvicorn main:app --host 127.0.0.1 --port 8000
"

Start-Sleep -Seconds 3

# Start the Cloudflare tunnel in a new terminal window
$cloudflaredLog = Join-Path $PSScriptRoot "cloudflared.log"
if (Test-Path $cloudflaredLog) {
  Remove-Item $cloudflaredLog
}
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
& 'C:\Users\ajmva\bin\cloudflared.exe' tunnel --url http://localhost:8000 2>&1 | Tee-Object -FilePath '$cloudflaredLog'
"

# Wait for the Cloudflare URL and update the UI API base URL
$cloudflareUrl = $null
while (-not $cloudflareUrl) {
  if (Test-Path $cloudflaredLog) {
    $cloudflaredOutput = Get-Content $cloudflaredLog -Raw
    $cloudflareUrl = [regex]::Match($cloudflaredOutput, "https://.*trycloudflare\.com").Value
  }
  if (-not $cloudflareUrl) {
    Start-Sleep -Seconds 1
  }
}

$apiPath = Join-Path $PSScriptRoot "chronos-ui\src\api.js"
$apiContents = Get-Content $apiPath -Raw
$updatedApiContents = $apiContents -replace 'const BASE_URL = ".*";', "const BASE_URL = `"$cloudflareUrl`";"
Set-Content -Path $apiPath -Value $updatedApiContents

# Start the React UI in a new terminal window
Start-Process powershell -ArgumentList "-NoExit", "-Command", "
cd '$PSScriptRoot\chronos-ui'
npm run dev
"

# Open the UI in the default browser
Start-Process "http://localhost:5173"
