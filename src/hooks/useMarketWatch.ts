"use client";

import { useMemo } from "react";
import { MARKETS } from "@/lib/constants";
import { changePercent, parsePrice } from "@/lib/format";
import { useAllMids } from "./useAllMids";
import { useMeta } from "./useMeta";

export interface MarketRow {
  coin: string;
  label: string;
  pxDecimals: number;
  price: number | null;
  change24h: number | null;
  funding: number | null;
  openInterest: number | null;
}

/** Every supported market as a row, on the same live feeds the trading view uses. */
export function useMarketWatch() {
  const { mids, isLoading: midsLoading } = useAllMids();
  const { assetCtxMap, isLoading: metaLoading } = useMeta();

  const rows = useMemo<MarketRow[]>(
    () =>
      MARKETS.map((market) => {
        const price = parsePrice(mids[market.coin]);
        const ctx = assetCtxMap[market.coin];
        return {
          coin: market.coin,
          label: market.label,
          pxDecimals: market.pxDecimals,
          price,
          change24h: ctx
            ? changePercent(price, parsePrice(ctx.prevDayPx))
            : null,
          funding: ctx ? parseFloat(ctx.funding) * 100 : null,
          openInterest:
            ctx && price !== null ? parseFloat(ctx.openInterest) * price : null,
        };
      }),
    [mids, assetCtxMap]
  );

  return { rows, isLoading: midsLoading || metaLoading };
}
