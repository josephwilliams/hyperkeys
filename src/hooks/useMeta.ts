"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMetaAndAssetCtxs } from "@/lib/api";
import { MARKET_COINS, XYZ_DEX } from "@/lib/constants";
import type { AssetCtx } from "@/types/api";

export function useMeta() {
  const defaultQuery = useQuery({
    queryKey: ["metaAndAssetCtxs"],
    queryFn: () => fetchMetaAndAssetCtxs(),
    staleTime: 30_000,
  });

  const xyzQuery = useQuery({
    queryKey: ["metaAndAssetCtxs", XYZ_DEX],
    queryFn: () => fetchMetaAndAssetCtxs(XYZ_DEX),
    staleTime: 30_000,
  });

  const assetCtxMap: Record<string, AssetCtx> = {};

  // Build map from default dex
  if (defaultQuery.data) {
    const { meta, assetCtxs } = defaultQuery.data;
    for (const coin of MARKET_COINS) {
      const idx = meta.universe.findIndex((a) => a.name === coin);
      if (idx !== -1) assetCtxMap[coin] = assetCtxs[idx];
    }
  }

  // Build map from xyz dex
  if (xyzQuery.data) {
    const { meta, assetCtxs } = xyzQuery.data;
    for (const coin of MARKET_COINS) {
      const idx = meta.universe.findIndex((a) => a.name === coin);
      if (idx !== -1) assetCtxMap[coin] = assetCtxs[idx];
    }
  }

  return {
    meta: defaultQuery.data,
    assetCtxMap,
    isLoading: defaultQuery.isLoading || xyzQuery.isLoading,
  };
}
