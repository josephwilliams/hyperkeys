"use client";

import { useAllMids } from "@/hooks/useAllMids";
import { useTradingStore } from "@/stores/tradingStore";
import { MARKETS, SIZE_INCREMENTS } from "@/lib/constants";
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
  const market = MARKETS.find((m) => m.coin === selectedCoin)!;
  const midPrice = mids[selectedCoin] ? parseFloat(mids[selectedCoin]) : 0;

  const sizeBase = midPrice > 0 ? orderSizeUsd / midPrice : 0;
  const displaySize =
    denomination === "USD"
      ? formatUsd(orderSizeUsd)
      : `${formatSize(sizeBase, market.szDecimals)} ${selectedCoin}`;

  const isLong = side === "long";
  const sideColor = isLong ? "var(--green)" : "var(--red)";
  const sideBg = isLong ? "var(--green-dim)" : "var(--red-dim)";

  return (
    <div className="flex flex-col gap-2.5 px-4 py-3.5">
      {/* Balance */}
      <div className="flex items-center justify-between text-[10px]" style={{ color: "var(--text-muted)" }}>
        <span>Balance</span>
        <span style={{ color: "var(--text-secondary)" }}>{formatUsd(balance)}</span>
      </div>

      {/* Side toggle */}
      <button
        onClick={toggleSide}
        className="w-full py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors"
        style={{ background: sideBg, color: sideColor, border: `1px solid ${sideColor}33` }}
      >
        {side} {selectedCoin}
      </button>

      {/* Size display */}
      <div className="flex items-center justify-between gap-1">
        <button
          onClick={decreaseSize}
          className="px-2 py-1 rounded text-xs"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
        >
          −
        </button>
        <div className="flex-1 text-center text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          {displaySize}
        </div>
        <button
          onClick={increaseSize}
          className="px-2 py-1 rounded text-xs"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
        >
          +
        </button>
      </div>

      {/* Increment */}
      <button
        onClick={cycleSizeIncrement}
        className="text-[10px] text-center py-1 rounded"
        style={{ background: "var(--bg-tertiary)", color: "var(--text-muted)" }}
      >
        Step: {formatUsd(SIZE_INCREMENTS[sizeIncrementIndex])}
      </button>

      {/* Execute */}
      <button
        onClick={() => executeOrder(midsRef)}
        className="w-full py-2 rounded text-xs font-bold uppercase tracking-wider"
        style={{ background: sideColor, color: "#fff" }}
      >
        {side === "long" ? "Buy" : "Sell"} / Enter ↵
      </button>
    </div>
  );
}
