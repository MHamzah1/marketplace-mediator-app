// Mediator monochromatic palette (Carea-style). Black/white primaries with neutral grays and
// subtle accent tones. Exposes both light and dark themes; the default export stays pointing at
// the light theme so existing screens keep working without touching each import.

export type ThemeMode = 'light' | 'dark';

export interface ThemePalette {
  // Brand
  primary: string;
  primaryDark: string;
  primaryDarker: string;
  primaryLight: string;
  primaryLighter: string;
  primarySoft: string;
  primarySoftest: string;

  // Gradient / hero surfaces
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;

  // Accent
  accent: string;
  accentLight: string;
  accentSoft: string;

  // Background & Surface
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceDark: string;
  card: string;
  cardDark: string;
  inputFill: string;
  inputFillDark: string;

  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textAccent: string;

  // Border
  border: string;
  borderLight: string;
  borderFocus: string;

  // Status
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  error: string;
  errorLight: string;
  info: string;
  infoLight: string;

  // Neutral
  white: string;
  black: string;
  overlay: string;
  overlayLight: string;

  // Shadows
  shadowColor: string;

  // Tab bar
  tabActive: string;
  tabInactive: string;
  tabBackground: string;

  // Category accents retained for non-home modules
  categoryAll: string;
  categorySUV: string;
  categorySedan: string;
  categoryHatchback: string;
  categoryMPV: string;
  categoryPickup: string;
  categorySport: string;
}

export const LightColors: ThemePalette = {
  // Black/white monochromatic — primary action is near-black
  primary: '#181A20',
  primaryDark: '#0D0E12',
  primaryDarker: '#000000',
  primaryLight: '#35383F',
  primaryLighter: '#70757F',
  primarySoft: '#F5F5F5',
  primarySoftest: '#FAFAFA',

  // Dark hero surfaces (used by forgot-password / reset-password)
  gradientStart: '#0D0E12',
  gradientMiddle: '#181A20',
  gradientEnd: '#1F222A',

  // Accent: warm amber used for ratings / emphasis
  accent: '#FFB800',
  accentLight: '#FFD766',
  accentSoft: '#FFF7DF',

  // Background & Surface
  background: '#FFFFFF',
  backgroundSecondary: '#F7F7F8',
  surface: '#FFFFFF',
  surfaceDark: '#181A20',
  card: '#FFFFFF',
  cardDark: '#1F222A',
  inputFill: '#F5F5F6',
  inputFillDark: '#1F222A',

  // Text
  text: '#181A20',
  textSecondary: '#5B6169',
  textTertiary: '#9CA0A8',
  textInverse: '#FFFFFF',
  textAccent: '#181A20',

  // Border
  border: '#E4E6EA',
  borderLight: '#EFEFF1',
  borderFocus: '#181A20',

  // Status
  success: '#1FBF75',
  successLight: '#E8F9F0',
  warning: '#FFB020',
  warningLight: '#FFF6E6',
  error: '#FF4D4F',
  errorLight: '#FFECEC',
  info: '#3D7BFF',
  infoLight: '#E8F0FF',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.58)',
  overlayLight: 'rgba(0, 0, 0, 0.18)',

  // Shadows
  shadowColor: '#000000',

  // Tab bar
  tabActive: '#181A20',
  tabInactive: '#9CA0A8',
  tabBackground: '#FFFFFF',

  // Category accents
  categoryAll: '#181A20',
  categorySUV: '#635BFF',
  categorySedan: '#181A20',
  categoryHatchback: '#1FBF75',
  categoryMPV: '#FF9F1C',
  categoryPickup: '#FF616D',
  categorySport: '#FFB020',
};

export const DarkColors: ThemePalette = {
  // In dark mode the "primary" action surface becomes white-ish — per Figma
  primary: '#F4F4F5',
  primaryDark: '#E4E4E7',
  primaryDarker: '#FFFFFF',
  primaryLight: '#35383F',
  primaryLighter: '#5B6169',
  primarySoft: '#1F222A',
  primarySoftest: '#181A20',

  gradientStart: '#0D0E12',
  gradientMiddle: '#181A20',
  gradientEnd: '#1F222A',

  accent: '#FFB800',
  accentLight: '#FFD766',
  accentSoft: '#3A2F12',

  background: '#0D0E12',
  backgroundSecondary: '#181A20',
  surface: '#181A20',
  surfaceDark: '#0D0E12',
  card: '#1F222A',
  cardDark: '#0D0E12',
  inputFill: '#1F222A',
  inputFillDark: '#23262E',

  text: '#F4F4F5',
  textSecondary: '#B0B4BC',
  textTertiary: '#6F7580',
  textInverse: '#181A20',
  textAccent: '#F4F4F5',

  border: '#23262E',
  borderLight: '#1F222A',
  borderFocus: '#F4F4F5',

  success: '#1FBF75',
  successLight: '#0F2A1F',
  warning: '#FFB020',
  warningLight: '#2E2416',
  error: '#FF6B6D',
  errorLight: '#2E1919',
  info: '#6694FF',
  infoLight: '#18213A',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.72)',
  overlayLight: 'rgba(0, 0, 0, 0.36)',

  shadowColor: '#000000',

  tabActive: '#F4F4F5',
  tabInactive: '#6F7580',
  tabBackground: '#0D0E12',

  categoryAll: '#F4F4F5',
  categorySUV: '#8F88FF',
  categorySedan: '#F4F4F5',
  categoryHatchback: '#3DD495',
  categoryMPV: '#FFB35E',
  categoryPickup: '#FF8D96',
  categorySport: '#FFC752',
};

// Back-compat default export used by screens that import `Colors` directly.
// Theme-aware screens should call `useTheme()` instead.
const Colors: ThemePalette = LightColors;

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
