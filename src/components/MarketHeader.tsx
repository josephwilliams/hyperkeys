"use client";

import { useEffect, useRef, useState } from "react";
import { useAllMids } from "@/hooks/useAllMids";
import { useMeta } from "@/hooks/useMeta";
import { MARKETS } from "@/lib/constants";
import { formatPrice, formatChange24h } from "@/lib/format";
import { useTradingStore } from "@/stores/tradingStore";

export default function MarketHeader() {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const setSelectedCoin = useTradingStore((s) => s.setSelectedCoin);
  const theme = useTradingStore((s) => s.theme);
  const toggleTheme = useTradingStore((s) => s.toggleTheme);
  const market = MARKETS.find((m) => m.coin === selectedCoin)!;
  const { mids } = useAllMids();
  const { assetCtxMap } = useMeta();

  const midPrice = mids[selectedCoin] ? parseFloat(mids[selectedCoin]) : null;
  const ctx = assetCtxMap[selectedCoin];
  const prevDayPx = ctx ? parseFloat(ctx.prevDayPx) : null;

  const [marketOpen, setMarketOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!marketOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMarketOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [marketOpen]);

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

  return (
    <div
      className="border-b select-none"
      style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
    >
      {/* Top row: market info + theme toggle */}
      <div className="h-12 flex items-center justify-between">
        {/* Market info */}
        <div className="flex items-center gap-6 !px-6">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setMarketOpen((v) => !v)}
              className="font-bold text-sm"
              style={{ color: "var(--text-primary)" }}
            >
              {market.label} <span className="text-sm" style={{ color: "var(--text-muted)" }}>▾</span>
            </button>
            {marketOpen && (
              <div
                className="absolute top-full left-0 mt-1 rounded z-50 overflow-hidden"
                style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
              >
                {MARKETS.map((m) => (
                  <button
                    key={m.coin}
                    onClick={() => { setSelectedCoin(m.coin); setMarketOpen(false); }}
                    className="block w-full text-left px-4 py-2 text-xs whitespace-nowrap"
                    style={{
                      color: m.coin === selectedCoin ? "var(--text-primary)" : "var(--text-secondary)",
                      background: m.coin === selectedCoin ? "var(--bg-tertiary)" : "transparent",
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {midPrice !== null ? (
            <span className={`text-sm font-semibold ${flashClass}`} style={{ color: "var(--text-primary)" }}>
              ${formatPrice(midPrice, market.pxDecimals)}
            </span>
          ) : (
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>Loading…</span>
          )}

          {change24h && (
            <span
              className="text-xs"
              style={{ color: isPositive ? "var(--green)" : "var(--red)" }}
            >
              <span style={{ color: "var(--text-muted)" }}>24h</span> {change24h}
            </span>
          )}

          {/* Funding + OI: visible on desktop, hidden on mobile */}
          {ctx && (
            <>
              <span className="text-xs hidden md:inline" style={{ color: "var(--text-secondary)" }}>
                Funding: {(parseFloat(ctx.funding) * 100).toFixed(4)}%
              </span>
              <span className="text-xs hidden md:inline" style={{ color: "var(--text-secondary)" }}>
                OI: ${(parseFloat(ctx.openInterest) * (midPrice ?? 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })}
              </span>
            </>
          )}
        </div>

        {/* Theme toggle */}
        <div className="!px-6">
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded"
            style={{ color: "var(--text-secondary)" }}
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
        <div
          className="flex items-center gap-4 !px-6 !py-1.5 border-t md:hidden"
          style={{ borderColor: "var(--border)" }}
        >
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            Funding: {(parseFloat(ctx.funding) * 100).toFixed(4)}%
          </span>
          <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
            OI: ${(parseFloat(ctx.openInterest) * (midPrice ?? 0)).toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </span>
        </div>
      )}
    </div>
  );
}
