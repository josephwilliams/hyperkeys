import { API_URL, CANDLE_HISTORY_MS, ORDERBOOK_SIG_FIGS } from "./constants";
import type {
  CandleData,
  L2BookSnapshot,
  AllMids,
  MetaAndAssetCtxs,
} from "@/types/api";
import type { CandleInterval } from "@/types/trading";

async function postInfo<T>(body: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Hyperliquid ${body.type} failed: ${res.status}`);
  return res.json() as Promise<T>;
}

/** `dex` is omitted for the default perp dex and set to "xyz" for the builder dex. */
function withDex(body: Record<string, unknown>, dex?: string) {
  return dex ? { ...body, dex } : body;
}

export async function fetchCandles(
  coin: string,
  interval: CandleInterval
): Promise<CandleData[]> {
  const endTime = Date.now();
  return postInfo<CandleData[]>({
    type: "candleSnapshot",
    req: { coin, interval, startTime: endTime - CANDLE_HISTORY_MS, endTime },
  });
}

export async function fetchL2Book(coin: string): Promise<L2BookSnapshot> {
  return postInfo<L2BookSnapshot>({
    type: "l2Book",
    coin,
    nSigFigs: ORDERBOOK_SIG_FIGS,
  });
}

export async function fetchAllMids(dex?: string): Promise<AllMids> {
  return postInfo<AllMids>(withDex({ type: "allMids" }, dex));
}

export async function fetchMetaAndAssetCtxs(
  dex?: string
): Promise<MetaAndAssetCtxs> {
  // The API returns a positional [meta, assetCtxs] pair rather than an object.
  const [meta, assetCtxs] = await postInfo<
    [MetaAndAssetCtxs["meta"], MetaAndAssetCtxs["assetCtxs"]]
  >(withDex({ type: "metaAndAssetCtxs" }, dex));
  return { meta, assetCtxs };
}
