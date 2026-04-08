import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosInstance from '@/lib/api/axiosInstance';
import * as SecureStore from 'expo-secure-store';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { fullName: string; email: string; password: string; phoneNumber?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    loading: true,
  });

  const loadUser = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        const response = await axiosInstance.get('/users/profile');
        const userData = response.data?.data ?? response.data;
        setState({ user: userData, isLoggedIn: true, loading: false });
      } else {
        setState({ user: null, isLoggedIn: false, loading: false });
      }
    } catch {
      // Token invalid or expired
      try {
        await SecureStore.deleteItemAsync('accessToken');
      } catch {}
      setState({ user: null, isLoggedIn: false, loading: false });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const payload = response.data?.data ?? response.data;
    const accessToken = payload?.accessToken || payload?.access_token;

    if (!accessToken) {
      throw new Error('Server tidak mengembalikan access token');
    }

    await SecureStore.setItemAsync('accessToken', accessToken);

    // Fetch user profile after login
    const profileRes = await axiosInstance.get('/users/profile');
    const userData = profileRes.data?.data ?? profileRes.data;

    setState({ user: userData, isLoggedIn: true, loading: false });
  };

  const register = async (data: { fullName: string; email: string; password: string; phoneNumber?: string }) => {
    await axiosInstance.post('/auth/register', data);
  };

  const logout = async () => {
    // No backend logout endpoint - just clear token locally
    try {
      await SecureStore.deleteItemAsync('accessToken');
    } catch {}
    setState({ user: null, isLoggedIn: false, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export default AuthContext;
