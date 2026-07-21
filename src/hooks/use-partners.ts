"use client";

import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { Partner } from "@/types";

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: () => apiRequest<Partner[]>("/api/v1/dashboard/partners"),
  });
}
