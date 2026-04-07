import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axiosInstance from "@/lib/api/axiosInstance";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
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
      const SecureStore = await import("expo-secure-store");
      const token = await SecureStore.getItemAsync("accessToken");
      if (token) {
        const response = await axiosInstance.get("/users/profile");
        setState({
          user: response.data.data || response.data,
          isLoggedIn: true,
          loading: false,
        });
      } else {
        setState({ user: null, isLoggedIn: false, loading: false });
      }
    } catch {
      setState({ user: null, isLoggedIn: false, loading: false });
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email: string, password: string) => {
    const response = await axiosInstance.post("/auth/login", {
      email,
      password,
    });
    const { accessToken, user } = response.data.data || response.data;
    try {
      const SecureStore = await import("expo-secure-store");
      await SecureStore.setItemAsync("accessToken", accessToken);
    } catch {
      // Web fallback
    }
    setState({ user, isLoggedIn: true, loading: false });
  };

  const register = async (data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    await axiosInstance.post("/auth/register", data);
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch {
      // Ignore logout API errors
    }
    try {
      const SecureStore = await import("expo-secure-store");
      await SecureStore.deleteItemAsync("accessToken");
    } catch {
      // Web fallback
    }
    setState({ user: null, isLoggedIn: false, loading: false });
  };

  const refreshUser = loadUser;

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
