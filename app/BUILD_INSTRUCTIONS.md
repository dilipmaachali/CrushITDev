# CrushIT App - Build & Testing Instructions

## 🚀 Quick Testing Options

### Option 1: Expo Go (Current Setup) ✅ EASIEST
**No installation needed!**
```powershell
cd "d:\Dilip\CrushIT\app"
npm start
# Scan QR code with Expo Go app on your phone
```

---

## 📱 Option 2: Android Emulator Setup

### Step 1: Install Android Studio
1. Download: https://developer.android.com/studio
2. Run installer (3-4 GB total)
3. During setup, ensure these are checked:
   - ✅ Android SDK
   - ✅ Android SDK Platform
   - ✅ Performance (Intel HAXM or Hyper-V)
   - ✅ Android Virtual Device

### Step 2: Configure Environment Variables
```powershell
# Add to System PATH (Windows):
# 1. Search "Environment Variables" in Windows
# 2. Edit "Path" in System Variables
# 3. Add these paths (replace <YourUsername>):

C:\Users\<YourUsername>\AppData\Local\Android\Sdk\platform-tools
C:\Users\<YourUsername>\AppData\Local\Android\Sdk\emulator
C:\Users\<YourUsername>\AppData\Local\Android\Sdk\tools\bin
```

### Step 3: Create Android Virtual Device (AVD)
1. Open Android Studio
2. Click "More Actions" → "Virtual Device Manager"
3. Click "Create Device"
4. Select: **Pixel 5** or **Pixel 7**
5. Click "Next"
6. Download System Image: **Android 13 (Tiramisu)** or **Android 14**
7. Click "Next" → "Finish"

### Step 4: Run App on Emulator
```powershell
# Start backend first
cd "d:\Dilip\CrushIT\backend"
npm start

# In new terminal, start app
cd "d:\Dilip\CrushIT\app"
npx expo start --android

# Or manually start emulator first:
# Open Android Studio → Device Manager → Click ▶ on your AVD
# Then run: npx expo start
# Press 'a' to open on Android
```

---

## 🍎 Option 3: iOS Simulator (Mac Only)

**Requirements:**
- macOS computer
- Xcode from Mac App Store

**Setup:**
```bash
# Install Xcode from Mac App Store
# Then install command line tools:
xcode-select --install

# Run app:
cd /path/to/CrushIT/app
npx expo start --ios
```

---

## 📦 Option 4: Build APK for Real Android Devices

### Using EAS Build (Expo Application Services)

#### Step 1: Install EAS CLI
```powershell
npm install -g eas-cli
```

#### Step 2: Login to Expo
```powershell
eas login
# Or create account: eas register
```

#### Step 3: Configure EAS Build
```powershell
cd "d:\Dilip\CrushIT\app"
eas build:configure
```

#### Step 4: Build APK
```powershell
# Build APK for testing (preview build)
eas build -p android --profile preview

# This will:
# 1. Upload your code to Expo servers
# 2. Build the APK in the cloud
# 3. Provide download link when done (~15-20 minutes)
```

#### Step 5: Download & Install
1. Wait for build to complete
2. Download APK from provided link
3. Transfer to Android phone
4. Install (enable "Install from Unknown Sources")

---

## 🔧 Option 5: Local APK Build (No Expo Account Needed)

### Prerequisites
```powershell
# Install Java Development Kit (JDK 17)
# Download: https://adoptium.net/temurin/releases/

# Verify installation:
java -version
```

### Build Locally
```powershell
cd "d:\Dilip\CrushIT\app"

# Create development build
npx expo run:android

# This will:
# 1. Install Android dependencies
# 2. Build APK locally
# 3. Install on connected device/emulator
```

---

## 🌐 Option 6: Web Version (Browser Testing)

```powershell
cd "d:\Dilip\CrushIT\app"
npx expo start --web

# Opens in browser at: http://localhost:8081
```

---

## 📥 SDK Downloads Summary

### Required Downloads:

| Tool | Size | Purpose | Download Link |
|------|------|---------|--------------|
| **Android Studio** | ~3-4 GB | Android emulator & SDK | https://developer.android.com/studio |
| **JDK 17** | ~200 MB | Required for builds | https://adoptium.net/temurin/releases/ |
| **Node.js** | ~50 MB | Already installed ✅ | https://nodejs.org/ |
| **Expo Go App** | ~30 MB | Testing on phone | Play Store / App Store |

