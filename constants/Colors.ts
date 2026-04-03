/**
 * Mediator App Color Palette
 * Blue theme with white secondary
 */

const Colors = {
  // Primary Blue
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryDarker: '#1E40AF',
  primaryLight: '#3B82F6',
  primaryLighter: '#60A5FA',
  primarySoft: '#DBEAFE',
  primarySoftest: '#EFF6FF',

  // Gradient
  gradientStart: '#1E40AF',
  gradientMiddle: '#2563EB',
  gradientEnd: '#0284C7',

  // Accent (Sky Blue)
  accent: '#0EA5E9',
  accentLight: '#38BDF8',
  accentSoft: '#E0F2FE',

  // Background & Surface
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text
  text: '#0F172A',
  textSecondary: '#475569',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  textAccent: '#2563EB',

  // Border
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderFocus: '#2563EB',

  // Status
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Neutral
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',

  // Shadows (used in shadow styles)
  shadowColor: '#000000',

  // Tab bar
  tabActive: '#2563EB',
  tabInactive: '#94A3B8',
  tabBackground: '#FFFFFF',

  // Category colors
  categoryAll: '#2563EB',
  categorySUV: '#7C3AED',
  categorySedan: '#0891B2',
  categoryHatchback: '#059669',
  categoryMPV: '#D97706',
  categoryPickup: '#DC2626',
  categorySport: '#E11D48',
};

export const Shadows = {
  small: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  large: {
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },
  blue: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
};

export default Colors;
