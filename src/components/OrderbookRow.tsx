"use client";

import React from "react";

interface OrderbookRowProps {
  price: string;
  size: string;
  depthPercent: number;
  side: "bid" | "ask";
}

const OrderbookRow = React.memo(function OrderbookRow({
  price,
  size,
  depthPercent,
  side,
}: OrderbookRowProps) {
  const isBid = side === "bid";
  const barColor = isBid ? "rgba(0,200,83,0.12)" : "rgba(255,23,68,0.12)";
  const textColor = isBid ? "var(--green)" : "var(--red)";

  return (
    <div
      className="relative flex items-center justify-between !px-4 !py-[2px] text-xs font-mono"
      style={{ height: "20px" }}
    >
      {/* Depth bar */}
      <div
        className="absolute top-0 bottom-0 right-0"
        style={{
          width: `${Math.min(depthPercent, 100)}%`,
          background: barColor,
        }}
      />
      <span className="relative z-10" style={{ color: textColor }}>
        {price}
      </span>
      <span className="relative z-10" style={{ color: "var(--text-secondary)" }}>
        {size}
      </span>
    </div>
  );
});

export default OrderbookRow;
