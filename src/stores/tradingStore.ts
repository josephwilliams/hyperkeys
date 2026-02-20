"use client";

import { create } from "zustand";
import type { Side, Denomination, Position, CandleInterval } from "@/types/trading";
import {
  MARKETS,
  CANDLE_INTERVALS,
  STARTING_BALANCE,
  DEFAULT_INTERVAL,
  SIZE_INCREMENTS,
  DEFAULT_SIZE_INCREMENT_INDEX,
} from "@/lib/constants";
import { calcPnlPerUnit } from "@/lib/format";
import type { AllMids } from "@/types/api";

type Theme = "dark" | "light";

interface TradingState {
  // Market selection
  selectedCoin: string;
  candleInterval: CandleInterval;

  // Order params
  side: Side;
  denomination: Denomination;
  orderSizeUsd: number;
  sizeIncrementIndex: number;

  // Portfolio
  balance: number;
  positions: Position[];

  // Theme
  theme: Theme;

  // Actions
  setSelectedCoin: (coin: string) => void;
  cycleMarket: () => void;
  setCandleInterval: (interval: CandleInterval) => void;
  cycleCandleInterval: () => void;
  toggleSide: () => void;
  toggleDenomination: () => void;
  increaseSize: () => void;
  decreaseSize: () => void;
  cycleSizeIncrement: () => void;
  executeOrder: (midsRef: React.RefObject<AllMids>) => void;
  toggleTheme: () => void;
  syncTheme: () => void;
}

export const useTradingStore = create<TradingState>((set, get) => ({
  selectedCoin: "BTC",
  candleInterval: DEFAULT_INTERVAL,
  side: "long",
  denomination: "USD",
  orderSizeUsd: SIZE_INCREMENTS[DEFAULT_SIZE_INCREMENT_INDEX],
  sizeIncrementIndex: DEFAULT_SIZE_INCREMENT_INDEX,
  balance: STARTING_BALANCE,
  positions: [],
  theme: "dark" as Theme,

  setSelectedCoin: (coin) => set({ selectedCoin: coin }),

  cycleMarket: () => {
    const { selectedCoin } = get();
    const idx = MARKETS.findIndex((m) => m.coin === selectedCoin);
    const next = MARKETS[(idx + 1) % MARKETS.length];
    set({ selectedCoin: next.coin });
  },

  setCandleInterval: (interval) => set({ candleInterval: interval }),

  cycleCandleInterval: () => {
    const { candleInterval } = get();
    const idx = CANDLE_INTERVALS.indexOf(candleInterval);
    set({ candleInterval: CANDLE_INTERVALS[(idx + 1) % CANDLE_INTERVALS.length] });
  },

  toggleSide: () =>
    set((s) => ({ side: s.side === "long" ? "short" : "long" })),

  toggleDenomination: () =>
    set((s) => ({ denomination: s.denomination === "USD" ? "BASE" : "USD" })),

  increaseSize: () => {
    const { orderSizeUsd, sizeIncrementIndex } = get();
    const increment = SIZE_INCREMENTS[sizeIncrementIndex];
    set({ orderSizeUsd: orderSizeUsd + increment });
  },

  decreaseSize: () => {
    const { orderSizeUsd, sizeIncrementIndex } = get();
    const increment = SIZE_INCREMENTS[sizeIncrementIndex];
    const newSize = Math.max(increment, orderSizeUsd - increment);
    set({ orderSizeUsd: newSize });
  },

  cycleSizeIncrement: () => {
    const { sizeIncrementIndex } = get();
    const nextIdx = (sizeIncrementIndex + 1) % SIZE_INCREMENTS.length;
    set({
      sizeIncrementIndex: nextIdx,
      orderSizeUsd: SIZE_INCREMENTS[nextIdx],
    });
  },

  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    document.documentElement.className = next;
    set({ theme: next });
  },

  syncTheme: () => {
    const cls = document.documentElement.className as Theme;
    if (cls === "light" || cls === "dark") set({ theme: cls });
  },

  executeOrder: (midsRef) => {
    const { selectedCoin, side, orderSizeUsd, balance, positions } = get();
    const mids = midsRef.current;
    if (!mids) return;

    const midStr = mids[selectedCoin];
    if (!midStr) return;
    const markPrice = parseFloat(midStr);
    if (!markPrice || markPrice <= 0) return;

    const orderSizeBase = orderSizeUsd / markPrice;
    const existingIdx = positions.findIndex((p) => p.coin === selectedCoin);
    const existing = existingIdx >= 0 ? positions[existingIdx] : null;

    const newPositions = [...positions];

    if (!existing) {
      // Open new position
      if (orderSizeUsd > balance) return; // reject
      newPositions.push({
        coin: selectedCoin,
        side,
        size: orderSizeBase,
        entryPrice: markPrice,
        costBasis: orderSizeUsd,
        timestamp: Date.now(),
      });
      set({ positions: newPositions, balance: balance - orderSizeUsd });
    } else if (existing.side === side) {
      // Increase position (same side)
      if (orderSizeUsd > balance) return;
      const newSize = existing.size + orderSizeBase;
      const newCostBasis = existing.costBasis + orderSizeUsd;
      const newEntry = newCostBasis / newSize;
      newPositions[existingIdx] = {
        ...existing,
        size: newSize,
        entryPrice: newEntry,
        costBasis: newCostBasis,
        timestamp: Date.now(),
      };
      set({ positions: newPositions, balance: balance - orderSizeUsd });
    } else {
      // Opposite side
      const pnlPerUnit = calcPnlPerUnit(existing.side, existing.entryPrice, markPrice);

      if (orderSizeBase < existing.size) {
        // Partial reduce
        const closedPnl = pnlPerUnit * orderSizeBase;
        const releasedCapital = orderSizeBase * existing.entryPrice;
        const remainingSize = existing.size - orderSizeBase;
        const remainingCostBasis = remainingSize * existing.entryPrice;
        newPositions[existingIdx] = {
          ...existing,
          size: remainingSize,
          costBasis: remainingCostBasis,
          timestamp: Date.now(),
        };
        set({
          positions: newPositions,
          balance: balance + releasedCapital + closedPnl,
        });
      } else {
        // Close + possible flip
        const closedPnl = pnlPerUnit * existing.size;
        const releasedCapital = existing.costBasis;
        const remainderBase = orderSizeBase - existing.size;
        const remainderUsd = remainderBase * markPrice;

        // Remove closed position
        newPositions.splice(existingIdx, 1);

        let newBalance = balance + releasedCapital + closedPnl;

        if (remainderBase > 0.000001) {
          // Open flipped position
          if (remainderUsd > newBalance) return; // reject
          newPositions.push({
            coin: selectedCoin,
            side,
            size: remainderBase,
            entryPrice: markPrice,
            costBasis: remainderUsd,
            timestamp: Date.now(),
          });
          newBalance -= remainderUsd;
        }
        set({ positions: newPositions, balance: newBalance });
      }
    }
  },
}));
