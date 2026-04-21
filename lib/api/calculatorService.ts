import axiosInstance from "./axiosInstance";
import type {
  CalculatorOptions,
  ModelsByBrand,
  YearsByVariant,
  CalculationResult,
  PriceAdjustmentGroups,
  PaginatedResponse,
  CalculatorBrandOption,
  CalculatorModelOption,
  CalculatorVariantOption,
  CalculatorYearPriceOption,
} from "@/types";

export async function getCalculatorOptions(): Promise<CalculatorOptions> {
  const response = await axiosInstance.get("/price-calculator/options");
  return response.data;
}

export async function getCalculatorBrands(params?: {
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<PaginatedResponse<CalculatorBrandOption>> {
  const response = await axiosInstance.get("/price-calculator/brands", {
    params,
  });
  return response.data;
}

export async function getCalculatorModels(params?: {
  brandId?: string;
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<PaginatedResponse<CalculatorModelOption>> {
  const response = await axiosInstance.get("/price-calculator/models", {
    params,
  });
  return response.data;
}

export async function getCalculatorVariants(params?: {
  modelId?: string;
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<PaginatedResponse<CalculatorVariantOption>> {
  const response = await axiosInstance.get("/price-calculator/variants", {
    params,
  });
  return response.data;
}

export async function getCalculatorYearPrices(params?: {
  variantId?: string;
  modelId?: string;
  brandId?: string;
  page?: number;
  perPage?: number;
  year?: number;
}): Promise<PaginatedResponse<CalculatorYearPriceOption>> {
  const response = await axiosInstance.get("/price-calculator/year-prices", {
    params,
  });
  return response.data;
}

export async function getModelsByBrand(
  brandId: string,
): Promise<ModelsByBrand> {
  const response = await axiosInstance.get(
    `/price-calculator/brands/${brandId}/models`,
  );
  return response.data;
}

export async function getVariantsByModel(modelId: string) {
  const response = await axiosInstance.get(`/variants`, {
    params: { modelId },
  });
  const variants = response.data?.data ?? response.data;

  return (variants || []).map((variant: Record<string, unknown>) => ({
    ...variant,
    name: variant.name || variant.variantName,
  }));
}

export async function getYearsByVariant(
  variantId: string,
): Promise<YearsByVariant> {
  const response = await axiosInstance.get(
    `/price-calculator/variants/${variantId}/years`,
  );
  return response.data;
}

export async function getPriceAdjustmentsByModel(
  modelId: string,
): Promise<PriceAdjustmentGroups> {
  const response = await axiosInstance.get(
    `/car-models/${modelId}/price-adjustments`,
  );
  return response.data;
}

export async function calculatePrice(params: {
  variantId: string;
  year: number;
  ownershipCode: string;
  colorCode: string;
  featureCode: string;
}): Promise<CalculationResult> {
  const response = await axiosInstance.post(
    "/price-calculator/calculate",
    params,
  );
  return response.data;
}
