"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useCallback } from "react";
import { fetchAllMids } from "@/lib/api";
import { useWsSubscription } from "./useWsSubscription";
import { XYZ_DEX } from "@/lib/constants";
import type { AllMids, WsAllMidsData } from "@/types/api";

export function useAllMids() {
  const queryClient = useQueryClient();
  const midsRef = useRef<AllMids>({});

  // Default dex mids
  const defaultQuery = useQuery({
    queryKey: ["allMids"],
    queryFn: () => fetchAllMids(),
    staleTime: Infinity,
  });

  // xyz dex mids
  const xyzQuery = useQuery({
    queryKey: ["allMids", XYZ_DEX],
    queryFn: () => fetchAllMids(XYZ_DEX),
    staleTime: Infinity,
  });

  // Merge both into a single object
  const merged: AllMids = { ...(defaultQuery.data ?? {}), ...(xyzQuery.data ?? {}) };
  midsRef.current = merged;

  // WS handler for default dex
  const handleDefaultWs = useCallback(
    (data: unknown) => {
      const d = data as WsAllMidsData;
      if (d.mids) {
        queryClient.setQueryData<AllMids>(["allMids"], d.mids);
        midsRef.current = { ...midsRef.current, ...d.mids };
      }
    },
    [queryClient]
  );

  // WS handler for xyz dex
  const handleXyzWs = useCallback(
    (data: unknown) => {
      const d = data as WsAllMidsData;
      if (d.mids) {
        queryClient.setQueryData<AllMids>(["allMids", XYZ_DEX], d.mids);
        midsRef.current = { ...midsRef.current, ...d.mids };
      }
    },
    [queryClient]
  );

  useWsSubscription("allMids", handleDefaultWs);
  useWsSubscription("allMids:xyz", handleXyzWs);

  return {
    mids: merged,
    midsRef,
    isLoading: defaultQuery.isLoading || xyzQuery.isLoading,
  };
}
