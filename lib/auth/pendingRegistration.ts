import * as SecureStore from "expo-secure-store";

const PENDING_REGISTRATION_KEY = "pendingMarketplaceRegistration";

export interface PendingRegistrationPhoto {
  uri: string;
  type: string;
  name: string;
}

export interface PendingRegistrationData {
  email?: string;
  verificationToken?: string;
  password?: string;
  fullName?: string;
  nickName?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePhoto?: PendingRegistrationPhoto;
  pin?: string;
}

export async function getPendingRegistration() {
  const raw = await SecureStore.getItemAsync(PENDING_REGISTRATION_KEY);
  if (!raw) return {};

  try {
    return JSON.parse(raw) as PendingRegistrationData;
  } catch {
    await SecureStore.deleteItemAsync(PENDING_REGISTRATION_KEY);
    return {};
  }
}

export async function mergePendingRegistration(
  data: PendingRegistrationData,
) {
  const current = await getPendingRegistration();
  const next = { ...current, ...data };
  await SecureStore.setItemAsync(PENDING_REGISTRATION_KEY, JSON.stringify(next));
  return next;
}

export async function clearPendingRegistration() {
  await SecureStore.deleteItemAsync(PENDING_REGISTRATION_KEY);
}
