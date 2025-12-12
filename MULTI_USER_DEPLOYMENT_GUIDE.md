# Multi-User Deployment Guide - CrushIT

## ✅ Phase 1: Authentication Hardening (COMPLETED)

### What Was Done:
1. **Removed Skip Login** - Deleted `handleSkipLogin()` bypass from LoginSignupScreen
2. **Created API Service** - `app/src/services/api.ts` with:
   - JWT token auto-attachment
   - 401 error handling with auto-logout
   - Token validation method
3. **App Startup Validation** - `App.tsx` now validates token on launch
4. **userId Storage** - Login/signup now stores userId alongside token

### Files Modified:
- ✅ `app/src/services/api.ts` (NEW)
- ✅ `app/src/services/index.ts` (NEW)
- ✅ `app/App.tsx` - Added token validation
- ✅ `app/src/screens/LoginSignupScreen.tsx` - Removed skip, added userId storage
- ✅ `app/src/navigation/RootNavigator.tsx` - Removed auto-login logic

## ✅ Phase 2: Backend API Routes (COMPLETED)

### What Was Done:
1. **Bookings Router** - `backend/src/routes/bookings.ts`
   - `GET /api/bookings` - Get user's bookings
   - `POST /api/bookings` - Create booking
   - `PUT /api/bookings/:id` - Update booking
   - `DELETE /api/bookings/:id` - Delete booking
   
2. **Matches Router** - `backend/src/routes/matches.ts`
   - `GET /api/matches?sport=cricket` - Get user's matches (filterable)
   - `POST /api/matches` - Create match
   - `PUT /api/matches/:id` - Update match (scoring)
   - `DELETE /api/matches/:id` - Delete match
   - `POST /api/matches/bulk` - Bulk create matches

3. **Integration** - Mounted in `backend/src/index.ts`

### Files Created:
- ✅ `backend/src/routes/bookings.ts` (NEW)
- ✅ `backend/src/routes/matches.ts` (NEW)
- ✅ `backend/src/index.ts` (UPDATED - routes mounted)

## 🟡 Phase 3: Frontend Migration (PARTIAL - 1/18 screens)

### Completed:
- ✅ BookingScreen.tsx - API service import added

### Remaining (17 screens):
You need to replace AsyncStorage calls with API calls in these files:

#### High Priority (Core Features):
1. **CreateGameScreen.tsx**
   ```typescript
   // OLD: await AsyncStorage.getItem('scheduledGames')
   // NEW: const response = await api.get('/api/games'); const games = response.data;
   ```

2. **EditGameScreen.tsx**
   ```typescript
   // OLD: AsyncStorage.setItem('scheduledGames', ...)
   // NEW: await api.put(`/api/games/${gameId}`, updatedGame);
   ```

3. **CricketScoringScreen.tsx**
   ```typescript
   // OLD: AsyncStorage.getItem('cricketMatches')
   // NEW: const response = await api.get('/api/matches?sport=cricket');
   ```

4. **BadmintonScoringScreen.tsx**, **FootballScoringScreen.tsx** - Same pattern

#### Medium Priority:
5. ManagePlayersScreen.tsx
6. FindPlayersScreen.tsx
7. ScoringScreen.tsx
8. ScoreEntryScreen.tsx
9. GamesScreen.tsx

#### Low Priority (Settings/Preferences):
10. ProfileScreen.tsx (keep some AsyncStorage for UI preferences)
11. SettingsScreen.tsx
12. useAccessibility.ts hook

### Migration Pattern (Copy This):
```typescript
// BEFORE
const gamesJson = await AsyncStorage.getItem('scheduledGames');
const games = gamesJson ? JSON.parse(gamesJson) : [];

// AFTER
import { api } from '@/services';
try {
  const response = await api.get('/api/games');
  const games = response.data;
} catch (error) {
  console.error('Failed to fetch games:', error);
  Alert.alert('Error', 'Failed to load games');
}
```

## ⚠️ Phase 4: Database Schema (IN PROGRESS)

