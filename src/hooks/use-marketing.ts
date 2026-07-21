"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequestWithFallback } from "@/lib/api-client";
import { mockMarketingSnapshot } from "@/lib/mock-data";

export function useMarketingSnapshot(range: string = "30d") {
  return useQuery({
    queryKey: ["marketing", "snapshot", range],
    queryFn: () =>
      apiRequestWithFallback(`/api/dashboard/analytics/marketing?range=${range}`, mockMarketingSnapshot),
    staleTime: 60_000,
  });
}
