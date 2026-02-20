"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchL2Book } from "@/lib/api";
import { useWsSubscription } from "./useWsSubscription";
import type { L2BookSnapshot, WsL2BookData } from "@/types/api";

export function useOrderbook(coin: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["l2Book", coin],
    queryFn: () => fetchL2Book(coin),
    staleTime: Infinity,
  });

  const handleWsMessage = useCallback(
    (data: unknown) => {
      const book = data as WsL2BookData;
      queryClient.setQueryData<L2BookSnapshot>(["l2Book", coin], (old) => ({
        coin,
        levels: book.levels,
        time: book.time ?? old?.time ?? Date.now(),
      }));
    },
    [queryClient, coin]
  );

  useWsSubscription(`l2Book:${coin}`, handleWsMessage);

  return {
    bids: query.data?.levels[0] ?? [],
    asks: query.data?.levels[1] ?? [],
    isLoading: query.isLoading,
  };
}
