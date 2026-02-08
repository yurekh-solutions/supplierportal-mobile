// RitzYard Seller Portal Theme Colors - Terracotta Earth Tones
// For React Native / Mobile App Usage

export const colors = {
  // Primary: Rust Orange/Terracotta
  primary: '#C94F31',
  primaryLight: '#d47050',
  primaryDark: '#a84a2f',
  primaryGlow: '#e07059',
  
  // Premium Gradient Colors
  gradient1: '#c54e30', // Rust orange-brown
  gradient2: '#643526', // Dark brown
  
  // Secondary: Deep Earth Brown
  secondary: '#5c2d23',
  secondaryLight: '#7a4a3a',
  secondaryDark: '#3d1f16',
  secondaryDeep: '#4a1f1a',
  
  // Background & Neutrals
  background: '#f7f5f2',      // Warm Cream
  backgroundAlt: '#f4f0ec',   // Warm Cream Alt
  backgroundPink: '#fef2f0',  // Light pink tint
  card: '#ffffff',
  cardAlt: '#faf8f6',
  
  // Text
  text: '#352f28',            // Dark text
  textLight: '#6b6258',       // Muted text
  textMuted: '#9a8f84',       // Very muted
  textInverse: '#ffffff',
  
  // Borders
  border: '#e5ddd6',
  borderLight: '#ede9e3',
  
  // Accent: Warm Clay
  accent: '#e8dcd4',
  accentLight: '#ede9e3',
  accentDark: '#d4c5b9',
  
  // Status Colors
  success: '#10b981',
  successLight: '#d1fae5',
  warning: '#f59e0b',
  warningLight: '#fef3c7',
  error: '#ef4444',
  errorLight: '#fee2e2',
  info: '#3b82f6',
  infoLight: '#dbeafe',
  
  // Live indicator
  live: '#22c55e',
  
  // Glass Morphism
  glassBg: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

export const gradients = {
  primary: ['#c15738', '#e07059'] as const,
  secondary: ['#5c2d23', '#7a4a3a'] as const,
  warm: ['#f7f5f2', '#ede9e3'] as const,
  premium: ['#c54e30', '#643526'] as const,
  premiumReverse: ['#643526', '#c54e30'] as const,
  hero: ['#a84a2f', '#5c2d23'] as const,
  pink: ['#fef2f0', '#f7f5f2'] as const,
};

export const shadows = {
  sm: {
    shadowColor: '#c15738',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#c15738',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#c15738',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#e07059',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
};

// Utility function
export const rgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Complete theme object for React Native
export const theme = {
  colors,
  gradients,
  shadows,
  spacing,
  borderRadius,
  fonts,
  fontSizes,
};

export default theme;
