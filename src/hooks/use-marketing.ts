"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useMarketingSnapshot(range: string = "30d") {
  return useQuery({
    queryKey: ["marketing", "snapshot", range],
    queryFn: () => api.get(`/analytics/marketing?range=${range}`),
    staleTime: 60_000,
  });
}
