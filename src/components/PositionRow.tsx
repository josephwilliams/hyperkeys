"use client";

import React from "react";
import { MARKETS_MAP } from "@/lib/constants";
import { formatPrice, formatSize, formatPnl, formatPnlPercent, calcPnlPerUnit } from "@/lib/format";
import type { Position } from "@/types/trading";

interface PositionRowProps {
  position: Position;
  markPrice: number;
}

const PositionRow = React.memo(function PositionRow({
  position,
  markPrice,
}: PositionRowProps) {
  const market = MARKETS_MAP[position.coin];
  const uPnl = calcPnlPerUnit(position.side, position.entryPrice, markPrice) * position.size;
  const isProfit = uPnl >= 0;

  return (
    <tr className="text-xs border-b border-edge">
      <td className="px-5 py-2.5 font-semibold text-fg">
        {market.label}
      </td>
      <td
        className={`px-5 py-2.5 uppercase font-bold text-[10px] ${
          position.side === "long" ? "text-green" : "text-red"
        }`}
      >
        {position.side}
      </td>
      <td className="px-5 py-2.5 text-subtle">
        {formatSize(position.size, market.szDecimals)}
      </td>
      <td className="px-5 py-2.5 text-subtle">
        {formatPrice(position.entryPrice, market.pxDecimals)}
      </td>
      <td className="px-5 py-2.5 text-subtle">
        {formatPrice(markPrice, market.pxDecimals)}
      </td>
      <td
        className={`px-5 py-2.5 font-semibold ${isProfit ? "text-green" : "text-red"}`}
      >
        {formatPnl(uPnl)}
      </td>
      <td
        className={`px-5 py-2.5 ${isProfit ? "text-green" : "text-red"}`}
      >
        {formatPnlPercent(uPnl, position.costBasis)}
      </td>
      <td className="px-5 py-2.5 text-[10px] text-muted">
        {new Date(position.timestamp).toLocaleTimeString()}
      </td>
    </tr>
  );
});

export default PositionRow;
