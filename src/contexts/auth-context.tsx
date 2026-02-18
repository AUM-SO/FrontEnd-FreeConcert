"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authApi, tokenStorage, User } from "@/lib/api";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<User>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Only fetch /me if we have a token stored
    const token = tokenStorage.get();
    if (!token) {
      setLoading(false);
      return;
    }

    authApi.getMe()
      .then(setUser)
      .catch(() => {
        // Token invalid/expired — clear it
        tokenStorage.remove();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const response = await authApi.login({ email, password });
    setUser(response.user);
    return response.user;
  };

  const logout = async (): Promise<void> => {
    authApi.logout(); // clears localStorage + cookie (no network call needed)
    setUser(null);
    router.push('/login');
  };

  const register = async (email: string, password: string, name: string): Promise<User> => {
    const response = await authApi.register({ email, password, name });
    setUser(response.user);
    return response.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
