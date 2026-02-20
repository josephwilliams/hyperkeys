"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { fetchCandles } from "@/lib/api";
import { useWsSubscription } from "./useWsSubscription";
import type { CandleData, WsCandleData } from "@/types/api";
import type { CandleInterval } from "@/types/trading";

export function useCandles(coin: string, interval: CandleInterval) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["candles", coin, interval],
    queryFn: () => fetchCandles(coin, interval),
    staleTime: Infinity,
  });

  const handleWsMessage = useCallback(
    (data: unknown) => {
      const candle = data as WsCandleData;
      queryClient.setQueryData<CandleData[]>(
        ["candles", coin, interval],
        (old) => {
          if (!old) return old;
          const last = old[old.length - 1];
          if (last && last.t === candle.t) {
            // Update existing candle
            return [...old.slice(0, -1), candle];
          } else {
            // New candle
            return [...old, candle];
          }
        }
      );
    },
    [queryClient, coin, interval]
  );

  useWsSubscription(`candle:${coin}:${interval}`, handleWsMessage);

  return { candles: query.data ?? [], isLoading: query.isLoading };
}
