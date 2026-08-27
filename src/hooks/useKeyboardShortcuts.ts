"use client";

import { useEffect, useRef } from "react";

/** Maps a lowercased `KeyboardEvent.key` ("enter", "arrowup", " ") to its action. */
export type ShortcutMap = Record<string, () => void>;

/**
 * Binds window-level shortcuts, ignoring keystrokes meant for text fields or
 * for the browser itself (⌘T, Ctrl+R, …).
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
  const shortcutsRef = useRef(shortcuts);
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  });

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      const action = shortcutsRef.current[event.key.toLowerCase()];
      if (!action) return;
      event.preventDefault();
      action();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
}
