"use client";

import { useEffect, useRef } from "react";

import { getWs } from "@/lib/ws";

export function useWsSubscription(
  key: string | null,
  handler: (data: unknown) => void
) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!key) return;

    const ws = getWs();
    const cb = (data: unknown) => handlerRef.current(data);
    ws.subscribe(key, cb);

    return () => {
      ws.unsubscribe(key, cb);
    };
  }, [key]);
}
