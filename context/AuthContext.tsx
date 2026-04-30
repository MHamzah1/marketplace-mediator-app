import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axiosInstance from "@/lib/api/axiosInstance";
import * as SecureStore from "expo-secure-store";
import type { User } from "@/types";
import {
  completeMarketplaceRegistration,
  CompleteMarketplaceRegistrationPayload,
} from "@/lib/api/authRegistrationService";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogleIdToken: (idToken: string) => Promise<void>;
  completeMarketplaceRegistration: (
    data: CompleteMarketplaceRegistrationPayload,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoggedIn: false,
    loading: true,
  });

  const loadUser = useCallback(async () => {
    try {
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        const response = await axiosInstance.get("/users/profile");
        const userData = response.data?.data ?? response.data;
        setState({ user: userData, isLoggedIn: true, loading: false });
      } else {
        setState({ user: null, isLoggedIn: false, loading: false });
      }
    } catch {
      // Token invalid or expired
      try {
        await SecureStore.deleteItemAsync("accessToken");
      } catch {}
      setState({ user: null, isLoggedIn: false, loading: false });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const applyAuthPayload = async (payload: {
    accessToken?: string;
    access_token?: string;
    user?: User;
  }) => {
    const accessToken = payload?.accessToken || payload?.access_token;

    if (!accessToken) {
      throw new Error("Server tidak mengembalikan access token");
    }

    await SecureStore.setItemAsync("accessToken", accessToken);

    let userData: User | undefined;

    try {
      const profileRes = await axiosInstance.get("/users/profile");
      userData = profileRes.data?.data ?? profileRes.data;
    } catch (error) {
      if (payload.user) {
        userData = payload.user;
      } else {
        throw error;
      }
    }

    if (!userData) {
      throw new Error("Server tidak mengembalikan data user");
    }

    setState({ user: userData, isLoggedIn: true, loading: false });
  };

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    const payload = response.data?.data ?? response.data;

    await applyAuthPayload(payload);
  };

  const loginWithGoogleIdToken = async (idToken: string) => {
    const response = await axiosInstance.post("/auth/google", { idToken });
    const payload = response.data?.data ?? response.data;

    await applyAuthPayload(payload);
  };

  const completeRegistration = async (
    data: CompleteMarketplaceRegistrationPayload,
  ) => {
    const response = await completeMarketplaceRegistration(data);
    const payload = "data" in response ? response.data : response;

    await applyAuthPayload(payload);
  };

  const logout = async () => {
    // No backend logout endpoint - just clear token locally
    try {
      await SecureStore.deleteItemAsync("accessToken");
    } catch {}
    setState({ user: null, isLoggedIn: false, loading: false });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        loginWithGoogleIdToken,
        completeMarketplaceRegistration: completeRegistration,
        logout,
        refreshUser: loadUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthContext;
