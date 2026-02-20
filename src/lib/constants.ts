import type { Market, CandleInterval } from "@/types/trading";

export const API_URL = "https://api.hyperliquid.xyz/info";
export const WS_URL = "wss://api.hyperliquid.xyz/ws";

export const MARKETS: Market[] = [
  { coin: "BTC", label: "BTC-PERP", szDecimals: 5, pxDecimals: 1 },
  { coin: "ETH", label: "ETH-PERP", szDecimals: 4, pxDecimals: 2 },
  { coin: "PLTR", label: "PLTR-PERP", szDecimals: 0, pxDecimals: 4 },
  { coin: "GOLD", label: "GOLD-PERP", szDecimals: 0, pxDecimals: 2 },
];

export const MARKET_COINS = MARKETS.map((m) => m.coin);

export const CANDLE_INTERVALS: CandleInterval[] = [
  "1m", "3m", "5m", "15m", "30m",
  "1h", "2h", "4h", "8h", "12h",
  "1d", "3d", "1w", "1M",
];

export const DEFAULT_INTERVAL: CandleInterval = "1h";
export const STARTING_BALANCE = 1_000_000;
export const ORDERBOOK_LEVELS = 20;

// Size increments per market (in USD)
export const SIZE_INCREMENTS = [100, 500, 1000, 5000, 10000, 50000, 100000];
export const DEFAULT_SIZE_INCREMENT_INDEX = 2; // $1000