### Current State:
- Backend routes use **in-memory arrays** (data lost on restart)
- Need to create MongoDB models

### Required MongoDB Models:

#### 1. Booking Model (`backend/src/models/Booking.ts`):
```typescript
import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  arenaId: { type: String, required: true },
  arenaName: { type: String, required: true },
  sport: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  duration: { type: Number, default: 60 },
  totalCost: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled', 'completed'], default: 'pending' },
  players: [String],
  notes: String,
}, { timestamps: true });

BookingSchema.index({ userId: 1, date: 1 });
BookingSchema.index({ status: 1 });

export const Booking = mongoose.model('Booking', BookingSchema);
```

#### 2. Match Model (`backend/src/models/Match.ts`):
```typescript
import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sport: { type: String, enum: ['cricket', 'badminton', 'football'], required: true },
  matchData: { type: mongoose.Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['setup', 'in-progress', 'completed'], default: 'setup' },
}, { timestamps: true });

MatchSchema.index({ userId: 1, sport: 1 });
MatchSchema.index({ status: 1 });

export const Match = mongoose.model('Match', MatchSchema);
```

### Update Routes to Use Models:
Replace `bookings` array in `backend/src/routes/bookings.ts`:
```typescript
// OLD: let bookings: Booking[] = [];
// NEW: import { Booking } from '@/models/Booking';

router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const bookings = await Booking.find({ userId: req.userId });
  res.json(bookings);
});
```

## 🔒 Phase 5: Security Hardening

### Required Steps:

#### 1. Environment Variables (`.env` file):
```env
# Create backend/.env
JWT_SECRET=your-super-secret-256-bit-key-change-this-in-production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crushit
NODE_ENV=production
PORT=4000

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
ALLOWED_ORIGINS=https://yourapp.vercel.app,https://crushit.app
```

#### 2. Rate Limiting (`backend/src/middleware/rateLimiter.ts`):
```typescript
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later',
});
```

Apply in `backend/src/index.ts`:
```typescript
import { apiLimiter, authLimiter } from '@/middleware/rateLimiter';

app.use('/api/', apiLimiter);
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);
```

#### 3. Input Validation (Example for games route):
```typescript
import { body, validationResult } from 'express-validator';

router.post('/api/games',
  authMiddleware,
  body('sport').notEmpty().isString(),
  body('scheduledDate').isISO8601(),
  body('maxPlayers').isInt({ min: 2, max: 100 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Create game...
  }
);
```

#### 4. CORS Configuration:
```typescript
import cors from 'cors';

const corsOptions = {
  origin: (origin: string | undefined, callback: any) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:8081',
      'http://localhost:19000'
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400,
};

app.use(cors(corsOptions));
```

## 🚀 Phase 6: Deployment Configuration

### Backend Deployment (Railway/Render - Recommended over Vercel)

#### Why Not Vercel for Backend?
- Vercel functions are serverless (10s timeout)
- No persistent WebSocket connections
- Cold starts affect performance
- Better suited for static/Next.js apps

#### Railway Setup:
1. **Create `railway.json`**:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd backend && npm install && npm run build"
  },
  "deploy": {
    "startCommand": "cd backend && npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. **Environment Variables in Railway Dashboard**:
   - `JWT_SECRET`
   - `MONGODB_URI`
   - `NODE_ENV=production`
   - `PORT=4000`
   - `ALLOWED_ORIGINS`

3. **MongoDB Atlas Setup**:
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allow all - Railway IPs change)
   - Or whitelist Railway's IP range

