// API Configuration for different environments

// --- LOCAL DEVELOPMENT (emulator or USB testing) ---
const LOCAL_API_URL = "http://192.168.29.41:4000";  // your machine IP

// --- PRODUCTION BACKEND ON RAILWAY ---
const PROD_API_URL = "https://crushitdev-production.up.railway.app";

// Toggle this manually for local development or production
const USE_LOCAL_API = false;  // Set to false when deploying or testing with Railway backend

// Auto-switch based on flag
const API_BASE_URL = USE_LOCAL_API ? LOCAL_API_URL : PROD_API_URL;

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    // Auth endpoints
    AUTH_LOGIN: "/auth/login",
    AUTH_SIGNUP: "/auth/signup",
    AUTH_PROFILE: "/auth/profile",
    
    // Game endpoints
    GAMES: "/api/games",
    
    // Player endpoints
    PLAYERS: "/api/players",
    
    // Booking endpoints
    BOOKINGS: "/api/bookings",
    
    // Match endpoints
    MATCHES: "/api/matches",
  },
};

// For debugging
console.log("🌐 API Base URL:", API_BASE_URL);