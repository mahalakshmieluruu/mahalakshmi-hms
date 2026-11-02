Write-Host "Starting Mahalakshmi Hospital Management System (Eluru)..." -ForegroundColor Cyan

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\hp\.gemini\antigravity\scratch\mahalakshmi-hms\backend'; java -jar target\mahalakshmi-hms-1.0.0.jar"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location 'C:\Users\hp\.gemini\antigravity\scratch\mahalakshmi-hms\frontend'; npm run dev"

Write-Host "Backend API running on: http://localhost:8080" -ForegroundColor Green
Write-Host "Frontend UI running on: http://localhost:5173" -ForegroundColor Green
