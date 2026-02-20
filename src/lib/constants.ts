import type { Market, CandleInterval } from "@/types/trading";

export const API_URL = "https://api.hyperliquid.xyz/info";
export const WS_URL = "wss://api.hyperliquid.xyz/ws";

export const MARKETS: Market[] = [
  { coin: "BTC", label: "BTC/USD", szDecimals: 5, pxDecimals: 1 },
  { coin: "ETH", label: "ETH/USD", szDecimals: 4, pxDecimals: 2 },
  { coin: "xyz:PLTR", label: "PLTR/USD", szDecimals: 3, pxDecimals: 2 },
  { coin: "xyz:GOLD", label: "GOLD/USD", szDecimals: 4, pxDecimals: 1 },
];

// Coins that live on the xyz builder dex (need separate allMids/meta queries)
export const XYZ_DEX = "xyz";

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
