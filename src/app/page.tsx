"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useAllMids } from "@/hooks/useAllMids";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useTradingStore } from "@/stores/tradingStore";
import MarketHeader from "@/components/MarketHeader";
import Orderbook from "@/components/Orderbook";
import TradingPanel from "@/components/TradingPanel";
import PositionsTable from "@/components/PositionsTable";
import KeyboardHints from "@/components/KeyboardHints";
import MobileControls from "@/components/MobileControls";
import ErrorBoundary from "@/components/ErrorBoundary";

const CandleChart = dynamic(() => import("@/components/CandleChart"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center h-full"
      style={{ color: "var(--text-muted)" }}
    >
      Loading chart…
    </div>
  ),
});

export default function TradingPage() {
  const { midsRef } = useAllMids();
  const executeOrder = useTradingStore((s) => s.executeOrder);
  const [mobileOrderbook, setMobileOrderbook] = useState(false);
  useKeyboard(midsRef);

  return (
    <ErrorBoundary>
    <div className="h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
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
        <div
          className="md:hidden border-b overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)", height: "240px" }}
        >
          <Orderbook />
        </div>
      )}

      {/* Main grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-[1fr_280px] grid-rows-[1fr_180px] overflow-hidden min-h-0">
        {/* Chart area */}
        <div
          className="border-r border-b min-h-0 overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--bg-primary)" }}
        >
          <CandleChart />
        </div>

        {/* Orderbook + Trading Panel */}
        <div
          className="border-b flex-col hidden md:flex min-h-0 overflow-hidden"
          style={{ borderColor: "var(--border)", background: "var(--bg-secondary)" }}
        >
          <div className="flex-1 min-h-0 overflow-hidden">
            <Orderbook />
          </div>
          <div className="border-t" style={{ borderColor: "var(--border)" }}>
            <TradingPanel />
          </div>
        </div>

        {/* Positions table */}
        <div
          className="col-span-1 md:col-span-2 min-h-0 overflow-hidden"
          style={{ background: "var(--bg-secondary)" }}
        >
          <PositionsTable />
        </div>
      </div>

      {/* Keyboard hints bar */}
      <KeyboardHints />
    </div>
    </ErrorBoundary>
  );
}
