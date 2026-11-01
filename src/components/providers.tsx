"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster, toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";
import type { Role } from "@/lib/rbac";

export type AuthContextUser = {
  id: string;
  role: Role;
  name: string;
  email: string;
  mobile: string;
  profile?: any;
  membership?: {
    status: string;
    pointsBalance: number;
    remainingMinutes: number;
    rechargeCount: number;
  } | null;
  staff?: any;
};

interface AuthContextType {
  user: AuthContextUser | null;
  loading: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; redirectUrl: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => ({ success: false, redirectUrl: "/login" }),
  logout: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30, // 30 seconds
        refetchOnWindowFocus: false,
      },
    },
  }));

  const [user, setUser] = useState<AuthContextUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        setUser(json.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (identifier: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error?.message || "Invalid credentials");
    }
    setUser(json.data.user);
    toast.success(`Welcome back, ${json.data.user.name}`);
    return { success: true, redirectUrl: json.data.redirectUrl };
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      toast.info("Logged out successfully");
      router.push("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchCurrentUser }}>
        {children}
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: "#1c1917",
              borderColor: "#292524",
              color: "#f5f5f4",
            },
          }}
        />
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

