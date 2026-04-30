import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import { isAxiosError } from "axios";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { API_BASE_URL, GOOGLE_AUTH_CONFIG } from "@/constants/Config";
import { useAuth } from "@/context/AuthContext";

WebBrowser.maybeCompleteAuthSession();

const FALLBACK_CLIENT_ID = "missing-google-client-id.apps.googleusercontent.com";

type GoogleAuthAction = "Masuk" | "Daftar";

interface UseGoogleAuthOptions {
  action?: GoogleAuthAction;
  onSuccess?: () => void;
}

function getPlatformClientId() {
  if (Platform.OS === "android") {
    return GOOGLE_AUTH_CONFIG.androidClientId;
  }

  if (Platform.OS === "ios") {
    return GOOGLE_AUTH_CONFIG.iosClientId;
  }

  return GOOGLE_AUTH_CONFIG.webClientId;
}

function getAnyClientId() {
  return (
    GOOGLE_AUTH_CONFIG.webClientId ||
    GOOGLE_AUTH_CONFIG.androidClientId ||
    GOOGLE_AUTH_CONFIG.iosClientId ||
    FALLBACK_CLIENT_ID
  );
}

function getMissingConfigMessage() {
  const envName =
    Platform.OS === "android"
      ? "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"
      : Platform.OS === "ios"
        ? "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"
        : "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID";

  return `Tambahkan ${envName} di .env aplikasi, lalu restart Expo. Backend juga perlu GOOGLE_CLIENT_IDS/GOOGLE_*_CLIENT_ID yang sama.`;
}

function getErrorMessage(error: unknown) {
  if (isAxiosError(error)) {
    const apiMessage = error.response?.data?.message;

    if (Array.isArray(apiMessage)) {
      return apiMessage.join("\n");
    }

    if (typeof apiMessage === "string") {
      return apiMessage;
    }

    if (error.request) {
      return `Tidak dapat terhubung ke server ${API_BASE_URL}. Pastikan URL API sudah benar.`;
    }
  }

  return error instanceof Error
    ? error.message
    : "Google Auth gagal. Silakan coba lagi.";
}

export function useGoogleAuth({
  action = "Masuk",
  onSuccess,
}: UseGoogleAuthOptions = {}) {
  const { loginWithGoogleIdToken } = useAuth();
  const handledTokenRef = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);

  const platformClientId = useMemo(() => getPlatformClientId(), []);
  const isConfigured = Boolean(platformClientId);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: platformClientId || getAnyClientId(),
    webClientId: GOOGLE_AUTH_CONFIG.webClientId,
    androidClientId: GOOGLE_AUTH_CONFIG.androidClientId,
    iosClientId: GOOGLE_AUTH_CONFIG.iosClientId,
    selectAccount: true,
  });

  useEffect(() => {
    if (!response) return;

    if (response.type === "error") {
      Alert.alert(
        `${action} Google Gagal`,
        response.error?.message || "Google menolak proses autentikasi.",
      );
      setLoading(false);
      return;
    }

    if (response.type !== "success") {
      setLoading(false);
      return;
    }

    const idToken = response.params.id_token || response.authentication?.idToken;

    if (!idToken || handledTokenRef.current === idToken) {
      if (!idToken) {
        setLoading(false);
      }
      return;
    }

    handledTokenRef.current = idToken;

    loginWithGoogleIdToken(idToken)
      .then(() => {
        onSuccess?.();
      })
      .catch((error: unknown) => {
        handledTokenRef.current = null;
        Alert.alert(`${action} Google Gagal`, getErrorMessage(error));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [action, loginWithGoogleIdToken, onSuccess, response]);

  const startGoogleAuth = useCallback(async () => {
    if (!isConfigured) {
      Alert.alert("Google Auth Belum Siap", getMissingConfigMessage());
      return;
    }

    if (!request) {
      Alert.alert(
        "Google Auth Belum Siap",
        "Konfigurasi Google sedang disiapkan. Coba lagi beberapa detik.",
      );
      return;
    }

    try {
      setLoading(true);
      await promptAsync();
    } catch (error: unknown) {
      setLoading(false);
      Alert.alert(`${action} Google Gagal`, getErrorMessage(error));
    }
  }, [action, isConfigured, promptAsync, request]);

  return {
    disabled: loading || !request,
    loading,
    startGoogleAuth,
  };
}
