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

  return (
    <div className="flex items-center gap-1 !px-6 !py-1 md:hidden overflow-x-auto">
      <MarketDropdown
        className="relative shrink-0"
        itemClassName="px-3 py-1.5 text-[10px]"
        renderTrigger={(toggle) => (
          <button
            onClick={toggle}
            className="px-2 py-1 rounded text-[10px] shrink-0 bg-elevated text-subtle border border-edge"
          >
            {selectedCoin} ▾
          </button>
        )}
      />
      <button
        onClick={toggleSide}
        className={`px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0 bg-elevated border border-edge ${
          side === "long" ? "text-green" : "text-red"
        }`}
      >
        {side}
      </button>
      <button
        onClick={cycleCandleInterval}
        className="px-2 py-1 rounded text-[10px] shrink-0 bg-elevated text-subtle border border-edge"
      >
        {candleInterval}
      </button>
      <button
        onClick={toggleDenomination}
        className="px-2 py-1 rounded text-[10px] shrink-0 bg-elevated text-subtle border border-edge"
      >
        {denomination}
      </button>
      <button
        onClick={onToggleOrderbook}
        className="px-2 py-1 rounded text-[10px] shrink-0 bg-elevated text-subtle border border-edge"
      >
        Book {showOrderbook ? "▴" : "▾"}
      </button>
      <button
        onClick={onExecute}
        className={`px-3 py-1 rounded text-[10px] font-bold shrink-0 text-white ${
          side === "long" ? "bg-green" : "bg-red"
        }`}
      >
        Execute
      </button>
    </div>
  );
}
