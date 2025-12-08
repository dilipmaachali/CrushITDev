@echo off
echo ========================================
echo CrushIT App - Emulator Launcher
echo ========================================
echo.

:menu
echo Choose an option:
echo 1. Start app with Expo Go (scan QR code)
echo 2. Start app on Android emulator
echo 3. Start backend only
echo 4. Start backend + app
echo 5. Build APK for Android
echo 6. Open Android Studio (create/start emulator)
echo 7. Check Android SDK installation
echo 8. Exit
echo.
set /p choice="Enter choice (1-8): "

if "%choice%"=="1" goto expo_go
if "%choice%"=="2" goto android_emulator
if "%choice%"=="3" goto backend_only
if "%choice%"=="4" goto backend_and_app
if "%choice%"=="5" goto build_apk
if "%choice%"=="6" goto open_studio
if "%choice%"=="7" goto check_sdk
if "%choice%"=="8" goto end
goto menu

:expo_go
echo.
echo Starting CrushIT with Expo Go...
echo Scan the QR code with Expo Go app on your phone
echo.
cd /d "d:\Dilip\CrushIT\app"
call npm start
goto end

:android_emulator
echo.
echo Starting CrushIT on Android Emulator...
echo Make sure you have created an AVD in Android Studio first!
echo.
cd /d "d:\Dilip\CrushIT\app"
call npx expo start --android
goto end

:backend_only
echo.
echo Starting Backend Server...
echo Server will run on http://localhost:4000
echo.
cd /d "d:\Dilip\CrushIT\backend"
call npm run dev
goto end

:backend_and_app
echo.
echo Starting Backend Server...
start cmd /k "cd /d d:\Dilip\CrushIT\backend && npm run dev"
timeout /t 5
echo.
echo Starting CrushIT App...
cd /d "d:\Dilip\CrushIT\app"
call npm start
goto end

:build_apk
echo.
echo Building APK...
echo This requires EAS CLI. Install with: npm install -g eas-cli
echo.
cd /d "d:\Dilip\CrushIT\app"
call eas build -p android --profile preview
goto end

:open_studio
echo.
echo Opening Android Studio...
echo If not installed, download from: https://developer.android.com/studio
echo.
start "" "C:\Program Files\Android\Android Studio\bin\studio64.exe"
if errorlevel 1 (
    echo Android Studio not found at default location.
    echo Please install it from: https://developer.android.com/studio
    pause
)
goto menu

:check_sdk
echo.
echo Checking Android SDK installation...
echo.
where adb >nul 2>nul
if %errorlevel%==0 (
    echo [OK] ADB found
    adb version
) else (
    echo [ERROR] ADB not found
    echo Please install Android Studio and configure PATH
)
echo.
where emulator >nul 2>nul
if %errorlevel%==0 (
    echo [OK] Emulator found
    echo.
    echo Available emulators:
    emulator -list-avds
) else (
    echo [ERROR] Emulator not found
    echo Please install Android Studio and configure PATH
)
echo.
where java >nul 2>nul
if %errorlevel%==0 (
    echo [OK] Java found
    java -version
) else (
    echo [WARNING] Java not found (needed for APK builds)
    echo Download from: https://adoptium.net/temurin/releases/
)
echo.
pause
goto menu

:end
echo.
echo Goodbye!
pause
