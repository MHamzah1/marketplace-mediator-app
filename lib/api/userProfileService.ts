import axiosInstance from "./axiosInstance";
import type { ApiResponse, User } from "@/types";

export interface ProfilePhotoUpload {
  uri: string;
  type?: string;
  name?: string;
}

export interface UpdateProfilePayload {
  fullName: string;
  nickName?: string;
  phoneNumber: string;
  whatsappNumber?: string;
  location?: string;
  dateOfBirth?: string;
  gender?: string;
  bio?: string;
  address?: string;
  city?: string;
  province?: string;
  instagram?: string;
  facebook?: string;
  website?: string;
}

export async function updateMyProfile(
  data: UpdateProfilePayload,
  profilePhoto?: ProfilePhotoUpload | null,
): Promise<User> {
  const formData = new FormData();
  const skipWhenEmpty = new Set(["dateOfBirth", "whatsappNumber"]);

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && (value !== "" || !skipWhenEmpty.has(key))) {
      formData.append(key, value);
    }
  });

  if (profilePhoto) {
    formData.append("profilePhoto", {
      uri: profilePhoto.uri,
      type: profilePhoto.type || "image/jpeg",
      name: profilePhoto.name || `profile-${Date.now()}.jpg`,
    } as unknown as Blob);
  }

  const response = await axiosInstance.put<ApiResponse<User> | User>(
    "/users/profile",
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );

  const payload = response.data;
  return "data" in payload ? payload.data : payload;
}
