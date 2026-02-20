"use client";

import { useEffect, useRef, useState } from "react";
import { useAllMids } from "@/hooks/useAllMids";
import { useMeta } from "@/hooks/useMeta";
import { MARKETS } from "@/lib/constants";
import { formatPrice, formatChange24h } from "@/lib/format";
import { useTradingStore } from "@/stores/tradingStore";

export default function MarketHeader() {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const theme = useTradingStore((s) => s.theme);
  const toggleTheme = useTradingStore((s) => s.toggleTheme);
  const market = MARKETS.find((m) => m.coin === selectedCoin)!;
  const { mids } = useAllMids();
  const { assetCtxMap } = useMeta();

  const midPrice = mids[selectedCoin] ? parseFloat(mids[selectedCoin]) : null;
  const ctx = assetCtxMap[selectedCoin];
  const prevDayPx = ctx ? parseFloat(ctx.prevDayPx) : null;

  const prevPriceRef = useRef(midPrice);
  const [flashClass, setFlashClass] = useState("");

  useEffect(() => {
    if (midPrice === null || prevPriceRef.current === null) {
      prevPriceRef.current = midPrice;
      return;
    }
    if (midPrice > prevPriceRef.current) {
      setFlashClass("flash-green");
    } else if (midPrice < prevPriceRef.current) {
      setFlashClass("flash-red");
    }
    prevPriceRef.current = midPrice;
    const t = setTimeout(() => setFlashClass(""), 400);
    return () => clearTimeout(t);
  }, [midPrice]);

  const change24h =
    midPrice !== null && prevDayPx !== null
      ? formatChange24h(midPrice, prevDayPx)
      : null;
  const isPositive = midPrice !== null && prevDayPx !== null && midPrice >= prevDayPx;

  return (
    <div
      className="h-12 flex items-center px-8 gap-6 border-b select-none"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      <span className="font-bold text-sm" style={{ color: "var(--text-primary)" }}>
        {market.label}
      </span>

      {midPrice !== null && (
        <span className={`text-sm font-semibold ${flashClass}`} style={{ color: "var(--text-primary)" }}>
          {formatPrice(midPrice, market.pxDecimals)}
        </span>
      )}

      {change24h && (
        <span
          className="text-xs"
          style={{ color: isPositive ? "var(--green)" : "var(--red)" }}
        >
          {change24h}
        </span>
      )}

      {ctx && (
        <>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Funding: {(parseFloat(ctx.funding) * 100).toFixed(4)}%
          </span>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            OI: ${(parseFloat(ctx.openInterest) * (midPrice ?? 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
        </>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="ml-auto px-2 py-1 rounded text-xs"
        style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
        title="Toggle theme (T)"
      >
        {theme === "dark" ? "Light" : "Dark"}
      </button>
    </div>
  );
}
