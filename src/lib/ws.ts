import { WS_URL } from "./constants";

type MessageHandler = (data: unknown) => void;

interface Subscription {
  refCount: number;
  handlers: Set<MessageHandler>;
}

class HyperliquidWs {
  private ws: WebSocket | null = null;
  private subscriptions = new Map<string, Subscription>();
  private reconnectAttempt = 0;
  private maxReconnectDelay = 30_000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) return;
    this.isConnecting = true;

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.isConnecting = false;
      this.reconnectAttempt = 0;
      // Resubscribe all active subscriptions
      for (const key of this.subscriptions.keys()) {
        this.sendSubscribe(key);
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.channel && msg.data) {
          this.routeMessage(msg.channel, msg.data);
        }
      } catch {
        // ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      this.isConnecting = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    const delay = Math.min(
      1000 * Math.pow(2, this.reconnectAttempt),
      this.maxReconnectDelay
    );
    this.reconnectAttempt++;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private routeMessage(channel: string, data: unknown) {
    // Try exact channel match first
    const sub = this.subscriptions.get(channel);
    if (sub) {
      for (const handler of sub.handlers) {
        handler(data);
      }
      return;
    }
    // For channels with sub-keys, try matching with data
    if (channel === "l2Book") {
      const d = data as { coin?: string };
      if (d.coin) {
        const keyed = this.subscriptions.get(`l2Book:${d.coin}`);
        if (keyed) {
          for (const handler of keyed.handlers) handler(data);
        }
      }
    } else if (channel === "candle") {
      const d = data as { s?: string; i?: string };
      if (d.s && d.i) {
        const keyed = this.subscriptions.get(`candle:${d.s}:${d.i}`);
        if (keyed) {
          for (const handler of keyed.handlers) handler(data);
        }
      }
    } else if (channel === "allMids") {
      const keyed = this.subscriptions.get("allMids");
      if (keyed) {
        for (const handler of keyed.handlers) handler(data);
      }
    }
  }

  private sendSubscribe(key: string) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const msg = this.keyToSubscription(key);
    if (msg) {
      this.ws.send(JSON.stringify({ method: "subscribe", subscription: msg }));
    }
  }

  private sendUnsubscribe(key: string) {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    const msg = this.keyToSubscription(key);
    if (msg) {
      this.ws.send(JSON.stringify({ method: "unsubscribe", subscription: msg }));
    }
  }

  private keyToSubscription(key: string): Record<string, string> | null {
    if (key === "allMids") {
      return { type: "allMids" };
    }
    if (key.startsWith("l2Book:")) {
      const coin = key.slice("l2Book:".length);
      return { type: "l2Book", coin };
    }
    if (key.startsWith("candle:")) {
      const parts = key.split(":");
      return { type: "candle", coin: parts[1], interval: parts[2] };
    }
    return null;
  }

  subscribe(key: string, handler: MessageHandler) {
    let sub = this.subscriptions.get(key);
    if (!sub) {
      sub = { refCount: 0, handlers: new Set() };
      this.subscriptions.set(key, sub);
    }
    sub.refCount++;
    sub.handlers.add(handler);

    if (sub.refCount === 1) {
      this.connect();
      this.sendSubscribe(key);
    }
  }

  unsubscribe(key: string, handler: MessageHandler) {
    const sub = this.subscriptions.get(key);
    if (!sub) return;
    sub.refCount--;
    sub.handlers.delete(handler);

    if (sub.refCount <= 0) {
      this.sendUnsubscribe(key);
      this.subscriptions.delete(key);
    }
  }
}

// Singleton
let instance: HyperliquidWs | null = null;

export function getWs(): HyperliquidWs {
  if (!instance) {
    instance = new HyperliquidWs();
  }
  return instance;
}
