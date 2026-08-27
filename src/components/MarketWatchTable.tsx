"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useFlashOnChange } from "@/hooks/useFlashOnChange";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useMarketWatch, type MarketRow } from "@/hooks/useMarketWatch";
import { useThemeSync } from "@/hooks/useThemeSync";
import { FUNDING_DECIMALS } from "@/lib/constants";
import {
  formatPercent,
  formatPrice,
  formatSignedPercent,
  formatUsdCompact,
} from "@/lib/format";
import { useTradingStore } from "@/stores/tradingStore";
import KeyboardHints, { type Hint } from "./KeyboardHints";
import ThemeToggle from "./ThemeToggle";

const HINTS: Hint[] = [{ key: "T", label: "Theme" }];
const EMPTY = "—";

const COLUMNS = [
  "Market",
  "Price",
  "24h Change",
  "Funding Rate",
  "Open Interest",
];

function MarketWatchRow({ row }: { row: MarketRow }) {
  const priceRef = useFlashOnChange<HTMLTableCellElement>(row.price);
  const changeRef = useFlashOnChange<HTMLTableCellElement>(row.change24h);
  const fundingRef = useFlashOnChange<HTMLTableCellElement>(row.funding);
  const oiRef = useFlashOnChange<HTMLTableCellElement>(row.openInterest);

  const changeColor =
    row.change24h === null
      ? "text-muted"
      : row.change24h >= 0
        ? "text-green"
        : "text-red";

  return (
    <tr className="border-b border-edge hover:bg-elevated transition-colors">
      <td className="py-4 font-semibold text-fg">{row.label}</td>
      <td ref={priceRef} className="py-4 text-right text-fg">
        {row.price !== null ? `$${formatPrice(row.price, row.pxDecimals)}` : EMPTY}
      </td>
      <td ref={changeRef} className={`py-4 text-right ${changeColor}`}>
        {row.change24h !== null ? formatSignedPercent(row.change24h) : EMPTY}
      </td>
      <td ref={fundingRef} className="py-4 text-right text-subtle">
        {row.funding !== null
          ? formatPercent(row.funding, FUNDING_DECIMALS)
          : EMPTY}
      </td>
      <td ref={oiRef} className="py-4 text-right text-subtle">
        {row.openInterest !== null ? formatUsdCompact(row.openInterest) : EMPTY}
      </td>
    </tr>
  );
}

export default function MarketWatchTable() {
  const toggleTheme = useTradingStore((s) => s.toggleTheme);
  const { rows, isLoading } = useMarketWatch();

  useThemeSync();
  useKeyboardShortcuts(useMemo(() => ({ t: toggleTheme }), [toggleTheme]));

  return (
    <div className="h-screen flex flex-col bg-surface">
      <div className="border-b border-edge select-none bg-panel">
        <div className="h-12 flex items-center justify-between">
          <div className="flex items-center gap-6 px-6">
            <Link
              href="/"
              className="text-sm text-muted hover:text-fg transition-colors"
            >
              Trade
            </Link>
            <span className="font-bold text-sm text-fg">Market Watch</span>
          </div>
          <div className="px-6">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted text-xs border-b border-edge">
              {COLUMNS.map((column, i) => (
                <th
                  key={column}
                  className={`pb-3 font-normal ${i === 0 ? "text-left" : "text-right"}`}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={COLUMNS.length} className="py-8 text-center text-muted">
                  Loading…
                </td>
              </tr>
            ) : (
              rows.map((row) => <MarketWatchRow key={row.coin} row={row} />)
            )}
          </tbody>
        </table>
      </div>

      <KeyboardHints hints={HINTS} />
    </div>
  );
}
