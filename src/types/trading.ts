export type Side = "long" | "short";
export type Denomination = "BASE" | "USD";

export interface Market {
  coin: string;
  label: string;
  szDecimals: number;
  pxDecimals: number;
}

export interface Position {
  coin: string;
  side: Side;
  size: number; // always positive, in base units
  entryPrice: number;
  costBasis: number; // total USD locked (size * entryPrice)
  timestamp: number; // ms since epoch, set on open/last modification
}

export type CandleInterval =
  | "1m" | "3m" | "5m" | "15m" | "30m"
  | "1h" | "2h" | "4h" | "8h" | "12h"
  | "1d" | "3d" | "1w" | "1M";
