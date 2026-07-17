"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, ApiError, apiRequest, configureApiClient, DEMO_MODE } from "@/lib/api-client";
import { disconnectSocket } from "@/lib/socket";
import { ROLE_LABELS } from "@/lib/rbac";
import type { AuthUser, LoginResponse, Role } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  getAccessToken: () => string | null;
  /** True once a Founder has switched into another role's portal to preview it. */
  isSimulating: boolean;
  /** The Founder's real identity, kept in memory while simulating. */
  realUser: AuthUser | null;
  switchRole: (role: Role) => Promise<AuthUser>;
  exitSimulation: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthContextValue["status"]>("loading");
  const [realUser, setRealUser] = useState<AuthUser | null>(null);
  const tokenRef = useRef<string | null>(null);
  const founderTokenRef = useRef<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    tokenRef.current = null;
    founderTokenRef.current = null;
    setUser(null);
    setRealUser(null);
    setStatus("unauthenticated");
    disconnectSocket();
  }, []);

  const doRefresh = useCallback(async (): Promise<string | null> => {
    try {
      const res = await apiRequest<{ accessToken: string }>("/api/dashboard/auth/refresh", {
        method: "POST",
        skipAuth: true,
      });
      tokenRef.current = res.accessToken;
      return res.accessToken;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    configureApiClient({
      getToken: () => tokenRef.current,
      onRefresh: doRefresh,
      onUnauthorized: handleUnauthorized,
    });
  }, [doRefresh, handleUnauthorized]);

  const refreshUser = useCallback(async () => {
    try {
      const token = tokenRef.current ?? (await doRefresh());
      if (!token) {
        setUser(null);
        setStatus("unauthenticated");
        return;
      }
      tokenRef.current = token;
      const me = await api.get<AuthUser>("/api/dashboard/auth/me");
      setUser(me);
      setStatus("authenticated");
    } catch (err) {
      setUser(null);
      setStatus("unauthenticated");
      if (!(err instanceof ApiError)) {
        // Network / backend not reachable yet \u2014 fine during local dashboard
        // development before havenly-backend is wired up.
      }
    }
  }, [doRefresh]);

  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<LoginResponse>("/api/dashboard/auth/login", { email, password }, { skipAuth: true });
    tokenRef.current = res.accessToken;
    setUser(res.user);
    setStatus("authenticated");
    return res.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/dashboard/auth/logout");
    } catch {
      // best-effort \u2014 clear client state regardless
    }
    tokenRef.current = null;
    founderTokenRef.current = null;
    setUser(null);
    setRealUser(null);
    setStatus("unauthenticated");
    disconnectSocket();
    router.push("/login");
  }, [router]);

  const getAccessToken = useCallback(() => tokenRef.current, []);

  /**
   * Founder-only role simulation. Mirrors POST /admin/test-mode/switch-role
   * from the backend audit: the backend issues a real JWT scoped to the
   * target role, so every RBAC check (nav, route guards, data scoping) sees
   * the simulated role exactly as that user type would. Falls back to a
   * client-only simulation in demo mode so the portal-switching UX can be
   * reviewed before that backend route exists.
   */
  const switchRole = useCallback(
    async (role: Role): Promise<AuthUser> => {
      if (!user) throw new Error("Not authenticated");

      // First time switching: remember the real Founder session so we can
      // restore it exactly on exit, no matter how many times they hop portals.
      if (!founderTokenRef.current) {
        founderTokenRef.current = tokenRef.current;
        setRealUser(user);
      }

      try {
        const res = await api.post<LoginResponse>("/api/dashboard/admin/test-mode/switch-role", { role });
        tokenRef.current = res.accessToken;
        setUser(res.user);
        queryClient.clear();
        return res.user;
      } catch (err) {
        if (!DEMO_MODE) throw err;
        // Demo-mode fallback: no backend route yet \u2014 simulate the persona
        // client-side so you can verify the portal-switching UX now.
        const simulated: AuthUser = {
          id: `demo-${role.toLowerCase()}`,
          name: `${ROLE_LABELS[role]} (Preview)`,
          email: (realUser ?? user).email,
          role,
          organizationId: null,
          organizationName: role === "NGO_PARTNER" ? "Global Relief NGO" : null,
        };
        setUser(simulated);
        queryClient.clear();
        return simulated;
      }
    },
    [user, realUser, queryClient]
  );

  const exitSimulation = useCallback(() => {
    if (!founderTokenRef.current || !realUser) return;
    tokenRef.current = founderTokenRef.current;
    founderTokenRef.current = null;
    setUser(realUser);
    setRealUser(null);
    queryClient.clear();
  }, [realUser, queryClient]);

  const value = useMemo(
    () => ({
      user,
      status,
      login,
      logout,
      refreshUser,
      getAccessToken,
      isSimulating: !!realUser,
      realUser,
      switchRole,
      exitSimulation,
    }),
    [user, status, login, logout, refreshUser, getAccessToken, realUser, switchRole, exitSimulation]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
