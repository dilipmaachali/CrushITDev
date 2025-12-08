# How to Book a Court - Step by Step Guide

## Booking Flow (Complete Path)

### Method 1: From Home Screen

1. **Open App** → You'll see the Home screen
2. **Scroll down** to "Popular Arenas" section
3. **Tap any arena card** (e.g., "Elite Cricket Turf")
4. **Arena Details** screen opens
5. **Tap "Book Now"** button at the bottom
6. **Fill in booking form:**
   - Your Name: Enter your full name
   - Contact Number: Enter phone number
   - Select Day: Tap any day (Mon, Tue, Wed, etc.)
   - Select Date: Enter date in format YYYY-MM-DD (e.g., 2025-12-10)
   - Select Time Slot: Tap any time slot (e.g., 18:00-19:00)
   - Number of Players: Enter number (e.g., 10)
7. **Review booking summary** at the bottom
8. **Tap "Confirm Booking & Pay"**
9. **Confirm** in the dialog
10. **Success!** You'll see booking confirmation with Booking ID

### Method 2: From Game Previews

1. **Home Screen** → Scroll to "Popular Games"
2. **Tap a game card** (Cricket, Badminton, or Football)
3. **Filtered arena list** opens
4. **Tap any arena**
5. **Tap "Book Now"**
6. **Fill form** (same as above)
7. **Confirm booking**

### Method 3: From Arenas Tab

1. **Tap "Arenas" tab** at the bottom
2. **Browse all arenas**
3. **Tap any arena**
4. **Tap "Book Now"**
5. **Fill form and confirm**

---

## Required Fields (Must Fill All)

✅ **Your Name** - Cannot be empty  
✅ **Contact Number** - Cannot be empty  
✅ **Select Day** - Must select a day (Mon-Sun)  
✅ **Select Date** - Must enter date  
✅ **Time Slot** - Must select a time slot  
✅ **Number of Players** - Must enter a number  

**If any field is missing**, you'll see:
> ⚠️ "Missing Information - Please fill all required fields"

---

## What Happens After Booking

1. **First Alert**: Confirmation dialog showing all booking details
2. **Second Alert**: Success message with:
   - Booking ID (e.g., BK123456)
   - All booking details
   - Options to:
     - "View My Bookings" → Go to Profile
     - "Done" → Return to Home

---

## Example Test Booking

Try this to test the complete flow:

```
Name: John Doe
Phone: 9876543210
Day: Monday
Date: 2025-12-09
Time: 18:00-19:00
Players: 10
```

**Expected Result:**
- Total Price: ₹500 (or arena's hourly rate)
- Booking ID generated
- Success confirmation shown

---

## Troubleshooting

### "Can't find arena to book"
- Make sure you clicked on an arena card first
- Don't navigate directly to Booking screen

### "Missing Information" error
- Fill ALL fields including:
  - Name
  - Phone
  - Day (tap a day chip)
  - Date (type in YYYY-MM-DD format)
  - Time Slot (tap a time chip)
  - Players (type a number)

### "Nothing happens when I click Confirm"
- Check if all required fields are filled
- Check if form validation is showing errors
- Try refreshing the app (Reload in Expo Go)

### Navigation doesn't work
- Make sure backend is running on port 4000
- Make sure Expo is running
- Try restarting the app

---

## Current App State

✅ **Backend Running**: Port 4000  
✅ **Expo Running**: Development mode  
✅ **Navigation**: Fully configured  
✅ **Booking Screen**: All fields working  
✅ **Form Validation**: Active  
✅ **Success Flow**: Working  

---

## What You Should See

### On Arena Details Screen:
```
┌─────────────────────────┐
│ [Arena Image]           │
│                         │
│ Elite Cricket Turf      │
│ CRICKET        ⭐ 4.8   │
│                         │
│ Pricing: ₹500/hour      │
│ 2.5 km away             │
│                         │
│ Amenities:              │
│ [Pavilion] [Lights]     │
│                         │
│ Available: 06:00-22:00  │
│                         │
│   [Book Now]   ← Click  │
└─────────────────────────┘
```

### On Booking Screen (After filling all fields):
```
┌─────────────────────────┐
│ Your Details            │
│ Name: ✓ John Doe        │
│ Phone: ✓ 9876543210     │
│                         │
│ Day: ✓ Monday           │
│ Date: ✓ 2025-12-09      │
│ Time: ✓ 18:00-19:00     │
│ Players: ✓ 10           │
│                         │
│ Total: ₹500             │
│                         │
│ [Confirm Booking] ← Click
└─────────────────────────┘
```

### After Clicking Confirm:
```
┌─────────────────────────┐
│ Confirm Booking         │
│                         │
│ Arena: Elite Cricket..  │
│ Day: Monday             │
│ Date: 2025-12-09        │
│ Slot: 18:00-19:00       │
│ Players: 10             │
│ Total: ₹500             │
│                         │
│ [Cancel] [Confirm & Pay]│
└─────────────────────────┘
        ↓ Click "Confirm & Pay"
┌─────────────────────────┐
│ 🎉 Booking Confirmed!   │
│                         │
│ Elite Cricket Turf      │
│ Monday, 18:00-19:00     │
│ Players: 10             │
│                         │
│ Booking ID: BK123456    │
│                         │
│ [View My Bookings]      │
│ [Done]                  │
└─────────────────────────┘
```

---

## Test Now!

1. Open the app
2. Find an arena
3. Click "Book Now"
4. Fill all 6 required fields
5. Click "Confirm Booking & Pay"
6. See success message!

**Your booking functionality is fully working!** 🎉
