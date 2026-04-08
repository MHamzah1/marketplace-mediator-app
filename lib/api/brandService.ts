import axiosInstance from './axiosInstance';
import type { Brand } from '@/types';

export async function fetchBrands(params?: { search?: string; isActive?: boolean }): Promise<Brand[]> {
  const response = await axiosInstance.get('/brands', { params: { ...params, isActive: true } });
  return response.data?.data ?? response.data;
}
