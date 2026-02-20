"use client";

import { useTradingStore } from "@/stores/tradingStore";

const hints = [
  { key: "↑↓", label: "Size" },
  { key: "Enter", label: "Execute" },
  { key: "Space", label: "Step" },
  { key: "S", label: "Side" },
  { key: "Q", label: "Denom" },
  { key: "M", label: "Market" },
  { key: "I", label: "Interval" },
  { key: "T", label: "Theme" },
];

export default function KeyboardHints() {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const side = useTradingStore((s) => s.side);
  const candleInterval = useTradingStore((s) => s.candleInterval);
  const denomination = useTradingStore((s) => s.denomination);

  return (
    <div
      className="h-8 flex items-center !px-12 gap-4 border-t text-[10px] select-none overflow-x-auto"
      style={{
        borderColor: "var(--border)",
        background: "var(--bg-tertiary)",
        color: "var(--text-muted)",
      }}
    >
      {hints.map((h) => (
        <div key={h.key} className="flex items-center gap-1 shrink-0">
          <kbd
            className="px-1 py-0.5 rounded"
            style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
          >
            {h.key}
          </kbd>
          <span>{h.label}</span>
        </div>
      ))}
      <div className="ml-auto flex items-center gap-3 shrink-0">
        <span>{selectedCoin}</span>
        <span className="uppercase" style={{ color: side === "long" ? "var(--green)" : "var(--red)" }}>
          {side}
        </span>
        <span>{candleInterval}</span>
        <span>{denomination}</span>
      </div>
    </div>
  );
}
