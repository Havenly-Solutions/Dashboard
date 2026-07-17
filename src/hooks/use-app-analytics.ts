"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useAppAnalyticsSnapshot(range: string = "30d") {
  return useQuery({
    queryKey: ["app-analytics", "snapshot", range],
    queryFn: () => api.get(`/analytics/app?range=${range}`),
    staleTime: 60_000,
  });
}
