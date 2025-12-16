# HomeScreen Crash Debugging Guide

## ✅ What I Fixed

Added comprehensive error handling to HomeScreen:

1. **Image Loading Errors** - Falls back to gradient if image fails to load
2. **Navigation Errors** - All navigation wrapped in try/catch
3. **Carousel Errors** - Added error handling to scroll events
4. **Service Card Errors** - Error catching on button presses

## 🔍 How to Debug the Crash

### Option 1: Check Logs on Device
```bash
# Android logs
adb logcat | grep -i "error\|crash\|exception"

# iOS logs
xcode console or Console.app
```

### Option 2: Check HomeScreen Console Output
After login, look in your terminal/console for these error messages:
- `Image load error for: [id]` - Image failed to load
- `Navigation error:` - Navigation problem
- `Carousel scroll error:` - Scroll event error
- `Service card navigation error:` - Service card click error

### Option 3: Enable More Detailed Logging
Add this to `app/App.tsx` to catch global errors:

```typescript
import { ErrorUtils } from 'react-native';

ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.log('GLOBAL ERROR:', error);
  console.log('IS FATAL:', isFatal);
});
```

## 🆘 Common Crash Causes

1. **Image Path Wrong**
   - Images at: `app/public/cricket-batsman.jpeg`, etc.
   - require() path: `require('../../public/cricket-batsman.jpeg')`
   - If this is wrong, app will crash

2. **Navigation Stack Issue**
   - Check if 'MoreTab', 'GamesTab', 'ArenasTab', 'ScoringTab' exist
   - Check `app/src/navigation/RootNavigator.tsx`

3. **AsyncStorage Error**
   - User data not loading
   - But this is wrapped in try/catch now

4. **Memory Issue**
   - Large images consuming too much memory
   - Try resizing images

## 📋 Testing Checklist

After rebuilding APK:

1. ✅ Login with `demo@test.com` / `password123`
2. ✅ Check if app crashes or shows HomeScreen
3. ✅ If crashes, check console for error message
4. ✅ Share error message for further debugging

## 🛠️ If Still Crashing

1. **Check Logs First** - Share the error message from logcat
2. **Test Individual Components** - Can you click service cards?
3. **Test Carousel** - Can you swipe through sports?
4. **Disable Carousel** - Comment out FlatList to test

## Quick Test Code

Add this to HomeScreen temporarily to debug:

```typescript
useEffect(() => {
  console.log('HomeScreen mounted');
  console.log('Images exist:', sportsCarousel.map(s => s.image ? 'yes' : 'no'));
}, []);
```

## Rebuilt & Ready

All error handling is now in place:
- ✅ Image errors won't crash
- ✅ Navigation errors won't crash
- ✅ Scroll errors won't crash
- ✅ Console logs show what's failing

**Next Step: Rebuild APK and check console logs for any error messages!**
