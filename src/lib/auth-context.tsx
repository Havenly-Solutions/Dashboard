"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError, apiRequest, configureApiClient } from "@/lib/api-client";
import { ROLE_LABELS } from "@/lib/rbac";
import type { AuthUser, LoginResponse, Role } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  realUser: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  isSimulating: boolean;
  login: (credentials: { email: string; password?: string; pin?: string }) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
  simulateRole: (role: Role) => Promise<AuthUser>;
  stopSimulation: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [realUser, setRealUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading");
  const tokenRef = useRef<string | null>(null);
  const queryClient = useQueryClient();

  const isSimulating = !!realUser && realUser.id !== user?.id;

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiRequest<LoginResponse>("/api/v1/dashboard/auth/me");
      tokenRef.current = res.accessToken;
      setUser(res.user);
      // If we aren't simulating, the real user is the same as the user.
      // If we ARE simulating, we don't want /me to overwrite the simulated persona.
      if (!isSimulating) setRealUser(res.user);
      setStatus("authenticated");
    } catch (err) {
      tokenRef.current = null;
      setUser(null);
      setRealUser(null);
      setStatus("unauthenticated");
    }
  }, [isSimulating]);

  useEffect(() => {
    configureApiClient({
      getToken: () => tokenRef.current,
      onRefresh: async () => {
        try {
          // skipAuth: true is CRITICAL here to prevent recursion if the refresh call itself 401s
          const res = await apiRequest<{ accessToken: string }>("/api/v1/dashboard/auth/refresh", { method: "POST", skipAuth: true });
          tokenRef.current = res.accessToken;
          return res.accessToken;
        } catch {
          return null;
        }
      },
      onUnauthorized: () => {
        setUser(null);
        setRealUser(null);
        setStatus("unauthenticated");
        tokenRef.current = null;
        queryClient.clear();
      },
    });

    refreshUser();
  }, [refreshUser, isSimulating, queryClient]);

  const login = async (credentials: { email: string; password?: string; pin?: string }): Promise<AuthUser> => {
    const res = await apiRequest<LoginResponse>("/api/v1/dashboard/auth/login", {
      method: "POST",
      body: credentials,
      skipAuth: true,
    });
    tokenRef.current = res.accessToken;
    setUser(res.user);
    setRealUser(res.user);
    setStatus("authenticated");
    queryClient.clear();
    return res.user;
  };

  const logout = async () => {
    try {
      await apiRequest("/api/v1/dashboard/auth/logout", { method: "POST" });
    } finally {
      tokenRef.current = null;
      setUser(null);
      setRealUser(null);
      setStatus("unauthenticated");
      queryClient.clear();
    }
  };

  const simulateRole = async (role: Role): Promise<AuthUser> => {
    if (!realUser || realUser.role !== "FOUNDER") {
      throw new Error("Only Founders can simulate other roles.");
    }
    // Client-side simulation: overlay the target role on the real user.
    // No backend round-trip needed — the real token is kept; only the
    // displayed role/portal changes for preview purposes.
    const simulatedUser: AuthUser = { ...realUser, role };
    setUser(simulatedUser);
    queryClient.clear();
    return simulatedUser;
  };

  const stopSimulation = async () => {
    if (!realUser) return;
    setUser(realUser);
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        realUser,
        status,
        isSimulating,
        login,
        logout,
        refreshUser,
        getAccessToken: () => tokenRef.current,
        simulateRole,
        stopSimulation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
