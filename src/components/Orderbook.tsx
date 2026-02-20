"use client";

import { useMemo } from "react";
import { useOrderbook } from "@/hooks/useOrderbook";
import { useAllMids } from "@/hooks/useAllMids";
import { useTradingStore } from "@/stores/tradingStore";
import { MARKETS, ORDERBOOK_LEVELS } from "@/lib/constants";
import { formatPrice, formatSize } from "@/lib/format";
import OrderbookRow from "./OrderbookRow";

export default function Orderbook() {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const denomination = useTradingStore((s) => s.denomination);
  const { bids, asks } = useOrderbook(selectedCoin);
  const { mids } = useAllMids();

  const market = MARKETS.find((m) => m.coin === selectedCoin)!;
  const midPrice = mids[selectedCoin] ? parseFloat(mids[selectedCoin]) : null;

  const displayAsks = useMemo(() => {
    const sliced = asks.slice(0, ORDERBOOK_LEVELS);
    const maxSz = Math.max(...sliced.map((l) => parseFloat(l.sz)), 0.001);
    return sliced
      .map((level) => {
        const sz = parseFloat(level.sz);
        const displaySize =
          denomination === "USD"
            ? (sz * parseFloat(level.px)).toFixed(0)
            : formatSize(sz, market.szDecimals);
        return {
          price: formatPrice(parseFloat(level.px), market.pxDecimals),
          size: displaySize,
          depthPercent: (sz / maxSz) * 100,
        };
      })
      .reverse();
  }, [asks, denomination, market]);

  const displayBids = useMemo(() => {
    const sliced = bids.slice(0, ORDERBOOK_LEVELS);
    const maxSz = Math.max(...sliced.map((l) => parseFloat(l.sz)), 0.001);
    return sliced.map((level) => {
      const sz = parseFloat(level.sz);
      const displaySize =
        denomination === "USD"
          ? (sz * parseFloat(level.px)).toFixed(0)
          : formatSize(sz, market.szDecimals);
      return {
        price: formatPrice(parseFloat(level.px), market.pxDecimals),
        size: displaySize,
        depthPercent: (sz / maxSz) * 100,
      };
    });
  }, [bids, denomination, market]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-1.5 text-[10px] uppercase tracking-wider border-b"
        style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
      >
        <span>Price</span>
        <span>{denomination === "USD" ? "Size (USD)" : `Size (${selectedCoin})`}</span>
      </div>

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
