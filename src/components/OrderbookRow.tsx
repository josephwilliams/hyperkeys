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

  return (
    <div className="relative flex items-center justify-between !px-4 !py-[2px] text-xs font-mono h-5">
      {/* Depth bar */}
      <div
        className={`absolute top-0 bottom-0 right-0 ${isBid ? "bg-green-dim" : "bg-red-dim"}`}
        style={{ width: `${Math.min(depthPercent, 100)}%` }}
      />
      <span className={`relative z-10 ${isBid ? "text-green" : "text-red"}`}>
        {price}
      </span>
      <span className="relative z-10 text-subtle">
        {size}
      </span>
    </div>
  );
});

export default OrderbookRow;
