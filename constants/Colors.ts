const Colors = {
  // Primary neutral palette inspired by the Figma mobile kit
  primary: '#1F222A',
  primaryDark: '#181A20',
  primaryDarker: '#111318',
  primaryLight: '#35383F',
  primaryLighter: '#494E57',
  primarySoft: '#F3F5F7',
  primarySoftest: '#FAFBFC',

  // Gradient / hero surfaces
  gradientStart: '#181A20',
  gradientMiddle: '#1F222A',
  gradientEnd: '#2C313A',

  // Accent
  accent: '#246BFD',
  accentLight: '#6EA8FE',
  accentSoft: '#EAF2FF',

  // Background & Surface
  background: '#FFFFFF',
  backgroundSecondary: '#F7F8FA',
  surface: '#FFFFFF',
  surfaceDark: '#1F222A',
  card: '#FFFFFF',
  cardDark: '#1F222A',
  inputFill: '#F7F8FA',
  inputFillDark: '#262A34',

  // Text
  text: '#1B1E28',
  textSecondary: '#61677D',
  textTertiary: '#9EA3AE',
  textInverse: '#FFFFFF',
  textAccent: '#246BFD',

  // Border
  border: '#EEEEEE',
  borderLight: '#F3F4F6',
  borderFocus: '#1F222A',

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
  tabActive: '#1B1E28',
  tabInactive: '#8F959E',
  tabBackground: '#FFFFFF',

  // Category accents retained for non-home modules
  categoryAll: '#1F222A',
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
