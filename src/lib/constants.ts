import type { Market, CandleInterval } from "@/types/trading";

export const API_URL = "https://api.hyperliquid.xyz/info";
export const WS_URL = "wss://api.hyperliquid.xyz/ws";

/**
 * Assets on the `xyz` builder dex are namespaced in every API response
 * ("xyz:GOLD") and need their own allMids / meta queries.
 */
export const XYZ_DEX = "xyz";
export const XYZ_PREFIX = `${XYZ_DEX}:`;

/** "xyz:GOLD" -> "GOLD". Coin ids address the API; symbols are for display. */
export function baseSymbol(coin: string): string {
  return coin.startsWith(XYZ_PREFIX) ? coin.slice(XYZ_PREFIX.length) : coin;
}

export const MARKETS: Market[] = [
  { coin: "BTC", label: "BTC/USD", szDecimals: 5, pxDecimals: 1 },
  { coin: "ETH", label: "ETH/USD", szDecimals: 4, pxDecimals: 2 },
  { coin: "xyz:PLTR", label: "PLTR/USD", szDecimals: 3, pxDecimals: 2 },
  { coin: "xyz:GOLD", label: "GOLD/USD", szDecimals: 4, pxDecimals: 1 },
];

export const MARKETS_MAP: Record<string, Market> = Object.fromEntries(
  MARKETS.map((m) => [m.coin, m])
);

export const CANDLE_INTERVALS: CandleInterval[] = [
  "1m", "3m", "5m", "15m", "30m",
  "1h", "2h", "4h", "8h", "12h",
  "1d", "3d", "1w", "1M",
];

export const DEFAULT_INTERVAL: CandleInterval = "1h";
export const STARTING_BALANCE = 1_000_000;
export const ORDERBOOK_LEVELS = 20;

/** Size increments (USD) cycled with Space. */
export const SIZE_INCREMENTS = [100, 500, 1000, 5000, 10000, 50000, 100000];
export const DEFAULT_SIZE_INCREMENT_INDEX = 2; // $1000

/** Candle history requested on first load. */
export const CANDLE_HISTORY_MS = 7 * 24 * 60 * 60 * 1000;
/** Price levels are aggregated to this many significant figures. */
export const ORDERBOOK_SIG_FIGS = 5;
/** How often funding / open interest / 24h reference prices are refreshed. */
export const META_REFRESH_MS = 30_000;
/** Flash duration — must match the flash-green/flash-red animations in globals.css. */
export const FLASH_DURATION_MS = 1000;
/** Funding rates are small, so they get more precision than a normal percentage. */
export const FUNDING_DECIMALS = 4;
/** Local-time hours during which the light theme is the default. */
export const LIGHT_THEME_START_HOUR = 7;
export const LIGHT_THEME_END_HOUR = 19;
