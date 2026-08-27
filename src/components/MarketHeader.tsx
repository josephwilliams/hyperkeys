"use client";

import Link from "next/link";
import { useAllMids } from "@/hooks/useAllMids";
import { useFlashOnChange } from "@/hooks/useFlashOnChange";
import { useMeta } from "@/hooks/useMeta";
import { FUNDING_DECIMALS, MARKETS_MAP } from "@/lib/constants";
import {
  changePercent,
  formatPercent,
  formatPrice,
  formatSignedPercent,
  formatUsdCompact,
  parsePrice,
} from "@/lib/format";
import { useTradingStore } from "@/stores/tradingStore";
import MarketDropdown from "./MarketDropdown";
import ThemeToggle from "./ThemeToggle";

export default function MarketHeader() {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const market = MARKETS_MAP[selectedCoin];
  const { mids } = useAllMids();
  const { assetCtxMap } = useMeta();

  const midPrice = parsePrice(mids[selectedCoin]);
  const ctx = assetCtxMap[selectedCoin];
  const change24h = ctx
    ? changePercent(midPrice, parsePrice(ctx.prevDayPx))
    : null;

  const priceElRef = useFlashOnChange<HTMLSpanElement>(midPrice);

  const stats = ctx
    ? [
        {
          label: "Funding",
          value: formatPercent(parseFloat(ctx.funding) * 100, FUNDING_DECIMALS),
        },
        {
          label: "OI",
          value: formatUsdCompact(parseFloat(ctx.openInterest) * (midPrice ?? 0)),
        },
      ]
    : [];

  return (
    <div className="border-b border-edge select-none bg-panel">
      <div className="h-12 flex items-center justify-between">
        <div className="flex items-center gap-6 px-6">
          <MarketDropdown
            renderTrigger={(toggle) => (
              <button onClick={toggle} className="font-bold text-sm text-fg">
                {market.label} <span className="text-sm text-muted">▾</span>
              </button>
            )}
          />

          {midPrice !== null ? (
            <span ref={priceElRef} className="text-sm font-semibold text-fg">
              ${formatPrice(midPrice, market.pxDecimals)}
            </span>
          ) : (
            <span className="text-xs text-muted">Loading…</span>
          )}

          {change24h !== null && (
            <span className={`text-xs ${change24h >= 0 ? "text-green" : "text-red"}`}>
              <span className="text-muted">24h</span> {formatSignedPercent(change24h)}
            </span>
          )}

          {/* Funding + OI move to their own row on mobile */}
          {stats.map((stat) => (
            <span key={stat.label} className="text-xs hidden md:inline text-subtle">
              {stat.label}: {stat.value}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-4 px-6">
          <Link
            href="/market-watch"
            className="text-xs text-muted hover:text-fg transition-colors"
          >
            Market Watch
          </Link>
          <ThemeToggle />
        </div>
      </div>

      {stats.length > 0 && (
        <div className="flex items-center gap-4 px-6 py-1.5 border-t border-edge md:hidden">
          {stats.map((stat) => (
            <span key={stat.label} className="text-xs text-subtle">
              {stat.label}: {stat.value}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
