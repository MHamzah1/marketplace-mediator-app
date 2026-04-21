import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useColorScheme } from "react-native";
import * as SecureStore from "expo-secure-store";
import {
  DarkColors,
  LightColors,
  type ThemeMode,
  type ThemePalette,
} from "@/constants/Colors";

type ThemePreference = ThemeMode | "system";

interface ThemeContextValue {
  mode: ThemeMode;
  preference: ThemePreference;
  colors: ThemePalette;
  isDark: boolean;
  setPreference: (preference: ThemePreference) => void;
  toggle: () => void;
}

const STORAGE_KEY = "mediator_theme_preference";

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>("system");

  useEffect(() => {
    let mounted = true;
    SecureStore.getItemAsync(STORAGE_KEY)
      .then((value) => {
        if (!mounted || !value) return;
        if (value === "light" || value === "dark" || value === "system") {
          setPreferenceState(value);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    SecureStore.setItemAsync(STORAGE_KEY, next).catch(() => {});
  }, []);

  const mode: ThemeMode = useMemo(() => {
    if (preference === "system") {
      return system === "dark" ? "dark" : "light";
    }
    return preference;
  }, [preference, system]);

  const colors = mode === "dark" ? DarkColors : LightColors;
  const isDark = mode === "dark";

  const toggle = useCallback(() => {
    setPreference(isDark ? "light" : "dark");
  }, [isDark, setPreference]);

  const value: ThemeContextValue = {
    mode,
    preference,
    colors,
    isDark,
    setPreference,
    toggle,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within a ThemeProvider");
  return ctx;
};

export default ThemeContext;
