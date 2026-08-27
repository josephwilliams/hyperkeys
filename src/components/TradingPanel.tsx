"use client";

import { useCallback, useState } from "react";
import { useAllMids } from "@/hooks/useAllMids";
import { useTradingStore } from "@/stores/tradingStore";
import { baseSymbol, MARKETS_MAP, SIZE_INCREMENTS } from "@/lib/constants";
import { formatSize, formatUsd, parsePrice } from "@/lib/format";

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
  const symbol = baseSymbol(selectedCoin);
  const midPrice = parsePrice(mids[selectedCoin]);

  const displaySize =
    denomination === "USD"
      ? formatUsd(orderSizeUsd)
      : `${formatSize(midPrice ? orderSizeUsd / midPrice : 0, market.szDecimals)} ${symbol}`;

  const isLong = side === "long";

  // Remounting the button on a filled order replays its flash animation.
  const [fillCount, setFillCount] = useState(0);
  const handleExecute = useCallback(() => {
    const balanceBefore = useTradingStore.getState().balance;
    executeOrder(midsRef);
    if (useTradingStore.getState().balance !== balanceBefore) {
      setFillCount((count) => count + 1);
    }
  }, [executeOrder, midsRef]);

  return (
    <div className="flex flex-col gap-2.5 px-4 py-3.5">
      <div className="flex items-center justify-between text-[10px] text-muted">
        <span>Balance</span>
        <span className="text-subtle">{formatUsd(balance)}</span>
      </div>

      <button
        onClick={toggleSide}
        className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors border ${
          isLong
            ? "bg-green-dim text-green border-green/20"
            : "bg-red-dim text-red border-red/20"
        }`}
      >
        {side} {symbol}
      </button>

      <div className="flex items-center justify-between gap-1">
        <button
          onClick={decreaseSize}
          aria-label="Decrease size"
          className="px-2 py-1 rounded text-xs bg-elevated text-subtle"
        >
          −
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-fg">
          {displaySize}
        </div>
        <button
          onClick={increaseSize}
          aria-label="Increase size"
          className="px-2 py-1 rounded text-xs bg-elevated text-subtle"
        >
          +
        </button>
      </div>

      <button
        onClick={cycleSizeIncrement}
        className="text-[10px] text-center py-1 rounded bg-elevated text-muted"
      >
        Step: {formatUsd(SIZE_INCREMENTS[sizeIncrementIndex])}
      </button>

      <button
        key={fillCount}
        onClick={handleExecute}
        className={`w-full py-2 rounded text-xs font-bold uppercase tracking-wider text-white ${
          isLong ? "bg-green" : "bg-red"
        } ${fillCount > 0 ? "exec-flash" : ""}`}
      >
        {isLong ? "Buy" : "Sell"} / Enter ↵
      </button>
    </div>
  );
}
