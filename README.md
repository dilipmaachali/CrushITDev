# 🏏 CrushIT - Sports Arena Booking & Score Management App

A comprehensive React Native mobile application for booking sports arenas and managing live game scoring across multiple sports including Cricket, Badminton, and Football.

## 🚀 Features

### ✅ Implemented
- **User Authentication**: JWT-based authentication with secure login/signup
- **Multi-Sport Scoring Systems**:
  - 🏏 Cricket: ICC official rules with overs, wickets, extras, partnerships
  - 🏸 Badminton: BWF official scoring with sets, service tracking, intervals
  - ⚽ Football: FIFA/UEFA rules with halves, extra time, penalties, cards
- **Game Management**: Create, edit, delete scheduled games
- **Player Management**: Find players, manage teams, track statistics
- **Arena Booking**: Browse and book sports facilities
- **Live Score Tracking**: Real-time scoring with active/completed game tracking
- **Multi-User Support**: User-isolated data with authentication

### 🚧 In Development
- MongoDB database integration (models created, not connected)
- Remaining screen migrations (10/18 screens migrated to API)
- Production security hardening (rate limiting, CORS)
- Deployment configuration

---

## 📋 Prerequisites

- **Node.js**: v16 or higher
- **npm**: v7 or higher
- **Expo CLI**: `npm install -g expo-cli`
- **iOS Simulator** (Mac) or **Android Emulator** / **Physical Device**

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd CrushIT
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies
```bash
cd ../app
npm install
```

## ⚙️ Configuration

### Backend Setup

1. **Build Backend**:
```bash
cd backend
npm run build
```

2. **Environment Variables** (Optional - has defaults):
```bash
# Create .env file if needed
echo "JWT_SECRET=your-super-secret-jwt-key-change-in-production" > .env
echo "PORT=4000" >> .env
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm start
```

Expected output:
```
✅ AuthService initialized with default test users
🚀 CrushIT backend running on:
   Local:   http://localhost:4000
   Network: http://192.168.29.41:4000 (for Expo Go)
✅ Default test accounts ready:
   - user@example.com (password: password123)
   - demo@test.com (password: password123)
   - test@crushit.com (password: password123)
```

### Start Frontend App
In a new terminal:
```bash
cd app
npm start
```

Choose your platform:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan QR code with Expo Go app on physical device

## 🔑 Test Credentials

| Email | Password |
|-------|----------|
| user@example.com | password123 |
| demo@test.com | password123 |
| test@crushit.com | password123 |

Or create a new account using the Sign Up option.

## 📱 App Navigation

1. **Home Tab**: Browse featured arenas and quick actions
2. **Arenas Tab**: View all sports facilities and book time slots
3. **Games Tab**: Create and manage scheduled games
4. **Scoring Tab**: Start live scoring for Cricket/Badminton/Football
5. **More Tab**: Access shop, pet care, profile settings

## 🏗️ Project Structure

```
CrushIT/
├── app/                          # React Native frontend
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── screens/             # App screens
│   │   ├── navigation/          # Navigation configuration
│   │   ├── services/            # API service & interceptors
│   │   ├── contexts/            # React contexts (Theme, etc.)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── theme/               # Colors, typography, spacing
│   │   └── config/              # API endpoints configuration
│   ├── App.tsx                  # App entry point
│   └── package.json
│
├── backend/                      # Express.js backend
│   ├── src/
│   │   ├── routes/              # API route handlers
│   │   │   ├── games.ts         # Game CRUD operations
│   │   │   ├── matches.ts       # Match scoring data
│   │   │   ├── bookings.ts      # Arena bookings
│   │   │   └── players.ts       # Player profiles
│   │   ├── services/            # Business logic
│   │   │   └── AuthService.ts   # JWT authentication
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.ts          # JWT validation
│   │   │   └── rateLimiter.ts   # Rate limiting (not applied)
│   │   ├── models/              # Data models (MongoDB - not connected)
│   │   ├── data/                # Mock data for development
│   │   └── index.ts             # Server entry point
│   ├── dist/                    # Compiled JavaScript (generated)
│   └── package.json
│
└── docs/                        # Documentation
```

## 🔌 API Endpoints

### Authentication
- `POST /auth/register` - Create new account
- `POST /auth/login` - Login user
- `GET /auth/me` - Get current user profile

### Games
- `GET /api/games` - Get user's games (auth required)
- `POST /api/games` - Create game (auth required)
- `PUT /api/games/:id` - Update game (auth required)
- `DELETE /api/games/:id` - Delete game (auth required)

### Matches (Scoring Data)
- `GET /api/matches?sport=cricket` - Get matches by sport (auth required)
- `POST /api/matches` - Create match (auth required)
- `PUT /api/matches/:id` - Update match score (auth required)

### Bookings
- `GET /api/bookings` - Get user's bookings (auth required)
- `POST /api/bookings` - Create booking (auth required)
- `PUT /api/bookings/:id` - Update booking (auth required)
- `DELETE /api/bookings/:id` - Delete booking (auth required)

### Players
- `GET /api/players` - Discover players with filters
- `GET /api/players/:id` - Get player profile
- `PUT /api/players/profile` - Update own profile (auth required)

## ⚠️ Known Limitations

### Current Status: MVP (Minimum Viable Product)

1. **Temporary Data Storage**:
   - Backend uses in-memory storage
   - All data is lost when server restarts
   - MongoDB models created but not connected

2. **Incomplete Migration**:
   - 8/18 screens migrated to API
   - 10 screens still use device-local AsyncStorage
   - Not fully multi-user ready

3. **Security**:
   - Rate limiting middleware created but not applied
   - CORS not configured for production
   - JWT secret should be changed for production

4. **Not Deployed**:
   - Backend needs Railway/Render deployment
   - Frontend needs Expo build for app stores
   - MongoDB Atlas connection required

## 🚀 Upcoming Features

- [ ] Connect MongoDB Atlas database
- [ ] Complete AsyncStorage → API migration (10 remaining screens)
- [ ] Apply rate limiting and security middleware
- [ ] Deploy backend to Railway
- [ ] Build and publish to iOS App Store / Google Play Store
- [ ] Real-time score updates with WebSockets
- [ ] Push notifications for game invites
- [ ] Payment integration for arena bookings
- [ ] Social features (friends, leaderboards)

## 📦 Tech Stack

### Frontend
- **React Native**: Cross-platform mobile framework
- **Expo SDK 52**: Development platform
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation library
- **Axios**: HTTP client with JWT interceptors
- **AsyncStorage**: Local data persistence

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **TypeScript**: Type-safe server code
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing

### Planned
- **MongoDB + Mongoose**: Database (models ready)
- **Railway**: Backend hosting
- **MongoDB Atlas**: Cloud database
- **Expo EAS**: App building & deployment

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Dilip** - Initial work

---

**⚠️ Important Note**: This is an MVP in active development. Data is stored in memory and will be lost on server restart. Production deployment with persistent database is coming soon.  

### Phase 3  
🤖 Assistant, AI recommendations, Live bookings  

---

## 🤝 Contributing

PRs & feedback welcome!

---

## ⭐️ Support
If this repository helps you — star it ❤️
