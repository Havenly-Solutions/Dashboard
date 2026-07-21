"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { SecurityCampaign, LeaderboardEntry, BreachLogEntry } from "@/types";

export function useSecurityCampaigns() {
  return useQuery({
    queryKey: ["security", "campaigns"],
    queryFn: () => apiRequest<SecurityCampaign[]>("/api/v1/dashboard/security/campaigns"),
  });
}

export function useSecurityLeaderboard() {
  return useQuery({
    queryKey: ["security", "leaderboard"],
    queryFn: () => apiRequest<LeaderboardEntry[]>("/api/v1/dashboard/security/leaderboard"),
  });
}

export const useLeaderboard = useSecurityLeaderboard;

export function useBreachLogs() {
  return useQuery({
    queryKey: ["security", "breach-logs"],
    queryFn: () => apiRequest<BreachLogEntry[]>("/api/v1/dashboard/security/breach-logs"),
  });
}
