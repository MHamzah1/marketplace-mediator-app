import { API_BASE_URL } from "@/constants/Config";

/**
 * Resolve image URL from backend.
 * Backend stores relative paths like /uploads/listings/file.jpg
 * We need to prepend the API base URL (without /api suffix)
 */
export function resolveImageUrl(
  path: string | undefined | null,
): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  // Remove /api from the end of base URL to get server root
  const serverRoot = API_BASE_URL.replace(/\/api\/?$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${serverRoot}${cleanPath}`;
}

/**
 * Format price to Indonesian Rupiah
 */
export function formatRupiah(num: number): string {
  if (num >= 1_000_000_000) {
    return `Rp ${(num / 1_000_000_000).toFixed(1)} M`;
  }
  if (num >= 1_000_000) {
    return `Rp ${(num / 1_000_000).toFixed(0)} Jt`;
  }
  return `Rp ${num.toLocaleString("id-ID")}`;
}

/**
 * Format full Rupiah (no abbreviation)
 */
export function formatRupiahFull(num: number): string {
  return "Rp " + num.toLocaleString("id-ID");
}

/**
 * Format mileage
 */
export function formatMileage(km: number): string {
  if (km >= 1000) {
    return `${(km / 1000).toFixed(0)}rb km`;
  }
  return `${km} km`;
}

export function normalizeTransmissionValue(
  value: string | undefined | null,
): "manual" | "matic" | "cvt" | "both" | undefined {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();

  if (normalized === "manual") return "manual";
  if (
    normalized === "matic" ||
    normalized === "automatic" ||
    normalized === "auto"
  ) {
    return "matic";
  }
  if (normalized === "cvt") return "cvt";
  if (normalized === "both") return "both";

  return undefined;
}

export function formatTransmissionLabel(
  value: string | undefined | null,
): string {
  const normalized = normalizeTransmissionValue(value);

  switch (normalized) {
    case "manual":
      return "Manual";
    case "matic":
      return "Matic";
    case "cvt":
      return "CVT";
    case "both":
      return "Manual dan Matic";
    default:
      return value?.trim() || "-";
  }
}

/**
 * Get listing display title from backend Listing object
 */

export function getListingTitleListing(listing: {
  carModel?: { brand?: { name?: string }; modelName?: string };
}): string {
  const model = listing.carModel?.modelName || "";
  return ` ${model}`.trim();
}

export function getListingTitle(listing: {
  carModel?: { brand?: { name?: string }; modelName?: string };
}): string {
  const brand = listing.carModel?.brand?.name || "";
  const model = listing.carModel?.modelName || "";
  return ` ${brand} ${model}`.trim();
}

/**
 * Get first valid image URL from listing
 */
export function getListingImage(
  images: string[] | undefined,
): string | undefined {
  if (!images || images.length === 0) return undefined;
  return resolveImageUrl(images[0]);
}

/**
 * Relative time
 */
export function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Baru saja";
  if (diffMins < 60) return `${diffMins} menit lalu`;
  if (diffHours < 24) return `${diffHours} jam lalu`;
  if (diffDays < 7) return `${diffDays} hari lalu`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
  return `${Math.floor(diffDays / 365)} tahun lalu`;
}
