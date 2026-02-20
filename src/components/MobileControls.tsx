"use client";

import { useRef, useState, useEffect } from "react";
import { useTradingStore } from "@/stores/tradingStore";
import { MARKETS } from "@/lib/constants";

interface MobileControlsProps {
  onExecute: () => void;
  showOrderbook: boolean;
  onToggleOrderbook: () => void;
}

export default function MobileControls({ onExecute, showOrderbook, onToggleOrderbook }: MobileControlsProps) {
  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const side = useTradingStore((s) => s.side);
  const candleInterval = useTradingStore((s) => s.candleInterval);
  const denomination = useTradingStore((s) => s.denomination);
  const setSelectedCoin = useTradingStore((s) => s.setSelectedCoin);
  const toggleSide = useTradingStore((s) => s.toggleSide);
  const toggleDenomination = useTradingStore((s) => s.toggleDenomination);
  const cycleCandleInterval = useTradingStore((s) => s.cycleCandleInterval);

  const [marketOpen, setMarketOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!marketOpen) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setMarketOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [marketOpen]);

  const btnStyle = {
    background: "var(--bg-tertiary)",
    color: "var(--text-secondary)",
    border: "1px solid var(--border)",
  };

  return (
    <div className="flex items-center gap-1 !px-6 !py-1 md:hidden overflow-x-auto">
      <div className="relative shrink-0" ref={dropdownRef}>
        <button
          onClick={() => setMarketOpen((v) => !v)}
          className="px-2 py-1 rounded text-[10px] shrink-0"
          style={btnStyle}
        >
          {selectedCoin} ▾
        </button>
        {marketOpen && (
          <div
            className="absolute top-full left-0 mt-1 rounded z-50 overflow-hidden"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
          >
            {MARKETS.map((m) => (
              <button
                key={m.coin}
                onClick={() => { setSelectedCoin(m.coin); setMarketOpen(false); }}
                className="block w-full text-left px-3 py-1.5 text-[10px] whitespace-nowrap"
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
      <button
        onClick={toggleSide}
        className="px-2 py-1 rounded text-[10px] font-bold uppercase shrink-0"
        style={{
          ...btnStyle,
          color: side === "long" ? "var(--green)" : "var(--red)",
        }}
      >
        {side}
      </button>
      <button
        onClick={cycleCandleInterval}
        className="px-2 py-1 rounded text-[10px] shrink-0"
        style={btnStyle}
      >
        {candleInterval}
      </button>
      <button
        onClick={toggleDenomination}
        className="px-2 py-1 rounded text-[10px] shrink-0"
        style={btnStyle}
      >
        {denomination}
      </button>
      <button
        onClick={onToggleOrderbook}
        className="px-2 py-1 rounded text-[10px] shrink-0"
        style={{
          ...btnStyle,
          background: showOrderbook ? "var(--bg-tertiary)" : btnStyle.background,
          color: btnStyle.color,
        }}
      >
        Book {showOrderbook ? "▴" : "▾"}
      </button>
      <button
        onClick={onExecute}
        className="px-3 py-1 rounded text-[10px] font-bold shrink-0"
        style={{
          background: side === "long" ? "var(--green)" : "var(--red)",
          color: "#fff",
        }}
      >
        Execute
      </button>
    </div>
  );
}
