"use client";

import { useEffect, useRef, useState } from "react";
import { useAllMids } from "@/hooks/useAllMids";
import { useMeta } from "@/hooks/useMeta";
import { MARKETS_MAP } from "@/lib/constants";
import { formatPrice, formatChange24h } from "@/lib/format";
import { useTradingStore } from "@/stores/tradingStore";
import MarketDropdown from "./MarketDropdown";

export default function MarketHeader() {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const theme = useTradingStore((s) => s.theme);
  const toggleTheme = useTradingStore((s) => s.toggleTheme);
  const market = MARKETS_MAP[selectedCoin];
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
    const t = setTimeout(() => setFlashClass(""), 1000);
    return () => clearTimeout(t);
  }, [midPrice]);

  const change24h =
    midPrice !== null && prevDayPx !== null
      ? formatChange24h(midPrice, prevDayPx)
      : null;
  const isPositive = midPrice !== null && prevDayPx !== null && midPrice >= prevDayPx;

  const fundingStr = ctx ? `${(parseFloat(ctx.funding) * 100).toFixed(4)}%` : null;
  const oiStr = ctx
    ? `$${(parseFloat(ctx.openInterest) * (midPrice ?? 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
    : null;

  return (
    <div className="border-b border-edge select-none bg-panel">
      {/* Top row: market info + theme toggle */}
      <div className="h-12 flex items-center justify-between">
        {/* Market info */}
        <div className="flex items-center gap-6 !px-6">
          <MarketDropdown
            renderTrigger={(toggle) => (
              <button onClick={toggle} className="font-bold text-sm text-fg">
                {market.label} <span className="text-sm text-muted">▾</span>
              </button>
            )}
          />

          {midPrice !== null ? (
            <span className={`text-sm font-semibold text-fg ${flashClass}`}>
              ${formatPrice(midPrice, market.pxDecimals)}
            </span>
          ) : (
            <span className="text-xs text-muted">Loading…</span>
          )}

          {change24h && (
            <span className={`text-xs ${isPositive ? "text-green" : "text-red"}`}>
              <span className="text-muted">24h</span> {change24h}
            </span>
          )}

          {/* Funding + OI: visible on desktop, hidden on mobile */}
          {ctx && (
            <>
              <span className="text-xs hidden md:inline text-subtle">
                Funding: {fundingStr}
              </span>
              <span className="text-xs hidden md:inline text-subtle">
                OI: {oiStr}
              </span>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <div className="!px-6">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded text-subtle"
            title="Toggle theme (T)"
          >
            {theme === "dark" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Second row: Funding + OI on mobile only */}
      {ctx && (
        <div className="flex items-center gap-4 !px-6 !py-1.5 border-t border-edge md:hidden">
          <span className="text-xs text-subtle">
            Funding: {fundingStr}
          </span>
          <span className="text-xs text-subtle">
            OI: {oiStr}
          </span>
        </div>
      )}
    </div>
  );
}
