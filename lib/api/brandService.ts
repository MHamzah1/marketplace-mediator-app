import axiosInstance from './axiosInstance';
import type { Brand } from '@/types';

export async function fetchBrands(params?: { search?: string; isActive?: boolean; page?: number; perPage?: number }): Promise<Brand[]> {
  const response = await axiosInstance.get('/brand/paged', {
    params: {
      page: params?.page ?? 1,
      perPage: params?.perPage ?? 100,
      search: params?.search,
      isActive: params?.isActive ?? true,
    },
  });
  return response.data?.data ?? response.data ?? [];
}
