"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequestWithFallback } from "@/lib/api-client";
import { mockPartners } from "@/lib/mock-data";

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: () => apiRequestWithFallback("/api/dashboard/partners", mockPartners),
  });
}
