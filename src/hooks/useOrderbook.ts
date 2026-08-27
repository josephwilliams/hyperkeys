"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { fetchL2Book } from "@/lib/api";
import { wsChannels } from "@/lib/ws";
import { useWsSubscription } from "./useWsSubscription";
import type { L2BookSnapshot, WsL2BookData } from "@/types/api";

export function useOrderbook(coin: string) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["l2Book", coin], [coin]);
  const channel = useMemo(() => wsChannels.l2Book(coin), [coin]);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchL2Book(coin),
    staleTime: Infinity,
  });

  const handleWsMessage = useCallback(
    (data: unknown) => {
      const book = data as WsL2BookData;
      queryClient.setQueryData<L2BookSnapshot>(queryKey, (previous) => ({
        coin,
        levels: book.levels,
        time: book.time ?? previous?.time ?? Date.now(),
      }));
    },
    [queryClient, queryKey, coin]
  );

  useWsSubscription(channel, handleWsMessage);

  return {
    bids: query.data?.levels[0] ?? [],
    asks: query.data?.levels[1] ?? [],
    isLoading: query.isLoading,
  };
}
