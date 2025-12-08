@echo off
echo ========================================
echo CrushIT Backend Server Startup
echo ========================================
echo.

cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo Starting backend on http://localhost:4000
echo Also accessible on your network at http://YOUR_IP:4000
echo.
echo Test credentials:
echo   Email: user@example.com
echo   Password: password123
echo.
echo Press Ctrl+C to stop
echo.

call npm run dev
