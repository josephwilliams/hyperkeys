"use client";

import { baseSymbol } from "@/lib/constants";
import { useTradingStore } from "@/stores/tradingStore";

/** Current order context, shown at the right of the shortcut bar. */
export default function TradingStatus() {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const side = useTradingStore((s) => s.side);
  const candleInterval = useTradingStore((s) => s.candleInterval);
  const denomination = useTradingStore((s) => s.denomination);

  return (
    <>
      <span>{baseSymbol(selectedCoin)}</span>
      <span className={`uppercase ${side === "long" ? "text-green" : "text-red"}`}>
        {side}
      </span>
      <span>{candleInterval}</span>
      <span>{denomination}</span>
    </>
  );
}
