"use client";

import { useMemo } from "react";
import { useOrderbook } from "@/hooks/useOrderbook";
import { useAllMids } from "@/hooks/useAllMids";
import { useTradingStore } from "@/stores/tradingStore";
import { MARKETS_MAP, ORDERBOOK_LEVELS } from "@/lib/constants";
import { formatPrice, formatSize } from "@/lib/format";
import OrderbookRow from "./OrderbookRow";

function buildDepthLevels(
  levels: { px: string; sz: string }[],
  denomination: string,
  pxDecimals: number,
  szDecimals: number,
) {
  const sizes = levels.map((l) => parseFloat(l.sz));
  const cumulative: number[] = [];
  let sum = 0;
  for (const sz of sizes) {
    sum += sz;
    cumulative.push(sum);
  }
  const maxCum = cumulative[cumulative.length - 1] || 0.001;
  return levels.map((level, i) => {
    const sz = sizes[i];
    const displaySize =
      denomination === "USD"
        ? (sz * parseFloat(level.px)).toFixed(0)
        : formatSize(sz, szDecimals);
    return {
      price: formatPrice(parseFloat(level.px), pxDecimals),
      size: displaySize,
      depthPercent: (cumulative[i] / maxCum) * 100,
    };
  });
}

export default function Orderbook() {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const denomination = useTradingStore((s) => s.denomination);
  const { bids, asks, isLoading } = useOrderbook(selectedCoin);
  const { mids } = useAllMids();

  const market = MARKETS_MAP[selectedCoin];
  const midPrice = mids[selectedCoin] ? parseFloat(mids[selectedCoin]) : null;

  const displayAsks = useMemo(() => {
    return buildDepthLevels(asks.slice(0, ORDERBOOK_LEVELS), denomination, market.pxDecimals, market.szDecimals).reverse();
  }, [asks, denomination, market]);

  const displayBids = useMemo(() => {
    return buildDepthLevels(bids.slice(0, ORDERBOOK_LEVELS), denomination, market.pxDecimals, market.szDecimals);
  }, [bids, denomination, market]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between !px-4 !py-1.5 text-[10px] uppercase tracking-wider border-b"
        style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
      >
        <span>Price</span>
        <span>{denomination === "USD" ? "Size (USD)" : `Size (${selectedCoin})`}</span>
      </div>

      {isLoading && bids.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs" style={{ color: "var(--text-muted)" }}>
          Loading orderbook…
        </div>
      ) : null}

      {/* Asks (reversed so lowest ask is at bottom) */}
      <div className="flex-1 flex flex-col justify-end overflow-hidden">
        {displayAsks.map((row, i) => (
          <OrderbookRow
            key={`ask-${i}`}
            price={row.price}
            size={row.size}
            depthPercent={row.depthPercent}
            side="ask"
          />
        ))}
      </div>

      {/* Spread / mid price */}
      <div
        className="flex items-center justify-center py-1 text-xs font-semibold border-y"
        style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
      >
        {midPrice !== null ? formatPrice(midPrice, market.pxDecimals) : "—"}
      </div>

      {/* Bids */}
      <div className="flex-1 overflow-hidden">
        {displayBids.map((row, i) => (
          <OrderbookRow
            key={`bid-${i}`}
            price={row.price}
            size={row.size}
            depthPercent={row.depthPercent}
            side="bid"
          />
        ))}
      </div>
    </div>
  );
}
