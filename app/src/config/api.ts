// API Configuration for different environments
// Replace 192.168.29.41 with your machine's IP address (run: ipconfig in command prompt)
const MACHINE_IP = '192.168.29.41'; // Your machine IP on the network

const API_BASE_URL = (() => {
  if (typeof window !== 'undefined') {
    // Running on web/browser
    return 'http://localhost:4000';
  }
  // Running on mobile device (Expo Go) - use machine IP
  return `http://${MACHINE_IP}:4000`;
})();

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  ENDPOINTS: {
    CHAT: '/chat/message',
    CHAT_HISTORY: '/chat/history',
    ARENAS: '/arenas',
    PRODUCTS: '/products',
    PETCARE: '/petcare',
    BOOKINGS: '/bookings',
    WALLET: '/wallet',
    TRANSACTIONS: '/transactions',
  },
};

// For debugging
console.log('🌐 API Base URL:', API_BASE_URL);
