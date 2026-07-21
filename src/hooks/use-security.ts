"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequestWithFallback } from "@/lib/api-client";
import { mockBreachLogs, mockLeaderboard, mockSecurityCampaigns } from "@/lib/mock-data";

export function useSecurityCampaigns() {
  return useQuery({
    queryKey: ["security", "campaigns"],
    queryFn: () => apiRequestWithFallback("/api/dashboard/security/campaigns", mockSecurityCampaigns),
  });
}

export function useLeaderboard() {
  return useQuery({
    queryKey: ["security", "leaderboard"],
    queryFn: () => apiRequestWithFallback("/api/dashboard/security/leaderboard", mockLeaderboard),
  });
}

export function useBreachLogs() {
  return useQuery({
    queryKey: ["security", "breach-logs"],
    queryFn: () => apiRequestWithFallback("/api/dashboard/security/breach-logs", mockBreachLogs),
  });
}
