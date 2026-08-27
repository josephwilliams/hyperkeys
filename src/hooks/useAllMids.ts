"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { fetchAllMids } from "@/lib/api";
import { wsChannels } from "@/lib/ws";
import { XYZ_DEX } from "@/lib/constants";
import { useWsSubscription } from "./useWsSubscription";
import type { AllMids, WsAllMidsData } from "@/types/api";

/** REST snapshot for one dex, kept current by that dex's allMids feed. */
function useDexMids(dex?: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => (dex ? ["allMids", dex] : ["allMids"]), [dex]);
  const channel = useMemo(() => wsChannels.allMids(dex), [dex]);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchAllMids(dex),
    staleTime: Infinity,
  });

  const handleWsMessage = useCallback(
    (data: unknown) => {
      const { mids } = data as WsAllMidsData;
      if (mids) queryClient.setQueryData<AllMids>(queryKey, mids);
    },
    [queryClient, queryKey]
  );

  useWsSubscription(channel, handleWsMessage);
  return query;
}

/**
 * Live mid prices for every market, merged across both dexes.
 * `midsRef` gives order execution the latest prices without re-rendering on each tick.
 */
export function useAllMids() {
  const defaultQuery = useDexMids();
  const xyzQuery = useDexMids(XYZ_DEX);

  const mids = useMemo<AllMids>(
    () => ({ ...(defaultQuery.data ?? {}), ...(xyzQuery.data ?? {}) }),
    [defaultQuery.data, xyzQuery.data]
  );

  const midsRef = useRef(mids);
  useEffect(() => {
    midsRef.current = mids;
  }, [mids]);

  return {
    mids,
    midsRef,
    isLoading: defaultQuery.isLoading || xyzQuery.isLoading,
  };
}
