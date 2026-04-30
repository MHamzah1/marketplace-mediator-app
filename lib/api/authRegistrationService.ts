import axiosInstance from "./axiosInstance";
import type {
  PendingRegistrationData,
  PendingRegistrationPhoto,
} from "@/lib/auth/pendingRegistration";
import type { ApiResponse, User } from "@/types";

export interface RequestRegisterEmailResponse {
  message: string;
  expiresInSeconds: number;
  devOtp?: string;
}

export interface VerifyRegisterOtpResponse {
  message: string;
  verificationToken: string;
  expiresInSeconds: number;
}

export interface CompleteMarketplaceRegistrationPayload
  extends Required<
    Pick<
      PendingRegistrationData,
      "email" | "verificationToken" | "password" | "fullName" | "phoneNumber" | "pin"
    >
  > {
  nickName?: string;
  whatsappNumber?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  biometricEnabled?: boolean;
  profilePhoto?: PendingRegistrationPhoto;
}

export interface CompleteRegistrationResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  user: User;
}

export async function requestRegisterEmail(email: string) {
  const response = await axiosInstance.post<RequestRegisterEmailResponse>(
    "/auth/register/request-email",
    { email },
  );
  return response.data;
}

export async function verifyRegisterOtp(email: string, otp: string) {
  const response = await axiosInstance.post<VerifyRegisterOtpResponse>(
    "/auth/register/verify-otp",
    { email, otp },
  );
  return response.data;
}

export async function completeMarketplaceRegistration(
  data: CompleteMarketplaceRegistrationPayload,
) {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (key === "profilePhoto" || value === undefined || value === "") return;
    formData.append(key, String(value));
  });

  if (data.profilePhoto) {
    formData.append("profilePhoto", {
      uri: data.profilePhoto.uri,
      type: data.profilePhoto.type || "image/jpeg",
      name: data.profilePhoto.name || `profile-${Date.now()}.jpg`,
    } as unknown as Blob);
  }

  const response = await axiosInstance.post<
    ApiResponse<CompleteRegistrationResponse> | CompleteRegistrationResponse
  >("/auth/register/complete", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
}
