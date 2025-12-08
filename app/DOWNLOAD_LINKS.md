# CrushIT App - Required Downloads for Emulator Testing

## 📥 Direct Download Links

### Essential (Required)

#### 1. Android Studio (Android Emulator + SDK)
- **Download:** https://developer.android.com/studio
- **Size:** ~1 GB download, ~3-4 GB installed
- **Includes:** Android SDK, AVD Manager, Emulator
- **Purpose:** Run Android emulator for testing

**Direct Links by OS:**
- Windows: https://redirector.gvt1.com/edgedl/android/studio/install/2023.1.1.28/android-studio-2023.1.1.28-windows.exe
- Mac (Intel): https://redirector.gvt1.com/edgedl/android/studio/install/2023.1.1.28/android-studio-2023.1.1.28-mac.dmg
- Mac (Apple Silicon): https://redirector.gvt1.com/edgedl/android/studio/install/2023.1.1.28/android-studio-2023.1.1.28-mac_arm.dmg

---

#### 2. Java Development Kit (JDK 17) - For APK Builds
- **Download:** https://adoptium.net/temurin/releases/
- **Size:** ~200 MB
- **Version:** JDK 17 (LTS)
- **Purpose:** Required for building APK files

**Direct Links:**
- Windows x64: https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.9_9.msi
- Windows x86: https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_x86-32_windows_hotspot_17.0.9_9.msi
- Mac: https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_x64_mac_hotspot_17.0.9_9.pkg

---

### Optional (Convenience)

#### 3. Expo Go App (For Phone Testing)
- **Already using this!** ✅
- **Android:** https://play.google.com/store/apps/details?id=host.exp.exponent
- **iOS:** https://apps.apple.com/app/expo-go/id982107779
- **Size:** ~30 MB
- **Purpose:** Test app on real phone instantly

---

#### 4. Visual Studio Code (If not installed)
- **Download:** https://code.visualstudio.com/
- **Size:** ~100 MB
- **Purpose:** Code editor (you likely have this)

---

## 🚀 Quick Setup Guide

### Step 1: Install Android Studio
1. Download Android Studio from link above
2. Run installer
3. Follow wizard, select:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Android Virtual Device
   - ✅ Performance (Intel HAXM)
4. Wait for installation (~30 minutes)

### Step 2: Create Android Virtual Device
1. Open Android Studio
2. Click "More Actions" → "Virtual Device Manager"
3. Click "+ Create Device"
4. Select: **Pixel 5** or **Pixel 7**
5. Click "Next"
6. Download: **Android 13 (Tiramisu) - API 33**
7. Click "Download" → Wait (~2 GB download)
8. Click "Next" → "Finish"

### Step 3: Configure Environment (Windows)
```powershell
# Add to System PATH:
# Press Win + X → System → Advanced → Environment Variables
# Edit "Path" variable, add these lines:

C:\Users\<YourUsername>\AppData\Local\Android\Sdk\platform-tools
C:\Users\<YourUsername>\AppData\Local\Android\Sdk\emulator
```

### Step 4: Test Emulator
1. Open Android Studio
2. Click "Device Manager" (phone icon on right)
3. Click ▶ (Play button) next to your device
4. Wait for Android to boot (~2 minutes first time)
5. You should see Android home screen

### Step 5: Run Your App
```powershell
# In your CrushIT app folder:
cd "d:\Dilip\CrushIT\app"

# Start with Android emulator:
npx expo start --android

# OR use the menu script:
start-emulator.bat
# Then select option 2
```

---

## 📱 Alternative: Use Your Phone (Easiest!)

**No downloads needed - you're already doing this!**

1. Install Expo Go from Play Store/App Store
2. Run: `cd "d:\Dilip\CrushIT\app" && npm start`
3. Scan QR code with Expo Go app
4. Done! ✅

---

## 🔧 APK Build (For Sharing)

### Option A: Cloud Build (Easiest)
```powershell
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
cd "d:\Dilip\CrushIT\app"
eas build -p android --profile preview

# Wait ~15 minutes, download APK from link
```

### Option B: Local Build
```powershell
# Install JDK 17 first (see link above)

# Build locally
cd "d:\Dilip\CrushIT\app"
npx expo run:android

# APK location:
# android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 📊 Download Size Summary

| Component | Download | Installed | Time |
|-----------|----------|-----------|------|
| Android Studio | 1 GB | 4 GB | 30 min |
| Android 13 Image | 2 GB | 5 GB | 10 min |
| JDK 17 | 200 MB | 300 MB | 5 min |
| **Total** | **3.2 GB** | **9.3 GB** | **45 min** |

---

## ✅ Installation Checklist

### Before Starting
- [ ] 10 GB free disk space
- [ ] Stable internet connection
- [ ] Administrator access on Windows

### Downloads
- [ ] Android Studio installed
- [ ] JDK 17 installed (optional, for APK builds)
- [ ] Expo Go on phone (already done ✅)

### Configuration
- [ ] Android SDK in PATH
- [ ] Created AVD (Pixel 5/7 with Android 13)
- [ ] Tested emulator starts
- [ ] Environment variables configured

### Testing
- [ ] Emulator boots successfully
- [ ] Run `npx expo start --android`
- [ ] App opens in emulator
- [ ] Login works (user@example.com / password123)
- [ ] Can navigate between tabs

---

## 🆘 Troubleshooting Links

### If downloads are slow:
- **Android Studio Mirrors:** 
  - China: https://developer.android.google.cn/studio
  - India: Use VPN or proxy

### If you get errors:
- **Stack Overflow:** https://stackoverflow.com/questions/tagged/android-emulator
- **Expo Forums:** https://forums.expo.dev/
- **React Native Docs:** https://reactnative.dev/docs/environment-setup

### If emulator is slow:
- **Enable Virtualization in BIOS** (Intel VT-x or AMD-V)
- **Install HAXM:** https://github.com/intel/haxm/releases
- **Increase RAM:** Edit AVD → Show Advanced → RAM: 4096 MB

---

## 🎯 Recommended: Just Use Expo Go!

**You don't need to download anything!** Your current setup with Expo Go is perfect for development:

✅ **Pros:**
- Instant updates (no rebuild needed)
- Test on real device
- Full feature access
- No setup time

❌ **Only download Android Studio if:**
- You need to test on specific Android versions
- You want to debug without phone nearby
- You're preparing for Play Store release
- You need to test device-specific features

---

## 📞 Quick Commands Reference

```powershell
# Check if Android SDK is installed
adb version

# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_33

# Check connected devices
adb devices

# Install APK on device
adb install path\to\app.apk

# Start app on Android
npx expo start --android

# Start app on web browser
npx expo start --web

# Clear cache and restart
npx expo start -c
```

---

**Bottom Line:** 
- **For quick testing:** Keep using Expo Go (what you have now) ✅
- **For professional testing:** Download Android Studio (~4 GB, 45 min setup)
- **For distribution:** Build APK with EAS (no downloads needed, builds in cloud)

**Total Downloads if you want emulator: 3.2 GB**
**Setup time: 45-60 minutes**
