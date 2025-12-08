# CrushIT Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Start Backend Server

```bash
cd d:\Dilip\CrushIT\backend
npm start
```

✅ You should see:
```
🚀 CrushIT backend running on http://localhost:4000
📚 API Documentation available at http://localhost:4000/api-docs
```

---

### Step 2: Start Mobile Development Server

In a new terminal:

```bash
cd d:\Dilip\CrushIT\app
npm start
```

Follow the prompt:
- Press `w` to view in web browser (or)
- Scan QR code with **Expo Go** mobile app

---

### Step 3: Test Authentication

**Option A: Using Curl**
```bash
# Login with demo account
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@test.com","password":"password123"}'
```

**Option B: Using Mobile App**
1. Open CrushIT app
2. Go to LoginSignup screen
3. Enter: `user1@test.com` / `password123`
4. Tap "Sign In"

---

### Step 4: Explore Features

#### 🏟️ Browse Arenas
- Go to **Arenas** tab
- Scroll through available sports venues
- Tap on any arena for details

#### 🔍 Search & Filter
- Tap **search icon** on Arenas screen
- Filter by:
  - Price range (₹300-₹800)
  - Minimum rating (⭐4+)
  - Sports type (Cricket, Football, etc.)
  - Sort by price or rating

#### 💬 Chat with Bot
- Go to **Chat** tab
- Try saying:
  - "I want to book a cricket arena"
  - "Show my bookings"
  - "Cancel booking"
  - "Help"

#### 💰 Wallet Management
- Go to **Profile** → **Wallet**
- View balance: **₹5000** (demo credit)
- Add money via quick buttons or custom amount
- View transaction history

#### 👤 Edit Profile
- Go to **Profile** tab
- Tap **Edit** to update:
  - Name, Phone, Address
- Changes sync with backend

#### ⭐ Leave Reviews
- From arena details
- Rate and comment on your experience
- View ratings from other users

---

## 📱 Demo Credentials

```
Email: user1@test.com
Password: password123
```

---

## 🔌 API Endpoints Quick Reference

### Authentication
```bash
# Login
POST /auth/login
{"email":"user1@test.com","password":"password123"}

# Get profile
GET /auth/me
Headers: Authorization: Bearer TOKEN

# Update profile
PUT /auth/profile
Headers: Authorization: Bearer TOKEN
{"name":"John","phone":"+91-9876543210"}
```

### Search & Filter
```bash
# Search with filters
GET /arenas/search?search=cricket&minPrice=300&maxPrice=800&minRating=4&sortBy=price-asc
```

### Reviews
```bash
# Get reviews
GET /reviews/arena/1

# Add review
POST /reviews
Headers: Authorization: Bearer TOKEN
{"arenaId":"1","rating":5,"title":"Great!","comment":"Amazing place"}
```

### Payments
```bash
# Create order
POST /payments/create-order
Headers: Authorization: Bearer TOKEN
{"amount":500,"bookingId":"BK123"}

# Use wallet
POST /payments/wallet
Headers: Authorization: Bearer TOKEN
{"amount":500,"bookingId":"BK123"}
```

### Wallet
```bash
# Get balance
GET /wallet/user_1

# Add money
POST /wallet/user_1/recharge
{"amount":1000,"method":"razorpay"}
```

### Location
```bash
# Nearby arenas
GET /arenas/nearby?latitude=12.9716&longitude=77.5946&radius=5

# Calculate distance
POST /location/distance
{"fromLatitude":12.9716,"fromLongitude":77.5946,"toLatitude":12.9856,"toLongitude":77.6010}
```

### Chat
```bash
# Send message
POST /chat/message
{"userId":"user_1","userMessage":"I want to book"}

# Get history
GET /chat/history/user_1
```

---

## 🛠️ Project Structure

```
CrushIT/
├── backend/                    # Node.js Express API
│   ├── src/
│   │   ├── index.ts           # Main server (35+ endpoints)
│   │   ├── models/            # TypeScript interfaces
│   │   │   ├── Auth.ts
│   │   │   ├── Payment.ts
│   │   │   ├── Location.ts
│   │   │   └── Features.ts
│   │   ├── services/          # Business logic
│   │   │   ├── AuthService.ts
│   │   │   ├── PaymentService.ts
│   │   │   └── LocationService.ts
│   │   ├── middleware/        # Express middleware
│   │   │   └── auth.ts
│   │   └── data/              # Mock database
│   │       ├── arenas.ts
│   │       ├── payments.ts
│   │       └── features.ts
│   ├── dist/                  # Compiled JavaScript
│   ├── package.json
│   └── tsconfig.json
│
├── app/                        # React Native/Expo App
│   ├── src/
│   │   ├── screens/           # 15 screens
│   │   │   ├── LoginSignupScreen.tsx
│   │   │   ├── ProfileScreen.tsx
│   │   │   ├── WalletScreen.tsx
│   │   │   ├── ArenaSearchScreen.tsx
│   │   │   └── ...
│   │   ├── components/        # Reusable UI components
│   │   ├── navigation/        # React Navigation config
│   │   ├── theme/             # Design system
│   │   └── config/            # API configuration
│   ├── app.json               # Expo config
│   ├── package.json
│   └── tsconfig.json
│
├── API_DOCUMENTATION.md       # Complete API reference
├── FEATURES_SUMMARY.md        # Feature overview
└── README.md                  # Project overview
```