#### Frontend API Configuration:
Update `app/src/config/api.ts`:
```typescript
const MACHINE_IP = '192.168.29.41';

const API_BASE_URL = (() => {
  // Production
  if (process.env.NODE_ENV === 'production') {
    return 'https://crushit-backend.up.railway.app'; // Your Railway URL
  }
  
  // Development - Expo Go
  if (typeof window !== 'undefined') {
    return 'http://localhost:4000'; // Web
  }
  
  return `http://${MACHINE_IP}:4000`; // Mobile device
})();

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // ... existing endpoints
    BOOKINGS: '/api/bookings',
    MATCHES: '/api/matches',
    GAMES: '/api/games',
  },
};
```

### Frontend Deployment (Expo/Vercel)

#### For Expo (Recommended for React Native):
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

#### Update `app/eas.json`:
```json
{
  "build": {
    "production": {
      "env": {
        "API_BASE_URL": "https://crushit-backend.up.railway.app"
      }
    }
  }
}
```

## 📋 Pre-Launch Checklist

### Critical (Must Do):
- [ ] Complete Phase 3 (Frontend Migration) for all screens
- [ ] Replace in-memory storage with MongoDB models (Phase 4)
- [ ] Add rate limiting and CORS (Phase 5)
- [ ] Test multi-user isolation (2 accounts, verify data separation)
- [ ] Deploy backend to Railway/Render
- [ ] Update frontend API_CONFIG with production URL
- [ ] Test production authentication flow

### Important:
- [ ] Set up MongoDB Atlas with proper indexes
- [ ] Configure environment variables on hosting platform
- [ ] Test token expiration handling
- [ ] Add error monitoring (Sentry)
- [ ] Create privacy policy and terms of service
- [ ] Test on real devices (iOS + Android)

### Nice to Have:
- [ ] Offline mode with request queue
- [ ] Push notifications for game invites
- [ ] User data export/deletion endpoints (GDPR)
- [ ] Analytics dashboard
- [ ] Load testing (100+ concurrent users)

## 🔧 Quick Testing Commands

### Test Backend Authentication:
```bash
# Register
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Login (get token)
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token
curl -X GET http://localhost:4000/api/games \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Test Frontend:
1. Login with real credentials (skip login removed)
2. Create a booking → Verify it appears for that user only
3. Login as different user → Verify they don't see first user's data
4. Create cricket match → Verify saved to backend
5. Logout → Login again → Verify data persists

## 📊 Migration Progress Tracker

| Component | Status | Priority |
|-----------|--------|----------|
| Authentication | ✅ Complete | Critical |
| API Service | ✅ Complete | Critical |
| Backend Routes | ✅ Complete | Critical |
| BookingScreen | 🟡 Partial | High |
| CreateGameScreen | ❌ TODO | High |
| EditGameScreen | ❌ TODO | High |
| CricketScoring | ❌ TODO | High |
| BadmintonScoring | ❌ TODO | High |
| FootballScoring | ❌ TODO | High |
| MongoDB Models | ❌ TODO | Critical |
| Rate Limiting | ❌ TODO | High |
| CORS Config | ❌ TODO | High |
| Deployment | ❌ TODO | Critical |

## ⏱️ Remaining Time Estimate

- **Phase 3 completion**: 2-3 hours (systematic screen updates)
- **Phase 4 (MongoDB)**: 1 hour (create models, update routes)
- **Phase 5 (Security)**: 1 hour (rate limit, validation, CORS)
- **Phase 6 (Deploy)**: 1 hour (Railway + Expo config)
- **Testing**: 2 hours (multi-user, edge cases)

**Total: ~7-8 hours of focused development**

## 🎯 Next Immediate Steps

1. **Complete Frontend Migration** (Phase 3):
   - Start with CreateGameScreen.tsx (most used)
   - Then EditGameScreen.tsx
   - Then all 3 scoring screens
   - Pattern: Replace AsyncStorage.getItem → api.get, AsyncStorage.setItem → api.post/put

2. **Add MongoDB Models** (Phase 4):
   - Create Booking.ts and Match.ts models
   - Update bookings.ts and matches.ts routes
   - Test with real database

3. **Security** (Phase 5):
   - Add rate limiting
   - Configure CORS
   - Add input validation

4. **Deploy** (Phase 6):
   - Railway for backend
   - Update API_CONFIG
   - Test end-to-end

---

**Contact for Questions**: GitHub Copilot in VS Code
**Last Updated**: Phase 1-2 Complete, Phase 3-6 Documented
