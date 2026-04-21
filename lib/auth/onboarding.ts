import * as SecureStore from "expo-secure-store";

const ONBOARDING_KEY = "mediator:onboarding_seen";

export async function getOnboardingSeen() {
  try {
    return (await SecureStore.getItemAsync(ONBOARDING_KEY)) === "true";
  } catch {
    return false;
  }
}

export async function setOnboardingSeen(value = true) {
  try {
    if (value) {
      await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
      return;
    }

    await SecureStore.deleteItemAsync(ONBOARDING_KEY);
  } catch {
    // Ignore storage issues and keep the app usable.
  }
}
