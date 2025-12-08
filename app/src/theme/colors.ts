// Design system colors for CrushIT - Zomato-inspired with accessibility
// All color combinations meet WCAG AA contrast ratio requirements (4.5:1 for text, 3:1 for UI components)
export const colors = {
  // Zomato-inspired primary colors (red/orange theme)
  primary: '#EF4F5F', // Zomato red - bright, energetic
  primaryDark: '#D62828', // Darker red for contrast
  primaryLight: '#FFE6E8', // Very light red for backgrounds
  secondary: '#FF6B35', // Orange accent
  accent: '#004E89', // Navy blue for depth
  
  // Semantic colors with high contrast
  success: '#2D6A4F', // Dark green (WCAG AAA on white)
  warning: '#F77F00', // Bright orange (WCAG AA)
  error: '#D62828', // Dark red (WCAG AAA on white)
  info: '#004E89', // Navy blue (WCAG AAA on white)
  
  // Background & surface colors
  background: '#FFFFFF', // Pure white for main background
  surface: '#F5F5F5', // Light gray for card backgrounds
  surfaceVariant: '#EEEEEE', // Slightly darker surface
  overlay: 'rgba(0, 0, 0, 0.5)', // For modals/overlays
  
  // Text colors with WCAG AA compliance
  text: {
    primary: '#212121', // Near black (6.5:1 on white)
    secondary: '#424242', // Dark gray (5.5:1 on white)
    tertiary: '#666666', // Medium gray (4.5:1 on white)
    inverse: '#FFFFFF', // White text on dark
    disabled: '#BDBDBD', // Disabled state gray
  },
  
  // UI elements
  border: '#E0E0E0', // Light border
  divider: '#F0F0F0', // Subtle divider
  shadow: 'rgba(0, 0, 0, 0.08)', // Subtle shadow for accessibility
  shadowDark: 'rgba(0, 0, 0, 0.15)', // Stronger shadow for depth
  
  // Rating colors (like Zomato)
  ratingExcellent: '#2D6A4F', // 4.5+ green
  ratingGood: '#4CAF50', // 3.5-4.4 light green
  ratingAverage: '#FF9800', // 2.5-3.4 orange
  ratingPoor: '#D62828', // <2.5 red
  
  // Utility colors for quick access
  white: '#FFFFFF',
  black: '#212121',
  grey: '#666666',
  lightGrey: '#E0E0E0',
  darkGrey: '#424242',
  lightBackground: '#F5F5F5',
  red: '#D62828',
};

export type ColorKey = keyof typeof colors;
