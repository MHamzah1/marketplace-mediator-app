import { Alert } from "react-native";
import type { Router } from "expo-router";

type LoginReason = "whatsapp" | "sell" | "manage-listings" | "protected";

interface RequireAuthOptions {
  redirectTo: string;
  message: string;
  title?: string;
  reason?: LoginReason;
}

export function buildLoginRoute(
  redirectTo: string,
  reason: LoginReason = "protected",
) {
  return {
    pathname: "/(auth)/login",
    params: {
      redirectTo,
      reason,
    },
  } as const;
}

export function redirectToLogin(
  router: Router,
  redirectTo: string,
  reason: LoginReason = "protected",
  replace = false,
) {
  const route = buildLoginRoute(redirectTo, reason);

  if (replace) {
    router.replace(route as never);
    return;
  }

  router.push(route as never);
}

export function requireAuth(
  router: Router,
  isLoggedIn: boolean,
  options: RequireAuthOptions,
) {
  if (isLoggedIn) {
    return true;
  }

  Alert.alert(options.title || "Login Diperlukan", options.message, [
    { text: "Nanti", style: "cancel" },
    {
      text: "Masuk",
      onPress: () =>
        redirectToLogin(
          router,
          options.redirectTo,
          options.reason || "protected",
        ),
    },
  ]);

  return false;
}
