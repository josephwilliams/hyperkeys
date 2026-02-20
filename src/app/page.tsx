"use client";

import dynamic from "next/dynamic";
import MarketHeader from "@/components/MarketHeader";
import Orderbook from "@/components/Orderbook";
import TradingPanel from "@/components/TradingPanel";
import PositionsTable from "@/components/PositionsTable";

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
  return (
    <div className="h-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Market header */}
      <MarketHeader />

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
      <div
        className="h-8 flex items-center px-8 border-t text-[10px] select-none"
        style={{ borderColor: "var(--border)", background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
      >
        Keyboard shortcuts
      </div>
    </div>
  );
}
