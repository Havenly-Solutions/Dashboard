"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useSecurityCampaigns() {
  return useQuery({
    queryKey: ["security", "campaigns"],
    queryFn: () => api.get("/security/campaigns"),
  });
}

export function useSecurityTraining() {
  return useQuery({
    queryKey: ["security", "training"],
    queryFn: () => api.get("/security/training"),
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["security", "leaderboard"],
    queryFn: () => api.get("/security/leaderboard"),
  });
}

export function useBreachLogs() {
  return useQuery({
    queryKey: ["security", "breach-logs"],
    queryFn: () => api.get("/security/breach-logs"),
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ["security", "audit-logs"],
    queryFn: () => api.get<any[]>("/security/audit-logs"),
  });
}
