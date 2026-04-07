import axios from 'axios';
import { API_BASE_URL } from '@/constants/Config';
import * as SecureStore from 'expo-secure-store';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      config.headers = config.headers ?? {};
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore not available (web), fallback silently
    }

    if (__DEV__) {
      console.log('[API]', (config.method || 'GET').toUpperCase(), `${config.baseURL}${config.url}`);
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle errors
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (__DEV__) {
      console.log('[API_ERROR]', {
        url: `${error.config?.baseURL || ''}${error.config?.url || ''}`,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
      });
    }

    if (error.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('accessToken');
      } catch {
        // Silently fail
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
