import axiosInstance from './axiosInstance';
import type { CalculatorOptions, ModelsByBrand, YearsByVariant, CalculationResult } from '@/types';

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
  return response.data?.data ?? response.data;
}

export async function getYearsByVariant(variantId: string): Promise<YearsByVariant> {
  const response = await axiosInstance.get(`/price-calculator/variants/${variantId}/years`);
  return response.data;
}

export async function calculatePrice(params: {
  variantId: string;
  year: number;
  transmissionCode: string;
  ownershipCode: string;
  colorCode: string;
}): Promise<CalculationResult> {
  const response = await axiosInstance.post('/price-calculator/calculate', params);
  return response.data;
}
