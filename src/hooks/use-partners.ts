"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { Partner } from "@/types";

export function usePartners() {
  return useQuery({
    queryKey: ["partners"],
    queryFn: () => api.get("/partners"),
  });
}

export function usePartnerMe() {
  return useQuery({
    queryKey: ["partners", "me"],
    queryFn: () => api.get<Partner>("/partners/me"),
  });
}
