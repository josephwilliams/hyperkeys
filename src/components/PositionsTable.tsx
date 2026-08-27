"use client";

import { useTradingStore } from "@/stores/tradingStore";
import { useAllMids } from "@/hooks/useAllMids";
import { formatUsd, calcPnlPerUnit } from "@/lib/format";
import PositionRow from "./PositionRow";

export default function PositionsTable() {
  const positions = useTradingStore((s) => s.positions);
  const balance = useTradingStore((s) => s.balance);
  const { mids } = useAllMids();

  let totalUPnl = 0;
  for (const pos of positions) {
    const mark = mids[pos.coin] ? parseFloat(mids[pos.coin]) : pos.entryPrice;
    totalUPnl += calcPnlPerUnit(pos.side, pos.entryPrice, mark) * pos.size;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="flex items-center justify-between px-6 py-2 text-[10px] uppercase tracking-wider border-b border-edge text-muted">
        <span>Positions ({positions.length})</span>
        <div className="flex gap-4">
          <span>
            uPnL:{" "}
            <span className={totalUPnl >= 0 ? "text-green" : "text-red"}>
              {totalUPnl >= 0 ? "+" : ""}{formatUsd(totalUPnl)}
            </span>
          </span>
          <span>
            Equity:{" "}
            <span className="text-subtle">
              {formatUsd(balance + totalUPnl)}
            </span>
          </span>
        </div>
      </div>

      {positions.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted">
          No open positions — press Enter to trade
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-2">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-muted border-b border-edge">
                <th className="px-5 py-1.5 text-left font-normal">Market</th>
                <th className="px-5 py-1.5 text-left font-normal">Side</th>
                <th className="px-5 py-1.5 text-left font-normal">Size</th>
                <th className="px-5 py-1.5 text-left font-normal">Entry</th>
                <th className="px-5 py-1.5 text-left font-normal">Mark</th>
                <th className="px-5 py-1.5 text-left font-normal">uPnL</th>
                <th className="px-5 py-1.5 text-left font-normal">uPnL %</th>
                <th className="px-5 py-1.5 text-left font-normal">Time</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((pos) => (
                <PositionRow
                  key={pos.coin}
                  position={pos}
                  markPrice={
                    mids[pos.coin]
                      ? parseFloat(mids[pos.coin])
                      : pos.entryPrice
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
