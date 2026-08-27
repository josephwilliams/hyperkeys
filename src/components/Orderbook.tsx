"use client";

import { useMemo } from "react";
import { useOrderbook } from "@/hooks/useOrderbook";
import { useAllMids } from "@/hooks/useAllMids";
import { useTradingStore } from "@/stores/tradingStore";
import { baseSymbol, MARKETS_MAP, ORDERBOOK_LEVELS } from "@/lib/constants";
import { formatPrice, formatSize, parsePrice } from "@/lib/format";
import type { L2BookLevel } from "@/types/api";
import type { Denomination, Market } from "@/types/trading";
import OrderbookRow from "./OrderbookRow";

interface DepthLevel {
  price: string;
  size: string;
  depthPercent: number;
}

/** Formats one side of the book, with each level's bar sized by cumulative depth. */
function buildDepthLevels(
  levels: L2BookLevel[],
  denomination: Denomination,
  market: Market
): DepthLevel[] {
  const sizes = levels.map((level) => parseFloat(level.sz));
  const totalSize = sizes.reduce((sum, size) => sum + size, 0) || 1;

  let cumulative = 0;
  return levels.map((level, i) => {
    const size = sizes[i];
    const price = parseFloat(level.px);
    cumulative += size;
    return {
      price: formatPrice(price, market.pxDecimals),
      size:
        denomination === "USD"
          ? (size * price).toFixed(0)
          : formatSize(size, market.szDecimals),
      depthPercent: (cumulative / totalSize) * 100,
    };
  });
}

export default function Orderbook() {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const denomination = useTradingStore((s) => s.denomination);
  const { bids, asks, isLoading } = useOrderbook(selectedCoin);
  const { mids } = useAllMids();

  const market = MARKETS_MAP[selectedCoin];
  const midPrice = parsePrice(mids[selectedCoin]);

  // Asks are reversed so the lowest ask sits next to the mid price.
  const displayAsks = useMemo(
    () =>
      buildDepthLevels(
        asks.slice(0, ORDERBOOK_LEVELS),
        denomination,
        market
      ).reverse(),
    [asks, denomination, market]
  );

  const displayBids = useMemo(
    () => buildDepthLevels(bids.slice(0, ORDERBOOK_LEVELS), denomination, market),
    [bids, denomination, market]
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-4 py-1.5 text-[10px] uppercase tracking-wider border-b border-edge text-muted">
        <span>Price</span>
        <span>
          Size ({denomination === "USD" ? "USD" : baseSymbol(selectedCoin)})
        </span>
      </div>

      {isLoading && bids.length === 0 && (
        <div className="flex-1 flex items-center justify-center text-xs text-muted">
          Loading orderbook…
        </div>
      )}

      <div className="flex-1 flex flex-col justify-end overflow-hidden">
        {displayAsks.map((row) => (
          <OrderbookRow key={`ask-${row.price}`} {...row} side="ask" />
        ))}
      </div>

      <div className="flex items-center justify-center py-1 text-xs font-semibold border-y border-edge text-fg">
        {midPrice !== null ? formatPrice(midPrice, market.pxDecimals) : "—"}
      </div>

      <div className="flex-1 overflow-hidden">
        {displayBids.map((row) => (
          <OrderbookRow key={`bid-${row.price}`} {...row} side="bid" />
        ))}
      </div>
    </div>
  );
}
