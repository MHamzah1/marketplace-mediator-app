// ============ Generic API Response ============

export interface ApiResponse<T> {
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  message: string;
  data: T[];
  pagination: Pagination;
}

export interface Pagination {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}

// ============ Entity Types (matching backend) ============

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  isActive?: boolean;
}

export interface CarModel {
  id: string;
  modelName: string;
  description?: string;
  basePrice?: number;
  imageUrl?: string;
  brand: Brand;
}

export interface Variant {
  id: string;
  name: string;
  variantName?: string;
  transmissionType: string;
  engineCapacity?: string;
  isActive: boolean;
  modelId: string;
  model?: CarModel;
}

export interface YearPrice {
  id: string;
  year: number;
  price: number;
  isActive: boolean;
  variantId: string;
}

export interface YearPriceOption {
  id: string;
  year: number;
  basePrice?: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  nickName?: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  location?: string;
  profileImage?: string;
  profilePhoto?: string;
  dateOfBirth?: string;
  gender?: string;
  pinEnabled?: boolean;
  biometricEnabled?: boolean;
  role?: string;
  rolePosition?: {
    id: string;
    name: string;
    roleUser: { id: string; name: string };
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface Listing {
  id: string;
  sellerId: string;
  seller: User;
  carModelId: string;
  carModel: CarModel;
  variantId?: string;
  variant?: Variant;
  yearPriceId?: string;
  yearPrice?: YearPrice;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: string;
  color: string;
  locationCity: string;
  locationProvince: string;
  description: string;
  condition: string;
  ownershipStatus?: string;
  taxStatus?: string;
  images: string[];
  sellerWhatsapp: string;
  isActive: boolean;
  viewCount: number;
  contactClickCount: number;
  isFeatured: boolean;
  featuredUntil?: string;
  featuredPriority: number;
  createdAt: string;
  updatedAt: string;
}

// ============ WhatsApp ============

export interface WhatsAppLinkResponse {
  message: string;
  whatsappUrl: string;
  sellerPhone: string;
  preFilledMessage: string;
  seller: { name: string; location: string };
  listing: { id: string; carBrand: string; carModel: string; year: number; price: number };
}

// ============ Seller Profile ============

export interface SellerProfile {
  id: string;
  fullName: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  location?: string;
  createdAt: string;
  totalListings: number;
}

// ============ My Listings ============

export interface MyListingsSummary {
  totalActiveListings: number;
  totalInactiveListings: number;
  totalViews: number;
  totalContactClicks: number;
}

export interface MyListingsResponse {
  message: string;
  data: Listing[];
  pagination: Pagination;
  summary: MyListingsSummary;
}

// ============ Filters ============

export interface FilterParams {
  page?: number;
  perPage?: number;
  search?: string;
  brandId?: string;
  carModelId?: string;
  variantId?: string;
  minPrice?: number;
  maxPrice?: number;
  yearMin?: number;
  yearMax?: number;
  transmission?: string;
  fuelType?: string;
  locationCity?: string;
  locationProvince?: string;
  condition?: string;
  sortBy?: string;
  isActive?: boolean;
  sellerId?: string;
}

// ============ Create / Update Listing ============

export interface CreateListingPayload {
  variantId: string;
  yearPriceId: string;
  price: number;
  mileage: number;
  fuelType: string;
  color: string;
  locationCity: string;
  locationProvince: string;
  description: string;
  condition?: string;
  ownershipStatus?: string;
  taxStatus?: string;
  sellerWhatsapp: string;
  transmission?: string;
}

// ============ Calculator ============

export interface CalculatorOptions {
  brands: { id: string; name: string; logo?: string }[];
  years: number[];
}

export interface CalculatorBrandOption {
  id: string;
  name: string;
  logo?: string;
}

export interface CalculatorModelOption {
  id: string;
  brandId: string;
  brandName?: string;
  modelName: string;
  imageUrl?: string;
}

export interface CalculatorVariantOption {
  id: string;
  modelId: string;
  modelName?: string;
  brandName?: string;
  variantName: string;
  transmissionType: string;
}

export interface CalculatorYearPriceOption {
  id: string;
  variantId: string;
  variantName?: string;
  modelId?: string;
  modelName?: string;
  brandName?: string;
  year: number;
  basePrice: number;
}

export interface ModelsByBrand {
  brandId: string;
  brandName: string;
  models: { id: string; modelName: string; imageUrl?: string }[];
}

export interface YearsByVariant {
  variantId: string;
  variantName: string;
  modelName: string;
  brandName: string;
  years: number[];
  yearPrices: YearPriceOption[];
  basePrice?: number;
}

export interface PriceBreakdownAdjustment {
  category: string;
  name: string;
  amount: number;
}

export interface CalculationResult {
  calculation: { id: string; calculatedAt: string };
  car: {
    brandId: string;
    brandName: string;
    modelId: string;
    modelName: string;
    variantId: string;
    variantName: string;
    year: number;
  };
  conditions: {
    ownership: { code: string; name: string };
    color: { code: string; name: string; colorHex: string };
    feature: { code: string; name: string };
  };
  priceBreakdown: {
    basePrice: number;
    adjustments: PriceBreakdownAdjustment[];
    totalAdjustments: number;
  };
  finalPrice: number;
  priceRange: { min: number; max: number; note: string };
}

export interface PriceAdjustmentOption {
  id: string;
  code: string;
  name: string;
  adjustmentValue: number;
  isBaseline: boolean;
  colorHex?: string;
}

export interface PriceAdjustmentGroups {
  modelId: string;
  modelName: string;
  brandName: string;
  adjustments: {
    ownership: PriceAdjustmentOption[];
    color: PriceAdjustmentOption[];
    feature: PriceAdjustmentOption[];
    condition: PriceAdjustmentOption[];
    kilometer: PriceAdjustmentOption[];
    accident_history: PriceAdjustmentOption[];
    document: PriceAdjustmentOption[];
    warranty: PriceAdjustmentOption[];
    service_record: PriceAdjustmentOption[];
    location: PriceAdjustmentOption[];
  };
}

// ============ Inspection ============

export interface InspectionPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  points: number;
  features: readonly string[];
  popular?: boolean;
}
