// Hyperliquid API response types

export interface CandleData {
  t: number; // open time (ms)
  T: number; // close time (ms)
  s: string; // coin symbol
  i: string; // interval
  o: string; // open
  c: string; // close
  h: string; // high
  l: string; // low
  v: string; // volume (base)
  n: number; // number of trades
}

export interface L2BookLevel {
  px: string; // price
  sz: string; // size
  n: number; // number of orders
}

export interface L2BookSnapshot {
  coin: string;
  levels: [L2BookLevel[], L2BookLevel[]]; // [bids, asks]
  time: number;
}

export interface AllMids {
  [coin: string]: string; // coin -> mid price
}

export interface AssetMeta {
  name: string;
  szDecimals: number;
  maxLeverage: number;
  onlyIsolated: boolean;
}

export interface AssetCtx {
  dayNtlVlm: string;
  funding: string;
  impactPxs: [string, string];
  markPx: string;
  midPx: string;
  openInterest: string;
  oraclePx: string;
  premium: string;
  prevDayPx: string;
}

export interface MetaAndAssetCtxs {
  meta: { universe: AssetMeta[] };
  assetCtxs: AssetCtx[];
}

// WebSocket message types
export interface WsAllMidsData {
  mids: AllMids;
}

export interface WsL2BookData {
  coin: string;
  levels: [L2BookLevel[], L2BookLevel[]];
  time: number;
}

export interface WsCandleData {
  t: number;
  T: number;
  s: string;
  i: string;
  o: string;
  c: string;
  h: string;
  l: string;
  v: string;
  n: number;
}
