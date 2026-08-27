"use client";

import { useEffect } from "react";
import { useTradingStore } from "@/stores/tradingStore";

/** Adopts the theme the pre-hydration script picked, so the store matches the DOM. */
export function useThemeSync() {
  const syncTheme = useTradingStore((s) => s.syncTheme);
  useEffect(() => {
    syncTheme();
  }, [syncTheme]);
}
