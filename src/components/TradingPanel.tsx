"use client";

import { useState, useCallback } from "react";
import { useAllMids } from "@/hooks/useAllMids";
import { useTradingStore } from "@/stores/tradingStore";
import { MARKETS_MAP, SIZE_INCREMENTS } from "@/lib/constants";
import { formatUsd, formatSize } from "@/lib/format";

export default function TradingPanel() {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const side = useTradingStore((s) => s.side);
  const denomination = useTradingStore((s) => s.denomination);
  const orderSizeUsd = useTradingStore((s) => s.orderSizeUsd);
  const sizeIncrementIndex = useTradingStore((s) => s.sizeIncrementIndex);
  const balance = useTradingStore((s) => s.balance);
  const toggleSide = useTradingStore((s) => s.toggleSide);
  const increaseSize = useTradingStore((s) => s.increaseSize);
  const decreaseSize = useTradingStore((s) => s.decreaseSize);
  const cycleSizeIncrement = useTradingStore((s) => s.cycleSizeIncrement);
  const executeOrder = useTradingStore((s) => s.executeOrder);

  const { mids, midsRef } = useAllMids();
  const market = MARKETS_MAP[selectedCoin];
  const midPrice = mids[selectedCoin] ? parseFloat(mids[selectedCoin]) : 0;

  const sizeBase = midPrice > 0 ? orderSizeUsd / midPrice : 0;
  const displaySize =
    denomination === "USD"
      ? formatUsd(orderSizeUsd)
      : `${formatSize(sizeBase, market.szDecimals)} ${selectedCoin}`;

  const isLong = side === "long";

  // Execution flash feedback
  const [flashKey, setFlashKey] = useState(0);
  const handleExecute = useCallback(() => {
    const prevBalance = useTradingStore.getState().balance;
    executeOrder(midsRef);
    if (useTradingStore.getState().balance !== prevBalance) {
      setFlashKey((k) => k + 1);
    }
  }, [executeOrder, midsRef]);

  return (
    <div className="flex flex-col gap-2.5 !px-4 !py-3.5">
      {/* Balance */}
      <div className="flex items-center justify-between text-[10px] text-muted">
        <span>Balance</span>
        <span className="text-subtle">{formatUsd(balance)}</span>
      </div>

      {/* Side toggle */}
      <button
        onClick={toggleSide}
        className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors border ${
          isLong
            ? "bg-green-dim text-green border-green/20"
            : "bg-red-dim text-red border-red/20"
        }`}
      >
        {side} {selectedCoin}
      </button>

      {/* Size display */}
      <div className="flex items-center justify-between gap-1">
        <button
          onClick={decreaseSize}
          className="px-2 py-1 rounded text-xs bg-elevated text-subtle"
        >
          −
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-fg">
          {displaySize}
        </div>
        <button
          onClick={increaseSize}
          className="px-2 py-1 rounded text-xs bg-elevated text-subtle"
        >
          +
        </button>
      </div>

      {/* Increment */}
      <button
        onClick={cycleSizeIncrement}
        className="text-[10px] text-center py-1 rounded bg-elevated text-muted"
      >
        Step: {formatUsd(SIZE_INCREMENTS[sizeIncrementIndex])}
      </button>

      {/* Execute */}
      <button
        key={flashKey}
        onClick={handleExecute}
        className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wider text-white ${
          isLong ? "bg-green" : "bg-red"
        } ${flashKey > 0 ? "exec-flash" : ""}`}
      >
        {side === "long" ? "Buy" : "Sell"} / Enter ↵
      </button>
    </div>
  );
}
