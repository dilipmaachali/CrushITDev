@echo off
echo ========================================
echo CrushIT App - Starting Backend + Frontend
echo ========================================
echo.

echo [1/2] Starting Backend Server on http://localhost:4000
start "CrushIT Backend" cmd /k "cd /d E:\Dilip\CrushIT\backend && npm run dev"

echo Waiting for backend to start...
timeout /t 8 /nobreak >nul

echo.
echo [2/2] Starting Frontend App
echo Scan QR code with Expo Go app on your phone
echo.
cd /d "E:\Dilip\CrushIT\app"
npx expo start
