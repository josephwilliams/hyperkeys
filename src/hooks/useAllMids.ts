"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useCallback } from "react";
import { fetchAllMids } from "@/lib/api";
import { useWsSubscription } from "./useWsSubscription";
import type { AllMids, WsAllMidsData } from "@/types/api";

export function useAllMids() {
  const queryClient = useQueryClient();
  const midsRef = useRef<AllMids>({});

  const query = useQuery({
    queryKey: ["allMids"],
    queryFn: fetchAllMids,
    staleTime: Infinity, // WS keeps it fresh
  });

  // Keep ref in sync with query data
  if (query.data) {
    midsRef.current = query.data;
  }

  const handleWsMessage = useCallback(
    (data: unknown) => {
      const d = data as WsAllMidsData;
      if (d.mids) {
        midsRef.current = d.mids;
        queryClient.setQueryData<AllMids>(["allMids"], d.mids);
      }
    },
    [queryClient]
  );

  useWsSubscription("allMids", handleWsMessage);

  return { mids: query.data ?? {}, midsRef, isLoading: query.isLoading };
}
