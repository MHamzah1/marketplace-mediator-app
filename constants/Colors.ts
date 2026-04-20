// Mediator monochromatic palette (Carea-style). Black/white primaries with neutral grays and
// subtle accent tones. Exposes both light and dark themes; the default export stays pointing at
// the light theme so existing screens keep working without touching each import.

export type ThemeMode = "light" | "dark";

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
  // Blue + white — clean, modern, pairs well with white surfaces.
  // Primary blue tuned for high contrast on white (WCAG AA) and strong CTA presence.
  primary: "#2563EB",
  primaryDark: "#1D4ED8",
  primaryDarker: "#1E40AF",
  primaryLight: "#3B82F6",
  primaryLighter: "#60A5FA",
  primarySoft: "#DBEAFE",
  primarySoftest: "#EFF6FF",

  // Hero / gradient surfaces for splash, reset-password, etc.
  gradientStart: "#1E40AF",
  gradientMiddle: "#2563EB",
  gradientEnd: "#3B82F6",

  // Accent: warm amber used for ratings / emphasis
  accent: "#F59E0B",
  accentLight: "#FBBF24",
  accentSoft: "#FEF3C7",

  // Background & Surface
  background: "#FFFFFF",
  backgroundSecondary: "#F4F7FC",
  surface: "#FFFFFF",
  surfaceDark: "#1D4ED8",
  card: "#FFFFFF",
  cardDark: "#1E40AF",
  inputFill: "#F1F5FB",
  inputFillDark: "#1E40AF",

  // Text
  text: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#94A3B8",
  textInverse: "#FFFFFF",
  textAccent: "#2563EB",

  // Border
  border: "#E2E8F0",
  borderLight: "#EEF2F7",
  borderFocus: "#2563EB",

  // Status
  success: "#10B981",
  successLight: "#ECFDF5",
  warning: "#F59E0B",
  warningLight: "#FFFBEB",
  error: "#EF4444",
  errorLight: "#FEF2F2",
  info: "#2563EB",
  infoLight: "#EFF6FF",

  // Neutral
  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(15, 23, 42, 0.58)",
  overlayLight: "rgba(15, 23, 42, 0.18)",

  // Shadows
  shadowColor: "#0F172A",

  // Tab bar
  tabActive: "#2563EB",
  tabInactive: "#94A3B8",
  tabBackground: "#FFFFFF",

  // Category accents
  categoryAll: "#2563EB",
  categorySUV: "#635BFF",
  categorySedan: "#2563EB",
  categoryHatchback: "#10B981",
  categoryMPV: "#F59E0B",
  categoryPickup: "#EF4444",
  categorySport: "#F59E0B",
};

export const DarkColors: ThemePalette = {
  // Dark navy surfaces with a softer sky-blue primary so CTAs stay visible.
  primary: "#60A5FA",
  primaryDark: "#3B82F6",
  primaryDarker: "#2563EB",
  primaryLight: "#93C5FD",
  primaryLighter: "#BFDBFE",
  primarySoft: "#172554",
  primarySoftest: "#0F1B3F",

  gradientStart: "#0B1220",
  gradientMiddle: "#111B34",
  gradientEnd: "#1E3A8A",

  accent: "#FBBF24",
  accentLight: "#FCD34D",
  accentSoft: "#3A2F12",

  background: "#0B1220",
  backgroundSecondary: "#111B34",
  surface: "#111B34",
  surfaceDark: "#0B1220",
  card: "#111B34",
  cardDark: "#0B1220",
  inputFill: "#152043",
  inputFillDark: "#1B2A55",

  text: "#E2E8F0",
  textSecondary: "#94A3B8",
  textTertiary: "#64748B",
  textInverse: "#0F172A",
  textAccent: "#93C5FD",

  border: "#1F2A4C",
  borderLight: "#182340",
  borderFocus: "#60A5FA",

  success: "#10B981",
  successLight: "#0F2B24",
  warning: "#F59E0B",
  warningLight: "#2E2416",
  error: "#F87171",
  errorLight: "#2E1919",
  info: "#60A5FA",
  infoLight: "#16213E",

  white: "#FFFFFF",
  black: "#000000",
  overlay: "rgba(3, 7, 18, 0.72)",
  overlayLight: "rgba(3, 7, 18, 0.36)",

  shadowColor: "#000000",

  tabActive: "#60A5FA",
  tabInactive: "#64748B",
  tabBackground: "#0B1220",

  categoryAll: "#60A5FA",
  categorySUV: "#A5B4FC",
  categorySedan: "#60A5FA",
  categoryHatchback: "#34D399",
  categoryMPV: "#FBBF24",
  categoryPickup: "#F87171",
  categorySport: "#FCD34D",
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
