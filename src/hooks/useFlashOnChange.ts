"use client";

import { useEffect, useRef } from "react";
import { FLASH_DURATION_MS } from "@/lib/constants";

const FLASH_CLASSES = ["flash-green", "flash-red"];

/**
 * Flashes an element green or red when `value` ticks up or down.
 * Attach the returned ref to the element that should flash.
 */
export function useFlashOnChange<T extends HTMLElement>(value: number | null) {
  const elementRef = useRef<T>(null);
  const previousRef = useRef(value);

  useEffect(() => {
    const element = elementRef.current;
    const previous = previousRef.current;
    previousRef.current = value;
    if (!element || value === null || previous === null || value === previous) {
      return;
    }

    element.classList.remove(...FLASH_CLASSES);
    void element.offsetWidth; // reflow, so a repeated move restarts the animation
    element.classList.add(value > previous ? "flash-green" : "flash-red");

    const timer = setTimeout(
      () => element.classList.remove(...FLASH_CLASSES),
      FLASH_DURATION_MS
    );
    return () => clearTimeout(timer);
  }, [value]);

  return elementRef;
}
