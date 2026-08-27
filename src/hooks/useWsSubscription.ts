"use client";

import { useEffect, useRef } from "react";
import { getWs, type WsChannel } from "@/lib/ws";

/**
 * Subscribes to a websocket channel for the lifetime of the component.
 * `channel` must be referentially stable (module constant or useMemo).
 */
export function useWsSubscription(
  channel: WsChannel | null,
  handler: (data: unknown) => void
) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!channel) return;
    const ws = getWs();
    const listener = (data: unknown) => handlerRef.current(data);
    ws.subscribe(channel, listener);
    return () => ws.unsubscribe(channel, listener);
  }, [channel]);
}
