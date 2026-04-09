import axiosInstance from './axiosInstance';
import type {
  CalculatorOptions,
  ModelsByBrand,
  YearsByVariant,
  CalculationResult,
  PriceAdjustmentGroups,
} from '@/types';

export async function getCalculatorOptions(): Promise<CalculatorOptions> {
  const response = await axiosInstance.get('/price-calculator/options');
  return response.data;
}

export async function getModelsByBrand(brandId: string): Promise<ModelsByBrand> {
  const response = await axiosInstance.get(`/price-calculator/brands/${brandId}/models`);
  return response.data;
}

export async function getVariantsByModel(modelId: string) {
  const response = await axiosInstance.get(`/variants`, { params: { modelId } });
  const variants = response.data?.data ?? response.data;

  return (variants || []).map((variant: Record<string, unknown>) => ({
    ...variant,
    name: variant.name || variant.variantName,
  }));
}

export async function getYearsByVariant(variantId: string): Promise<YearsByVariant> {
  const response = await axiosInstance.get(`/price-calculator/variants/${variantId}/years`);
  return response.data;
}

export async function getPriceAdjustmentsByModel(modelId: string): Promise<PriceAdjustmentGroups> {
  const response = await axiosInstance.get(`/car-models/${modelId}/price-adjustments`);
  return response.data;
}

export async function calculatePrice(params: {
  variantId: string;
  year: number;
  ownershipCode: string;
  colorCode: string;
  featureCode: string;
}): Promise<CalculationResult> {
  const response = await axiosInstance.post('/price-calculator/calculate', params);
  return response.data;
}
