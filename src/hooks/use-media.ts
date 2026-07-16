"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface MediaAsset {
  id: string;
  fileName: string;
  assetType: "IMAGE" | "VIDEO" | "DOCUMENT" | "PDF";
  mimeType: string;
  fileSizeBytes: number;
  r2Key: string;
  r2Url: string;
  viewUrl: string;
  status: "UPLOADING" | "READY" | "ERROR";
  mediaCategory: string;
  title: string;
  description: string | null;
  uploadedById: string;
  uploadedBy: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export const mediaKeys = {
  all: ["media"] as const,
  list: (filters: any) => [...mediaKeys.all, "list", filters] as const,
};

export function useMedia(filters: { assetType?: string; search?: string; page?: number; limit?: number } = {}) {
  return useQuery({
    queryKey: mediaKeys.list(filters),
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.assetType) params.append("assetType", filters.assetType);
      if (filters.search) params.append("search", filters.search);
      if (filters.page) params.append("page", String(filters.page));
      if (filters.limit) params.append("limit", String(filters.limit));
      return api.get<MediaAsset[]>(`/media?${params.toString()}`);
    },
  });
}
