"use client";

import { useMemo, type RefObject } from "react";
import { useTradingStore } from "@/stores/tradingStore";
import { useKeyboardShortcuts, type ShortcutMap } from "./useKeyboardShortcuts";
import type { AllMids } from "@/types/api";

/** Trading shortcuts. Labels for these live in TRADING_HINTS. */
export function useKeyboard(midsRef: RefObject<AllMids>) {
  const shortcuts = useMemo<ShortcutMap>(() => {
    // Store actions are stable, so the map only needs building once.
    const actions = useTradingStore.getState();
    return {
      arrowup: actions.increaseSize,
      arrowdown: actions.decreaseSize,
      enter: () => actions.executeOrder(midsRef),
      " ": actions.cycleSizeIncrement,
      s: actions.toggleSide,
      q: actions.toggleDenomination,
      m: actions.cycleMarket,
      i: actions.cycleCandleInterval,
      t: actions.toggleTheme,
    };
  }, [midsRef]);

  useKeyboardShortcuts(shortcuts);
}
