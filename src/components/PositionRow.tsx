"use client";

import React from "react";
import { MARKETS } from "@/lib/constants";
import { formatPrice, formatSize, formatPnl, formatPnlPercent } from "@/lib/format";
import type { Position } from "@/types/trading";

interface PositionRowProps {
  position: Position;
  markPrice: number;
}

const PositionRow = React.memo(function PositionRow({
  position,
  markPrice,
}: PositionRowProps) {
  const market = MARKETS.find((m) => m.coin === position.coin)!;
  const pnlPerUnit =
    position.side === "long"
      ? markPrice - position.entryPrice
      : position.entryPrice - markPrice;
  const uPnl = pnlPerUnit * position.size;
  const isProfit = uPnl >= 0;

  return (
    <tr className="text-xs" style={{ borderBottom: "1px solid var(--border)" }}>
      <td className="px-5 py-2.5 font-semibold" style={{ color: "var(--text-primary)" }}>
        {position.coin}
      </td>
      <td
        className="px-5 py-2.5 uppercase font-bold text-[10px]"
        style={{ color: position.side === "long" ? "var(--green)" : "var(--red)" }}
      >
        {position.side}
      </td>
      <td className="px-5 py-2.5" style={{ color: "var(--text-secondary)" }}>
        {formatSize(position.size, market.szDecimals)}
      </td>
      <td className="px-5 py-2.5" style={{ color: "var(--text-secondary)" }}>
        {formatPrice(position.entryPrice, market.pxDecimals)}
      </td>
      <td className="px-5 py-2.5" style={{ color: "var(--text-secondary)" }}>
        {formatPrice(markPrice, market.pxDecimals)}
      </td>
      <td
        className="px-5 py-2.5 font-semibold"
        style={{ color: isProfit ? "var(--green)" : "var(--red)" }}
      >
        {formatPnl(uPnl)}
      </td>
      <td
        className="px-5 py-2.5"
        style={{ color: isProfit ? "var(--green)" : "var(--red)" }}
      >
        {formatPnlPercent(uPnl, position.costBasis)}
      </td>
      <td className="px-5 py-2.5 text-[10px]" style={{ color: "var(--text-muted)" }}>
        {new Date(position.timestamp).toLocaleTimeString()}
      </td>
    </tr>
  );
});

export default PositionRow;