---

## ⚙️ Build & Deploy

### Development Mode
```bash
# Backend (with auto-reload)
cd backend && npm start

# Mobile (with Expo dev server)
cd app && npm start
```

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start  # Runs compiled JS
```

**Mobile:**
```bash
cd app
eas build --platform ios
eas build --platform android
```

---

## 🧪 Testing Workflows

### Test User Authentication
```bash
# 1. Signup new user
POST /auth/register
{"email":"test@test.com","password":"Test123!","name":"Test User"}

# 2. Login
POST /auth/login
{"email":"test@test.com","password":"Test123!"}

# 3. Use token from response in headers
GET /auth/me
Headers: Authorization: Bearer <TOKEN>
```

### Test Payments
```bash
# 1. Create order
POST /payments/create-order
{"amount":500,"bookingId":"BK123"}

# 2. Verify payment (with mock signature)
POST /payments/verify
{"razorpay_order_id":"order_xxx","razorpay_payment_id":"pay_xxx","razorpay_signature":"sig_xxx"}

# 3. Or use wallet directly
POST /payments/wallet
{"amount":500,"bookingId":"BK123"}
```

### Test Search & Filters
```bash
# 1. Get all arenas
GET /arenas

# 2. Search with filters
GET /arenas/search?search=cricket&minPrice=300&maxPrice=800&minRating=4&type=cricket&sortBy=price-asc

# 3. Check time slots
GET /timeslots/1/2025-01-15
```

### Test Location
```bash
# 1. Find nearby arenas
GET /arenas/nearby?latitude=12.9716&longitude=77.5946&radius=5

# 2. Calculate distance
POST /location/distance
{"fromLatitude":12.9716,"fromLongitude":77.5946,"toLatitude":12.9856,"toLongitude":77.6010,"mode":"driving"}

# 3. Get directions
POST /location/directions
{"fromLatitude":12.9716,"fromLongitude":77.5946,"toLatitude":12.9856,"toLongitude":77.6010}
```

---

## 📊 Key Features Checklist

- ✅ User Authentication (Register, Login, Profile Update)
- ✅ Arena Search & Advanced Filters
- ✅ Reviews & Ratings System
- ✅ Booking Management with Time Slots
- ✅ Wallet & Payment Integration (Razorpay)
- ✅ Location Services (Nearby Arenas, Distance)
- ✅ Chat Bot with Intent Parsing
- ✅ Notifications System
- ✅ Transaction History
- ✅ Settings & Preferences

---

## 🐛 Troubleshooting

### Backend won't start
```bash
# Clear node_modules and reinstall
rm -r node_modules package-lock.json
npm install
npm run build
npm start
```

### Mobile won't connect to backend
- Ensure backend is running on `http://localhost:4000`
- Check device IP: Use `http://192.168.29.41:4000` instead
- Verify firewall isn't blocking port 4000

### Expo QR code not scanning
- Make sure device and computer are on same WiFi
- Close and reopen Expo Go app
- Generate new QR: Press `r` in terminal

### TypeScript compilation errors
```bash
# Reinstall types
npm install --save-dev @types/node @types/express
npm run build
```

---

## 📚 Additional Resources

- **API Docs:** `http://localhost:4000/api-docs` (when backend running)
- **API Reference:** See `API_DOCUMENTATION.md`
- **Features Overview:** See `FEATURES_SUMMARY.md`
- **React Native Docs:** https://reactnative.dev
- **Expo Docs:** https://docs.expo.dev

---

## 💡 Next Steps

1. **Customize:** Update colors, fonts, and branding
2. **Add Database:** Connect to PostgreSQL/MongoDB
3. **Deploy:** Use Vercel/Railway for backend, EAS for mobile
4. **Monitoring:** Set up error tracking (Sentry)
5. **Analytics:** Integrate usage tracking

---

## ✨ You're All Set!

You now have a fully functional sports arena booking platform with:
- 35+ API endpoints
- Complete mobile frontend
- Payment processing
- Real-time features
- Location services
- Comprehensive documentation

**Happy Coding! 🎉**

For questions or issues, refer to the comprehensive documentation files included in the project.
