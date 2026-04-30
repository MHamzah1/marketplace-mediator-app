/**
 * App configuration constants
 */
import Constants from "expo-constants";
import type { InspectionPackage } from "@/types";

const DEFAULT_API_BASE_URL = "http://localhost:8080/api";

function getConfiguredApiBaseUrl() {
  return (
    process.env.EXPO_PUBLIC_API_URL ??
    process.env.API_BASE_URL ??
    DEFAULT_API_BASE_URL
  ).trim();
}

function getExpoDevHost() {
  const expoGoConfig = Constants.expoGoConfig as {
    debuggerHost?: string;
  } | null;
  const hostUri =
    Constants.expoConfig?.hostUri ?? expoGoConfig?.debuggerHost ?? null;

  if (!hostUri) {
    return null;
  }

  return hostUri.split(":")[0] || null;
}

function resolveApiBaseUrl() {
  const configuredUrl = getConfiguredApiBaseUrl();

  try {
    const parsedUrl = new URL(configuredUrl);
    const isLocalhost = ["localhost", "127.0.0.1", "::1"].includes(
      parsedUrl.hostname,
    );

    if (__DEV__ && isLocalhost) {
      const devHost = getExpoDevHost();
      if (devHost) {
        parsedUrl.hostname = devHost;
      }
    }

    return parsedUrl.toString().replace(/\/$/, "");
  } catch {
    return configuredUrl.replace(/\/$/, "");
  }
}

export const API_BASE_URL = resolveApiBaseUrl();

export const GOOGLE_AUTH_CONFIG = {
  webClientId:
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || undefined,
  androidClientId:
    process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || undefined,
  iosClientId:
    process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || undefined,
};

export const APP_CONFIG = {
  name: "Mediator",
  tagline: "Marketplace Mobil Terpercaya",
  version: "1.0.0",
  supportEmail: "info@mediator.com",
  supportPhone: "+62 812-3456-7890",
};

if (__DEV__) {
  console.log("API_BASE_URL:", API_BASE_URL);
}

export const PAGINATION = {
  defaultPageSize: 10,
  listingPageSize: 12,
};

export const CAR_CATEGORIES = [
  { id: "all", label: "Semua", icon: "car-sport" },
  { id: "suv", label: "SUV", icon: "car" },
  { id: "sedan", label: "Sedan", icon: "car-outline" },
  { id: "hatchback", label: "Hatchback", icon: "car-sport-outline" },
  { id: "mpv", label: "MPV", icon: "bus" },
  { id: "pickup", label: "Pickup", icon: "car" },
  { id: "sport", label: "Sport", icon: "speedometer" },
] as const;

export const LOAN_TERMS = [12, 24, 36, 48, 60] as const;

export const INSPECTION_PACKAGES: readonly InspectionPackage[] = [
  {
    id: "basic",
    name: "Basic",
    price: 350000,
    duration: "1-2 Jam",
    points: 75,
    features: [
      "Pengecekan eksterior",
      "Pengecekan interior",
      "Tes mesin dasar",
      "Cek dokumen kendaraan",
      "Laporan digital",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 650000,
    duration: "2-3 Jam",
    points: 150,
    popular: true,
    features: [
      "Semua fitur Basic",
      "Scan komputer OBD-II",
      "Tes jalan (road test)",
      "Pengecekan kelistrikan",
      "Pengecekan suspensi & rem",
      "Cek riwayat kecelakaan",
      "Foto dokumentasi 50+",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 1200000,
    duration: "3-4 Jam",
    points: 250,
    features: [
      "Semua fitur Standard",
      "Pengecekan cat (thickness meter)",
      "Tes emisi gas buang",
      "Analisis transmisi mendalam",
      "Pengecekan frame & chassis",
      "Garansi laporan 30 hari",
      "Konsultasi mekanik senior",
      "Video dokumentasi lengkap",
    ],
  },
];
