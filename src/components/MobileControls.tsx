"use client";

import { useTradingStore } from "@/stores/tradingStore";
import MarketDropdown from "./MarketDropdown";

interface MobileControlsProps {
  onExecute: () => void;
  showOrderbook: boolean;
  onToggleOrderbook: () => void;
}

export default function MobileControls({ onExecute, showOrderbook, onToggleOrderbook }: MobileControlsProps) {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const side = useTradingStore((s) => s.side);
  const candleInterval = useTradingStore((s) => s.candleInterval);
  const denomination = useTradingStore((s) => s.denomination);
  const toggleSide = useTradingStore((s) => s.toggleSide);
  const toggleDenomination = useTradingStore((s) => s.toggleDenomination);
  const cycleCandleInterval = useTradingStore((s) => s.cycleCandleInterval);

  const btnStyle = {
    background: "var(--bg-tertiary)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border)",
  };

  return (
    <div className="flex items-center gap-1 !px-6 !py-1 md:hidden overflow-x-auto">
      <MarketDropdown
        className="relative shrink-0"
        itemClassName="px-3 py-1.5 text-[10px]"
        renderTrigger={(toggle) => (
          <button
            onClick={toggle}
            className="px-2 py-1 rounded text-[10px] shrink-0"
            style={btnStyle}
          >
            {selectedCoin} ▾
          </button>
        )}
      />
      <button
        onClick={toggleSide}
        className="px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0"
        style={{
          ...btnStyle,
          color: side === "long" ? "var(--green)" : "var(--red)",
        }}
      >
        {side}
      </button>
      <button
        onClick={cycleCandleInterval}
        className="px-2 py-1 rounded text-[10px] shrink-0"
        style={btnStyle}
      >
        {candleInterval}
      </button>
      <button
        onClick={toggleDenomination}
        className="px-2 py-1 rounded text-[10px] shrink-0"
        style={btnStyle}
      >
        {denomination}
      </button>
      <button
        onClick={onToggleOrderbook}
        className="px-2 py-1 rounded text-[10px] shrink-0"
        style={{
          ...btnStyle,
          background: showOrderbook ? "var(--bg-tertiary)" : btnStyle.background,
          color: btnStyle.color,
        }}
      >
        Book {showOrderbook ? "▴" : "▾"}
      </button>
      <button
        onClick={onExecute}
        className="px-3 py-1 rounded text-[10px] font-bold shrink-0"
        style={{
          background: side === "long" ? "var(--green)" : "var(--red)",
          color: "#fff",
        }}
      >
        Execute
      </button>
    </div>
  );
}
