"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequestWithFallback } from "@/lib/api-client";
import { mockAppAnalyticsSnapshot } from "@/lib/mock-data";

export function useAppAnalyticsSnapshot(range: string = "30d") {
  return useQuery({
    queryKey: ["app-analytics", "snapshot", range],
    queryFn: () =>
      apiRequestWithFallback(`/api/dashboard/analytics/app?range=${range}`, mockAppAnalyticsSnapshot),
    staleTime: 60_000,
  });
}
