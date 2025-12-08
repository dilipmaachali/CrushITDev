/**
 * Accessibility Constants for CrushIT App
 * WCAG 2.1 AA Compliance
 */

// Minimum Touch Target Sizes (WCAG 2.5.5)
export const TOUCH_TARGET = {
  MINIMUM: 44,      // Minimum for all interactive elements
  COMFORTABLE: 48,  // Recommended comfortable size
  LARGE: 52,        // For primary actions
  EXTRA_LARGE: 56,  // For critical actions
};

// Text Scaling Limits
export const TEXT_SCALE = {
  MIN: 0.85,
  MAX: 2.0,         // Support up to 200% scaling
  DEFAULT: 1.0,
};

// Contrast Ratios (WCAG 1.4.3)
export const CONTRAST = {
  NORMAL_TEXT: 4.5,     // 4.5:1 for normal text
  LARGE_TEXT: 3.0,      // 3:1 for large text (18pt+)
  UI_COMPONENTS: 3.0,   // 3:1 for UI components
};

// Animation Durations (respects prefers-reduced-motion)
export const ANIMATION = {
  INSTANT: 0,
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
};

// Focus Indicator
export const FOCUS = {
  WIDTH: 3,
  COLOR: '#4A90E2',
  OFFSET: 2,
};

// Screen Reader Announcements
export const ANNOUNCEMENTS = {
  POLITE: 'polite',     // Non-urgent updates
  ASSERTIVE: 'assertive', // Urgent updates
  OFF: 'none',
} as const;

// Accessibility Hints
export const HINTS = {
  TAP: 'Double tap to activate',
  SWIPE: 'Swipe to scroll',
  LONG_PRESS: 'Long press for options',
  TOGGLE: 'Double tap to toggle',
};

// Semantic Roles
export const ROLES = {
  BUTTON: 'button',
  LINK: 'link',
  HEADER: 'header',
  IMAGE: 'image',
  SEARCH: 'search',
  SWITCH: 'switch',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  TAB: 'tab',
  MENU: 'menu',
  MENUITEM: 'menuitem',
  ALERT: 'alert',
  PROGRESSBAR: 'progressbar',
} as const;

// Color Blind Safe Palette
export const COLOR_BLIND_SAFE = {
  // These colors are distinguishable for all types of color blindness
  BLUE: '#0077BB',      // Protanopia/Deuteranopia safe
  ORANGE: '#EE7733',    // Protanopia/Deuteranopia safe
  GREEN: '#009988',     // Alternative green
  PURPLE: '#AA3377',    // Tritanopia safe
  YELLOW: '#CCBB44',    // Universal
  RED: '#CC3311',       // Use sparingly, pair with icons
};

// Error State Indicators (not relying on color alone)
export const ERROR_INDICATORS = {
  USE_ICONS: true,
  USE_PATTERNS: true,  // Use striped patterns or borders
  USE_LABELS: true,    // Always label errors
};

// High Contrast Mode Multipliers
export const HIGH_CONTRAST = {
  BORDER_WIDTH: 2,
  TEXT_WEIGHT_BOOST: 100, // Add 100 to font weight
  SHADOW_INTENSITY: 1.5,
};
