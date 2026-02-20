"use client";

import { useRef, useState } from "react";
import { useTradingStore } from "@/stores/tradingStore";
import { MARKETS } from "@/lib/constants";
import { useClickOutside } from "@/hooks/useClickOutside";

interface MarketDropdownProps {
  renderTrigger: (toggle: () => void) => React.ReactNode;
  itemClassName?: string;
  className?: string;
}

export default function MarketDropdown({
  renderTrigger,
  itemClassName = "px-4 py-2 text-xs",
  className = "relative",
}: MarketDropdownProps) {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const setSelectedCoin = useTradingStore((s) => s.setSelectedCoin);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, open, () => setOpen(false));

  return (
    <div className={className} ref={ref}>
      {renderTrigger(() => setOpen((v) => !v))}
      {open && (
        <div
          className="absolute top-full left-0 mt-1 rounded z-50 overflow-hidden"
          style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
        >
          {MARKETS.map((m) => (
            <button
              key={m.coin}
              onClick={() => { setSelectedCoin(m.coin); setOpen(false); }}
              className={`block w-full text-left whitespace-nowrap ${itemClassName}`}
              style={{
                color: m.coin === selectedCoin ? "var(--text-primary)" : "var(--text-secondary)",
                background: m.coin === selectedCoin ? "var(--bg-tertiary)" : "transparent",
              }}
            >
              {m.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
