"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { fetchCandles } from "@/lib/api";
import { wsChannels } from "@/lib/ws";
import { useWsSubscription } from "./useWsSubscription";
import type { CandleData, WsCandleData } from "@/types/api";
import type { CandleInterval } from "@/types/trading";

export function useCandles(coin: string, interval: CandleInterval) {
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => ["candles", coin, interval], [coin, interval]);
  const channel = useMemo(() => wsChannels.candle(coin, interval), [coin, interval]);

  const query = useQuery({
    queryKey,
    queryFn: () => fetchCandles(coin, interval),
    staleTime: Infinity,
  });

  const handleWsMessage = useCallback(
    (data: unknown) => {
      const candle = data as WsCandleData;
      queryClient.setQueryData<CandleData[]>(queryKey, (candles) => {
        if (!candles) return candles;
        // The open candle is re-sent on every tick until it closes.
        const isUpdate = candles[candles.length - 1]?.t === candle.t;
        return isUpdate
          ? [...candles.slice(0, -1), candle]
          : [...candles, candle];
      });
    },
    [queryClient, queryKey]
  );

  useWsSubscription(channel, handleWsMessage);

  return { candles: query.data ?? [], isLoading: query.isLoading };
}
