# Production Deployment Checklist

## 🎯 Quick Deploy Steps

### 1. Backend Deployment (Railway)
```bash
# 1. Push code to GitHub
git add .
git commit -m "Production ready"
git push

# 2. Go to railway.app → New Project → Deploy from GitHub
# 3. Select CrushIT repository
# 4. Railway will auto-detect Node.js and deploy

# 5. Add Environment Variables in Railway Dashboard:
JWT_SECRET=<generate-with: openssl rand -base64 32>
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crushit
NODE_ENV=production
PORT=4000
ALLOWED_ORIGINS=https://yourapp.vercel.app

# 6. Get Railway URL (e.g., crushit-backend.up.railway.app)
```

### 2. MongoDB Atlas Setup
```
1. Go to mongodb.com/cloud/atlas
2. Create free cluster (M0)
3. Database Access → Add User (username/password)
4. Network Access → Add IP: 0.0.0.0/0 (allow all)
5. Connect → Get connection string
6. Replace <password> in string
7. Add to Railway environment variables
```

### 3. Frontend Configuration
Update `app/src/config/api.ts`:
```typescript
const API_BASE_URL = __DEV__ 
  ? `http://192.168.29.41:4000`  // Development
  : 'https://crushit-backend.up.railway.app'; // Production
```

### 4. Test Multi-User
```bash
# Test 1: Register User A
curl -X POST https://your-railway-url.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"usera@test.com","password":"pass123","name":"User A"}'

# Test 2: Register User B
curl -X POST https://your-railway-url.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"userb@test.com","password":"pass123","name":"User B"}'

# Test 3: User A creates game (use token from register response)
curl -X POST https://your-railway-url.railway.app/api/games \
  -H "Authorization: Bearer USER_A_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"sport":"Cricket","title":"Test Game",...}'

# Test 4: User B gets games (should NOT see User A's game)
curl -X GET https://your-railway-url.railway.app/api/games \
  -H "Authorization: Bearer USER_B_TOKEN"
```

## ⚠️ Critical Warnings

1. **DO NOT** commit `.env` file with real secrets
2. **CHANGE** JWT_SECRET from example value
3. **TEST** with 2 real accounts before public launch
4. **BACKUP** MongoDB regularly (Atlas auto-backs up M10+ tiers)
5. **MONITOR** Railway usage (free tier: 500 hrs/month)

## 📊 Current Status

### ✅ Completed
- [x] Authentication system (JWT)
- [x] API service with auto-token
- [x] Bookings API (/api/bookings)
- [x] Matches API (/api/matches)  
- [x] Rate limiting middleware
- [x] MongoDB models (Booking, Match)
- [x] Deployment config (Railway)

### 🟡 Partial
- [~] Frontend migration (1/18 screens)
  - BookingScreen started
  - Need: CreateGame, EditGame, all scoring screens

### ❌ TODO (Critical)
- [ ] Complete all 18 screens migration
- [ ] Replace in-memory arrays with MongoDB in routes
- [ ] Apply rate limiting to index.ts
- [ ] Configure CORS properly
- [ ] Test multi-user isolation
- [ ] Deploy and test in production

## 🚀 Time Remaining: ~7 hours

**Priority Order:**
1. Finish screen migrations (3 hours)
2. Connect MongoDB models to routes (1 hour)  
3. Add security middleware (1 hour)
4. Deploy to Railway (30 min)
5. Test thoroughly (1.5 hours)
6. Fix any issues (1 hour buffer)
