"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchMetaAndAssetCtxs } from "@/lib/api";
import { MARKETS_MAP, META_REFRESH_MS, XYZ_DEX } from "@/lib/constants";
import type { AssetCtx } from "@/types/api";

function useDexMeta(dex?: string) {
  return useQuery({
    queryKey: dex ? ["metaAndAssetCtxs", dex] : ["metaAndAssetCtxs"],
    queryFn: () => fetchMetaAndAssetCtxs(dex),
    staleTime: META_REFRESH_MS,
    refetchInterval: META_REFRESH_MS,
  });
}

/**
 * Per-coin context (funding, open interest, 24h reference price) for the
 * supported markets, keyed by coin id. Universe names are already dex-prefixed.
 */
export function useMeta() {
  const defaultQuery = useDexMeta();
  const xyzQuery = useDexMeta(XYZ_DEX);

  const assetCtxMap = useMemo(() => {
    const map: Record<string, AssetCtx> = {};
    for (const data of [defaultQuery.data, xyzQuery.data]) {
      data?.meta.universe.forEach((asset, i) => {
        if (asset.name in MARKETS_MAP) map[asset.name] = data.assetCtxs[i];
      });
    }
    return map;
  }, [defaultQuery.data, xyzQuery.data]);

  return {
    assetCtxMap,
    isLoading: defaultQuery.isLoading || xyzQuery.isLoading,
  };
}
