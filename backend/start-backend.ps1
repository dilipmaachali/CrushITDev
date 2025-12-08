# Start Backend Server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting CrushIT Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "$PSScriptRoot"

# Get network IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress

Write-Host "Backend will be accessible at:" -ForegroundColor Yellow
Write-Host "  Local:   http://localhost:4000" -ForegroundColor Green
Write-Host "  Network: http://${ip}:4000" -ForegroundColor Green
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Yellow
Write-Host "  Email: user@example.com" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host ""
Write-Host "Update this IP in app/src/config/api.ts if different: $ip" -ForegroundColor Magenta
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

npm run dev
