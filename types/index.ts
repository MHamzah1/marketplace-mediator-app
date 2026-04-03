export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role?: string;
  rolePosition?: {
    roleUser?: {
      name: string;
    };
  };
}

export interface CarListing {
  id: string;
  title: string;
  brand: string;
  model: string;
  variant?: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  color: string;
  location: string;
  images: string[];
  thumbnail?: string;
  description?: string;
  condition: 'baru' | 'bekas';
  status: 'active' | 'sold' | 'reserved';
  seller?: {
    id: string;
    name: string;
    avatar?: string;
    verified?: boolean;
  };
  features?: string[];
  isFeatured?: boolean;
  isBoosted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export interface CarModel {
  id: string;
  name: string;
  brandId: string;
}

export interface CalculatorInput {
  carPrice: number;
  downPaymentPercent: number;
  loanTermMonths: number;
  interestRate: number;
}

export interface CalculatorResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  downPaymentAmount: number;
  loanAmount: number;
}

export interface InspectionRequest {
  id: string;
  packageId: string;
  vehicleInfo: {
    brand: string;
    model: string;
    year: number;
    plateNumber: string;
  };
  location: string;
  scheduledDate: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  inspectorName?: string;
  reportUrl?: string;
  createdAt: string;
}

export interface InspectionPackage {
  id: string;
  name: string;
  price: number;
  duration: string;
  points: number;
  popular?: boolean;
  features: readonly string[];
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
