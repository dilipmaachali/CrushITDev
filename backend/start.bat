@echo off
echo ========================================
echo Starting CrushIT Backend Server
echo ========================================
echo.
echo Server will run on: http://localhost:4000
echo Test credentials:
echo   Email: user@example.com
echo   Password: password123
echo.
echo Press Ctrl+C to stop the server
echo.

cd /d "e:\Dilip\CrushIT\backend"
npm run dev

pause
