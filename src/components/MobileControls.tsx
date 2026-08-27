"use client";

import { baseSymbol } from "@/lib/constants";
import { useTradingStore } from "@/stores/tradingStore";
import MarketDropdown from "./MarketDropdown";

interface MobileControlsProps {
  onExecute: () => void;
  showOrderbook: boolean;
  onToggleOrderbook: () => void;
}

const CONTROL_CLASS =
  "px-2 py-1 rounded text-[10px] shrink-0 bg-elevated text-subtle border border-edge";

export default function MobileControls({
  onExecute,
  showOrderbook,
  onToggleOrderbook,
}: MobileControlsProps) {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const side = useTradingStore((s) => s.side);
  const candleInterval = useTradingStore((s) => s.candleInterval);
  const denomination = useTradingStore((s) => s.denomination);
  const toggleSide = useTradingStore((s) => s.toggleSide);
  const toggleDenomination = useTradingStore((s) => s.toggleDenomination);
  const cycleCandleInterval = useTradingStore((s) => s.cycleCandleInterval);

  return (
    <div className="flex items-center gap-1 px-6 py-1 md:hidden overflow-x-auto">
      <MarketDropdown
        className="relative shrink-0"
        itemClassName="px-3 py-1.5 text-[10px]"
        renderTrigger={(toggle) => (
          <button onClick={toggle} className={CONTROL_CLASS}>
            {baseSymbol(selectedCoin)} ▾
          </button>
        )}
      />
      <button
        onClick={toggleSide}
        className={`${CONTROL_CLASS} font-bold uppercase ${
          side === "long" ? "text-green" : "text-red"
        }`}
      >
        {side}
      </button>
      <button onClick={cycleCandleInterval} className={CONTROL_CLASS}>
        {candleInterval}
      </button>
      <button onClick={toggleDenomination} className={CONTROL_CLASS}>
        {denomination}
      </button>
      <button onClick={onToggleOrderbook} className={CONTROL_CLASS}>
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
