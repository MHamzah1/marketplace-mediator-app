import axiosInstance from "./axiosInstance";
import type {
  Listing,
  FilterParams,
  PaginatedResponse,
  ApiResponse,
  WhatsAppLinkResponse,
  MyListingsResponse,
  SellerProfile,
} from "@/types";

// Get all listings (public)
export async function fetchListings(
  params: FilterParams = {},
): Promise<PaginatedResponse<Listing>> {
  const response = await axiosInstance.get("/marketplace/listings", { params });
  return response.data;
}

// Get featured listings (public)
export async function fetchFeaturedListings(
  limit = 10,
  category?: string,
): Promise<{ data: Listing[]; total: number }> {
  const response = await axiosInstance.get("/marketplace/featured", {
    params: { limit, category },
  });
  return response.data;
}

// Get listing detail (public)
export async function fetchListingDetail(
  id: string,
): Promise<ApiResponse<Listing>> {
  const response = await axiosInstance.get(`/marketplace/listings/${id}`);
  return response.data;
}

// Get WhatsApp link (authenticated)
export async function getWhatsAppLink(
  id: string,
): Promise<WhatsAppLinkResponse> {
  const response = await axiosInstance.get(
    `/marketplace/listings/${id}/whatsapp`,
  );
  return response.data;
}

// Get seller profile (public)
export async function fetchSellerProfile(
  id: string,
): Promise<ApiResponse<SellerProfile>> {
  const response = await axiosInstance.get(`/marketplace/seller/${id}/profile`);
  return response.data;
}

// Get my listings (authenticated)
export async function fetchMyListings(
  params: FilterParams = {},
): Promise<MyListingsResponse> {
  const response = await axiosInstance.get("/marketplace/my-listings", {
    params,
  });
  return response.data;
}

// Get my listing detail (authenticated)
export async function fetchMyListingDetail(
  id: string,
): Promise<ApiResponse<Listing>> {
  const response = await axiosInstance.get(`/marketplace/my-listings/${id}`);
  return response.data;
}

// Create listing (authenticated) with file upload
export async function createListing(
  data: Record<string, string>,
  images: { uri: string; type: string; name: string }[],
): Promise<ApiResponse<Listing>> {
  const formData = new FormData();

  // Append text fields
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });

  // Append images
  images.forEach((img) => {
    formData.append("images", {
      uri: img.uri,
      type: img.type || "image/jpeg",
      name: img.name || `photo-${Date.now()}.jpg`,
    } as unknown as Blob);
  });

  const response = await axiosInstance.post("/marketplace/listings", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

// Update listing (authenticated)
export async function updateListing(
  id: string,
  data: Record<string, string>,
  images?: { uri: string; type: string; name: string }[],
): Promise<ApiResponse<Listing>> {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      formData.append(key, value);
    }
  });

  if (images && images.length > 0) {
    images.forEach((img) => {
      formData.append("images", {
        uri: img.uri,
        type: img.type || "image/jpeg",
        name: img.name || `photo-${Date.now()}.jpg`,
      } as unknown as Blob);
    });
  }

  const response = await axiosInstance.put(
    `/marketplace/listings/${id}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    },
  );
  return response.data;
}

// Delete listing (authenticated)
export async function deleteListing(
  id: string,
): Promise<{ message: string; deletedId: string }> {
  const response = await axiosInstance.delete(`/marketplace/listings/${id}`);
  return response.data;
}
