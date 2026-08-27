import { WS_URL, XYZ_DEX, XYZ_PREFIX } from "./constants";
import type { CandleInterval } from "@/types/trading";

type MessageHandler = (data: unknown) => void;

/**
 * A subscription target: `key` identifies it locally (for routing and
 * de-duplication), `payload` is what Hyperliquid expects on the wire.
 */
export interface WsChannel {
  key: string;
  payload: Record<string, string>;
}

export const wsChannels = {
  allMids: (dex?: string): WsChannel => ({
    key: dex ? `allMids:${dex}` : "allMids",
    payload: dex ? { type: "allMids", dex } : { type: "allMids" },
  }),
  l2Book: (coin: string): WsChannel => ({
    key: `l2Book:${coin}`,
    payload: { type: "l2Book", coin },
  }),
  candle: (coin: string, interval: CandleInterval): WsChannel => ({
    key: `candle:${coin}:${interval}`,
    payload: { type: "candle", coin, interval },
  }),
};

interface Subscription {
  payload: Record<string, string>;
  handlers: Set<MessageHandler>;
}

const INITIAL_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 30_000;

class HyperliquidWs {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Subscription>();
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;

  subscribe(channel: WsChannel, handler: MessageHandler) {
    let sub = this.subscriptions.get(channel.key);
    if (!sub) {
      sub = { payload: channel.payload, handlers: new Set() };
      this.subscriptions.set(channel.key, sub);
      this.connect();
      this.send("subscribe", sub.payload);
    }
    sub.handlers.add(handler);
  }

  unsubscribe(channel: WsChannel, handler: MessageHandler) {
    const sub = this.subscriptions.get(channel.key);
    if (!sub) return;
    sub.handlers.delete(handler);
    if (sub.handlers.size === 0) {
      this.send("unsubscribe", sub.payload);
      this.subscriptions.delete(channel.key);
    }
  }

  private connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    this.isConnecting = true;
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempt = 0;
      for (const sub of this.subscriptions.values()) {
        this.send("subscribe", sub.payload);
      }
    };

    this.ws.onmessage = (event) => {
      let msg: { channel?: string; data?: unknown };
      try {
        msg = JSON.parse(event.data);
      } catch {
        return; // ignore malformed frames
      }
      if (msg.channel && msg.data !== undefined) {
        this.emit(msg.channel, msg.data);
      }
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = () => this.ws?.close();
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(
      INITIAL_RECONNECT_DELAY_MS * 2 ** this.reconnectAttempt,
      MAX_RECONNECT_DELAY_MS
    );
    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private send(method: "subscribe" | "unsubscribe", subscription: Record<string, string>) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify({ method, subscription }));
  }

  private emit(channel: string, data: unknown) {
    const key = this.routeKey(channel, data);
    const sub = key ? this.subscriptions.get(key) : undefined;
    if (!sub) return;
    for (const handler of sub.handlers) handler(data);
  }

  /** Maps an inbound message back to the key of the subscription that wants it. */
  private routeKey(channel: string, data: unknown): string | null {
    if (channel === "allMids") {
      // Both dexes publish on one channel; only the xyz feed is namespaced.
      const { mids } = data as { mids?: Record<string, string> };
      const isXyz = Object.keys(mids ?? {}).some((c) => c.startsWith(XYZ_PREFIX));
      return wsChannels.allMids(isXyz ? XYZ_DEX : undefined).key;
    }
    if (channel === "l2Book") {
      const { coin } = data as { coin?: string };
      return coin ? wsChannels.l2Book(coin).key : null;
    }
    if (channel === "candle") {
      const { s: coin, i: interval } = data as { s?: string; i?: CandleInterval };
      return coin && interval ? wsChannels.candle(coin, interval).key : null;
    }
    return channel;
  }
}

let instance: HyperliquidWs | null = null;

export function getWs(): HyperliquidWs {
  if (!instance) instance = new HyperliquidWs();
  return instance;
}
