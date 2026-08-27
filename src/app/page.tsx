"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAllMids } from "@/hooks/useAllMids";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useThemeSync } from "@/hooks/useThemeSync";
import { useTradingStore } from "@/stores/tradingStore";
import MarketHeader from "@/components/MarketHeader";
import Orderbook from "@/components/Orderbook";
import TradingPanel from "@/components/TradingPanel";
import PositionsTable from "@/components/PositionsTable";
import KeyboardHints, { type Hint } from "@/components/KeyboardHints";
import TradingStatus from "@/components/TradingStatus";
import MobileControls from "@/components/MobileControls";
import ErrorBoundary from "@/components/ErrorBoundary";

const HINTS: Hint[] = [
  { key: "↑↓", label: "Size" },
  { key: "Enter", label: "Execute" },
  { key: "Space", label: "Step" },
  { key: "S", label: "Side" },
  { key: "Q", label: "Denom" },
  { key: "M", label: "Market" },
  { key: "I", label: "Interval" },
  { key: "T", label: "Theme" },
];

const CandleChart = dynamic(() => import("@/components/CandleChart"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-muted">
      Loading chart…
    </div>
  ),
});

export default function TradingPage() {
  const { midsRef } = useAllMids();
  const executeOrder = useTradingStore((s) => s.executeOrder);
  const [mobileOrderbook, setMobileOrderbook] = useState(false);

  useKeyboard(midsRef);
  useThemeSync();

  return (
    <ErrorBoundary>
      <div className="h-screen flex flex-col bg-surface">
      {/* Market header */}
      <MarketHeader />

      {/* Mobile controls (hidden on md+) */}
      <MobileControls
        onExecute={() => executeOrder(midsRef)}
        showOrderbook={mobileOrderbook}
        onToggleOrderbook={() => setMobileOrderbook((v) => !v)}
      />

      {/* Mobile orderbook (hidden on md+) */}
      {mobileOrderbook && (
        <div className="md:hidden border-b border-edge overflow-hidden bg-panel h-[240px]">
          <Orderbook />
        </div>
      )}

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_280px] grid-rows-[1fr_180px] overflow-hidden min-h-0">
        {/* Chart area */}
        <div className="border-r border-b border-edge min-h-0 overflow-hidden bg-surface">
          <CandleChart />
        </div>

        {/* Orderbook + Trading Panel */}
        <div className="border-b border-edge flex-col hidden md:flex min-h-0 overflow-hidden bg-panel">
          <div className="flex-1 min-h-0 overflow-hidden">
            <Orderbook />
          </div>
          <div className="border-t border-edge">
            <TradingPanel />
          </div>
        </div>

        {/* Positions table */}
        <div className="col-span-1 md:col-span-2 min-h-0 overflow-hidden bg-panel">
          <PositionsTable />
        </div>
      </div>

      {/* Keyboard hints bar */}
      <KeyboardHints hints={HINTS}>
        <TradingStatus />
      </KeyboardHints>
      </div>
    </ErrorBoundary>
  );
}
