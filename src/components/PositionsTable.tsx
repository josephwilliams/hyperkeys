"use client";

import { useTradingStore } from "@/stores/tradingStore";
import { useAllMids } from "@/hooks/useAllMids";
import { formatUsd } from "@/lib/format";
import PositionRow from "./PositionRow";

export default function PositionsTable() {
  const positions = useTradingStore((s) => s.positions);
  const balance = useTradingStore((s) => s.balance);
  const { mids } = useAllMids();

  // Calculate total uPnL
  let totalUPnl = 0;
  for (const pos of positions) {
    const mark = mids[pos.coin] ? parseFloat(mids[pos.coin]) : pos.entryPrice;
    const pnlPerUnit =
      pos.side === "long" ? mark - pos.entryPrice : pos.entryPrice - mark;
    totalUPnl += pnlPerUnit * pos.size;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-8 py-2 text-[10px] uppercase tracking-wider border-b"
        style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}
      >
        <span>Positions ({positions.length})</span>
        <div className="flex gap-4">
          <span>
            uPnL:{" "}
            <span style={{ color: totalUPnl >= 0 ? "var(--green)" : "var(--red)" }}>
              {totalUPnl >= 0 ? "+" : ""}{formatUsd(totalUPnl)}
            </span>
          </span>
          <span>
            Equity:{" "}
            <span style={{ color: "var(--text-secondary)" }}>
              {formatUsd(balance + totalUPnl)}
            </span>
          </span>
        </div>
      </div>

      {positions.length === 0 ? (
        <div
          className="flex-1 flex items-center justify-center text-xs"
          style={{ color: "var(--text-muted)" }}
        >
          No open positions — press Enter to trade
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead>
              <tr
                className="text-[10px] uppercase tracking-wider"
                style={{ color: "var(--text-muted)", borderBottom: "1px solid var(--border)" }}
              >
                <th className="px-5 py-1.5 text-left font-normal">Market</th>
                <th className="px-5 py-1.5 text-left font-normal">Side</th>
                <th className="px-5 py-1.5 text-left font-normal">Size</th>
                <th className="px-5 py-1.5 text-left font-normal">Entry</th>
                <th className="px-5 py-1.5 text-left font-normal">Mark</th>
                <th className="px-5 py-1.5 text-left font-normal">uPnL</th>
                <th className="px-5 py-1.5 text-left font-normal">uPnL %</th>
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
