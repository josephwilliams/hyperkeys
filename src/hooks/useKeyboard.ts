"use client";

import { useEffect } from "react";
import { useTradingStore } from "@/stores/tradingStore";
import type { AllMids } from "@/types/api";

export function useKeyboard(midsRef: React.RefObject<AllMids>) {
  const store = useTradingStore;

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't capture if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          store.getState().increaseSize();
          break;
        case "ArrowDown":
          e.preventDefault();
          store.getState().decreaseSize();
          break;
        case "Enter":
          e.preventDefault();
          store.getState().executeOrder(midsRef);
          break;
        case " ":
          e.preventDefault();
          store.getState().cycleSizeIncrement();
          break;
        case "s":
        case "S":
          e.preventDefault();
          store.getState().toggleSide();
          break;
        case "q":
        case "Q":
          e.preventDefault();
          store.getState().toggleDenomination();
          break;
        case "m":
        case "M":
          e.preventDefault();
          store.getState().cycleMarket();
          break;
        case "i":
        case "I":
          e.preventDefault();
          store.getState().cycleCandleInterval();
          break;
        case "t":
        case "T":
          e.preventDefault();
          store.getState().toggleTheme();
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [midsRef, store]);
}
