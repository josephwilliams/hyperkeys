"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMetaAndAssetCtxs } from "@/lib/api";
import { MARKET_COINS } from "@/lib/constants";
import type { AssetCtx } from "@/types/api";

export function useMeta() {
  const query = useQuery({
    queryKey: ["metaAndAssetCtxs"],
    queryFn: fetchMetaAndAssetCtxs,
    staleTime: 30_000,
  });

  const getAssetCtx = (coin: string): AssetCtx | undefined => {
    if (!query.data) return undefined;
    const { meta, assetCtxs } = query.data;
    const idx = meta.universe.findIndex((a) => a.name === coin);
    if (idx === -1) return undefined;
    return assetCtxs[idx];
  };

  const assetCtxMap: Record<string, AssetCtx> = {};
  if (query.data) {
    for (const coin of MARKET_COINS) {
      const ctx = getAssetCtx(coin);
      if (ctx) assetCtxMap[coin] = ctx;
    }
  }

  return { meta: query.data, assetCtxMap, isLoading: query.isLoading };
}
