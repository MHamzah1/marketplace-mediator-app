const Colors = {
  // Blue and white palette for the Mediator app
  primary: '#246BFD',
  primaryDark: '#1557E5',
  primaryDarker: '#0E46BE',
  primaryLight: '#5F96FF',
  primaryLighter: '#9EC0FF',
  primarySoft: '#EAF2FF',
  primarySoftest: '#F5F9FF',

  // Gradient / hero surfaces
  gradientStart: '#1557E5',
  gradientMiddle: '#246BFD',
  gradientEnd: '#6EA8FE',

  // Accent
  accent: '#246BFD',
  accentLight: '#8DB5FF',
  accentSoft: '#EAF2FF',

  // Background & Surface
  background: '#FFFFFF',
  backgroundSecondary: '#F5F9FF',
  surface: '#FFFFFF',
  surfaceDark: '#1557E5',
  card: '#FFFFFF',
  cardDark: '#1557E5',
  inputFill: '#F4F8FF',
  inputFillDark: '#2D75FF',

  // Text
  text: '#16213D',
  textSecondary: '#5B6B8A',
  textTertiary: '#9AA9C3',
  textInverse: '#FFFFFF',
  textAccent: '#246BFD',

  // Border
  border: '#D8E5FF',
  borderLight: '#EAF2FF',
  borderFocus: '#246BFD',

  // Status
  success: '#1FBF75',
  successLight: '#EAFBF2',
  warning: '#FFB020',
  warningLight: '#FFF6E6',
  error: '#FF616D',
  errorLight: '#FFF1F3',
  info: '#246BFD',
  infoLight: '#EAF2FF',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.58)',
  overlayLight: 'rgba(0, 0, 0, 0.18)',

  // Shadows
  shadowColor: '#000000',

  // Tab bar
  tabActive: '#246BFD',
  tabInactive: '#93A3BF',
  tabBackground: '#FFFFFF',

  // Category accents retained for non-home modules
  categoryAll: '#246BFD',
  categorySUV: '#635BFF',
  categorySedan: '#246BFD',
  categoryHatchback: '#1FBF75',
  categoryMPV: '#FF9F1C',
  categoryPickup: '#FF616D',
  categorySport: '#FFB020',
};

export const Shadows = {
  small: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  blue: {
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.24,
    shadowRadius: 16,
    elevation: 6,
  },
};

export default Colors;
