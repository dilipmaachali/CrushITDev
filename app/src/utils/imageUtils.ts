/**
 * Image utilities and mapping for game/arena images
 * Maps game types to their image URIs (using placeholder images for now)
 */

// Map of arena types to their placeholder image URLs
// Using placeholder images until we properly implement SVG support
export const ARENA_IMAGES: Record<string, any> = {
  cricket: { uri: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop' },
  football: { uri: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop' },
  badminton: { uri: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop' },
  tennis: { uri: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&h=600&fit=crop' },
  basketball: { uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop' },
  squash: { uri: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop' },
};

// Default image if type not found
export const DEFAULT_ARENA_IMAGE = { uri: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop' };

/**
 * Get arena image by type
 * @param type - The arena type (e.g., 'cricket', 'football')
 * @returns The image source or default if not found
 */
export const getArenaImage = (type: string): any => {
  return ARENA_IMAGES[type.toLowerCase()] || DEFAULT_ARENA_IMAGE;
};

/**
 * Get arena image URI for network requests
 * For use in API calls or dynamic image loading
 * @param type - The arena type
 * @returns The image URI path
 */
export const getArenaImageUri = (type: string): string => {
  const typeMap: Record<string, string> = {
    cricket: 'arenas/cricket.svg',
    football: 'arenas/football.svg',
    badminton: 'arenas/badminton.svg',
    tennis: 'arenas/tennis.svg',
    basketball: 'arenas/basketball.svg',
    squash: 'arenas/squash.svg',
  };
  return `/images/${typeMap[type.toLowerCase()] || 'arenas/cricket.svg'}`;
};

/**
 * Arena type to display name mapping
 */
export const ARENA_TYPE_LABELS: Record<string, string> = {
  cricket: '🏏 Cricket',
  football: '⚽ Football',
  badminton: '🏸 Badminton',
  tennis: '🎾 Tennis',
  basketball: '🏀 Basketball',
  squash: '🎯 Squash',
};

/**
 * Get display label for arena type
 * @param type - The arena type
 * @returns Display name with emoji
 */
export const getArenaTypeLabel = (type: string): string => {
  return ARENA_TYPE_LABELS[type.toLowerCase()] || type;
};

/**
 * Arena type colors for badges and UI elements
 */
export const ARENA_TYPE_COLORS: Record<string, { primary: string; light: string }> = {
  cricket: { primary: '#8B4513', light: '#D2B48C' },
  football: { primary: '#1a7d1a', light: '#90EE90' },
  badminton: { primary: '#FFD700', light: '#FFFFE0' },
  tennis: { primary: '#D2691E', light: '#F0E68C' },
  basketball: { primary: '#FF8C00', light: '#FFE4B5' },
  squash: { primary: '#2E8B57', light: '#90EE90' },
};

/**
 * Get color theme for arena type
 * @param type - The arena type
 * @returns Object with primary and light colors
 */
export const getArenaTypeColors = (
  type: string
): { primary: string; light: string } => {
  return (
    ARENA_TYPE_COLORS[type.toLowerCase()] || {
      primary: '#333',
      light: '#f0f0f0',
    }
  );
};

/**
 * Arena features and amenities mapping
 */
export const ARENA_FEATURES: Record<string, string[]> = {
  cricket: [
    '🏟️ Professional Pitch',
    '💡 Floodlights',
    '🛁 Changing Rooms',
    '🅿️ Parking',
    '🎫 Equipment Rental',
    '📶 WiFi',
  ],
  football: [
    '⚽ FIFA-size Ground',
    '💡 Floodlights',
    '🛁 Changing Rooms',
    '🍽️ Cafeteria',
    '🅿️ Parking',
    '📶 WiFi',
  ],
  badminton: [
    '❄️ AC Courts',
    '🎾 Professional Equipment',
    '👨‍🏫 Coaching',
    '🗝️ Lockers',
    '🅿️ Parking',
    '☕ Cafe',
  ],
  tennis: [
    '🏆 Clay & Hard Courts',
    '👨‍🏫 Coaching Available',
    '🗝️ Lounge',
    '🅿️ Parking',
    '📶 WiFi',
    '🍹 Refreshments',
  ],
  basketball: [
    '🏀 Indoor Courts',
    '🎯 Professional Setup',
    '🗝️ Lockers',
    '🅿️ Parking',
    '📊 Scoring System',
    '☕ Cafe',
  ],
  squash: [
    '❄️ Climate Control',
    '🏆 Professional Setup',
    '👨‍🏫 Coaching',
    '🗝️ Lockers',
    '🚿 Shower',
    '🅿️ Parking',
  ],
};

/**
 * Get arena features for a specific type
 * @param type - The arena type
 * @returns Array of feature strings with emojis
 */
export const getArenaFeatures = (type: string): string[] => {
  return ARENA_FEATURES[type.toLowerCase()] || [];
};
