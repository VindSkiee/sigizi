"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { loginEmail } from "@/lib/api";

interface SppgData {
  id: string;
  name: string;
  address?: string;
  province: string;
  regency: string;
  district: string;
  village?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: "SPPG_ADMIN" | "SUPPLIER" | "PUBLIC";
  supplierId?: string;
  sppgId?: string;
  sppg?: SppgData;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isSupplier: boolean;
  isAdmin: boolean;
  hasLocation: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateSppgLocation: (
    latitude: number,
    longitude: number,
    province?: string,
    regency?: string,
    district?: string,
    village?: string,
    postalCode?: string,
  ) => void;
  updateSppgProfile: (data: Partial<SppgData>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const isAuthenticated = !!token && !!user;
  const isSupplier = user?.role === "SUPPLIER";
  const isAdmin = user?.role === "SPPG_ADMIN";
  const hasLocation =
    user?.sppg?.latitude != null && user?.sppg?.longitude != null;

  const login = async (email: string, password: string) => {
    const response = await loginEmail(email, password);
    if (response.success) {
      const data = response.data as { token: string; user: User };
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return;
    }
    throw new Error("Email atau password salah");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const updateSppgLocation = useCallback(
    (
      latitude: number,
      longitude: number,
      province?: string,
      regency?: string,
      district?: string,
      village?: string,
      postalCode?: string,
    ) => {
      setUser((prev) => {
        if (!prev?.sppg) return prev;
        const updatedSppg: SppgData = {
          ...prev.sppg,
          latitude,
          longitude,
          ...(province !== undefined && { province }),
          ...(regency !== undefined && { regency }),
          ...(district !== undefined && { district }),
          ...(village !== undefined && { village }),
          ...(postalCode !== undefined && { postalCode }),
        };
        const updatedUser = { ...prev, sppg: updatedSppg };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      });
    },
    [],
  );

  const updateSppgProfile = useCallback((data: Partial<SppgData>) => {
    setUser((prev) => {
      if (!prev?.sppg) return prev;
      const updatedSppg: SppgData = { ...prev.sppg, ...data };
      const updatedUser = { ...prev, sppg: updatedSppg };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isSupplier,
        isAdmin,
        hasLocation,
        login,
        logout,
        updateSppgLocation,
        updateSppgProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