### Optional Downloads:

| Tool | Size | Purpose | Download Link |
|------|------|---------|--------------|
| **Xcode** (Mac only) | ~15 GB | iOS simulator | Mac App Store |
| **Visual Studio Emulator** | ~5 GB | Alternative Android emulator | https://visualstudio.microsoft.com/ |

---

## 🎯 Recommended Approach for You

### For Quick Testing (NOW):
1. ✅ **Use Expo Go** (already working!)
   - Just scan QR code with your phone
   - Fastest way to test

### For Development (NEXT):
2. **Install Android Studio** 
   - Download: https://developer.android.com/studio
   - Create Pixel 5 emulator with Android 13
   - Run: `npx expo start --android`

### For Distribution (LATER):
3. **Build APK with EAS**
   - Run: `eas build -p android --profile preview`
   - Share APK with testers

---

## 🚀 Quick Start Script

Save this as `start-emulator.bat` in your app folder:

```batch
@echo off
echo Starting CrushIT Backend...
start cmd /k "cd /d d:\Dilip\CrushIT\backend && npm start"

timeout /t 5

echo Starting CrushIT App...
cd /d d:\Dilip\CrushIT\app
npm start
```

---

## 🔍 Troubleshooting

### Android Emulator Issues

**Problem: Emulator won't start**
```powershell
# Enable virtualization in BIOS
# Or use Hyper-V (Windows Pro)

# Check if emulator works:
emulator -list-avds
emulator -avd <avd-name>
```

**Problem: "INSTALL_FAILED_INSUFFICIENT_STORAGE"**
```powershell
# Increase emulator storage in Android Studio:
# Device Manager → Edit AVD → Show Advanced Settings → Increase Internal Storage
```

**Problem: Slow emulator**
```powershell
# Enable hardware acceleration:
# Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
# SDK Tools → Install "Intel x86 Emulator Accelerator (HAXM)"
```

### Build Issues

**Problem: "JAVA_HOME not set"**
```powershell
# Set JAVA_HOME environment variable:
# System Properties → Environment Variables → New
# Variable: JAVA_HOME
# Value: C:\Program Files\Eclipse Adoptium\jdk-17.x.x.x
```

**Problem: "SDK location not found"**
```powershell
# Create local.properties in android folder:
cd "d:\Dilip\CrushIT\app\android"
echo sdk.dir=C:\\Users\\<YourUsername>\\AppData\\Local\\Android\\Sdk > local.properties
```

---

## 📊 Testing Comparison

| Method | Setup Time | Pros | Cons |
|--------|------------|------|------|
| **Expo Go** | 0 min ✅ | Instant, no setup | Need phone nearby |
| **Android Emulator** | 30 min | Full Android testing | Large download |
| **iOS Simulator** | 60 min | Full iOS testing | Mac only |
| **APK Build** | 20 min | Share with testers | Needs rebuild for changes |
| **Web Version** | 0 min | Quick preview | Limited mobile features |

---

## 🎓 Best Practices

1. **Development:** Use Android Emulator + Expo Go
2. **Testing:** Build APK for beta testers
3. **Production:** Build with EAS for Play Store/App Store

---

## 📞 Need Help?

### Common Commands:
```powershell
# Check Android SDK installed
adb version

# List emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_5_API_33

# Check connected devices
adb devices

# Clear Expo cache
npx expo start -c

# Rebuild app
npx expo run:android --device
```

---

## ✅ Installation Checklist

- [ ] Download Android Studio (3-4 GB)
- [ ] Install Android Studio with SDK
- [ ] Configure environment variables (PATH)
- [ ] Create Android Virtual Device (Pixel 5, Android 13)
- [ ] Test emulator starts successfully
- [ ] Run `npx expo start --android`
- [ ] App opens in emulator
- [ ] Test login flow
- [ ] Test all main features

**Estimated Total Setup Time: 45-60 minutes**
**Estimated Download Size: 4-5 GB**

---

**Last Updated:** December 7, 2025
**Your Current Setup:** Expo SDK 50 + React Native 0.73.6
**Status:** Ready for emulator testing ✅
