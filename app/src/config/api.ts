// API Configuration for different environments

// --- LOCAL DEVELOPMENT ---
const LOCAL_API_URL = "http://192.168.29.41:4000";

// --- PRODUCTION BACKEND ---
const PROD_API_URL = "https://crushitdev-production.up.railway.app";

// Manual override ONLY if you want APK to hit local backend
const FORCE_LOCAL_API = false;

// Expo dev flag (true only in Expo Go / metro)
const IS_DEV = __DEV__ === true;

// Final base URL selection
const API_BASE_URL = FORCE_LOCAL_API
  ? LOCAL_API_URL           // manual override
  : IS_DEV
  ? LOCAL_API_URL           // expo dev
  : PROD_API_URL;           // APK / production

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Auth
    AUTH_LOGIN: "/auth/login",
    AUTH_SIGNUP: "/auth/signup",
    AUTH_PROFILE: "/auth/profile",

    // Games
    GAMES: "/api/games",

    // Players
    PLAYERS: "/api/players",

    // Bookings
    BOOKINGS: "/api/bookings",

    // Matches
    MATCHES: "/api/matches",
  },
};

// Debug log (safe)
console.log("🌐 API Base URL:", API_BASE_URL);
