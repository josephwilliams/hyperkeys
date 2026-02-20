import { API_URL } from "./constants";
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
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export async function fetchCandles(
  coin: string,
  interval: CandleInterval,
  startTime?: number,
  endTime?: number
): Promise<CandleData[]> {
  const now = Date.now();
  return postInfo<CandleData[]>({
    type: "candleSnapshot",
    req: {
      coin,
      interval,
      startTime: startTime ?? now - 7 * 24 * 60 * 60 * 1000,
      endTime: endTime ?? now,
    },
  });
}

export async function fetchL2Book(coin: string): Promise<L2BookSnapshot> {
  return postInfo<L2BookSnapshot>({
    type: "l2Book",
    coin,
    nSigFigs: 5,
  });
}

export async function fetchAllMids(): Promise<AllMids> {
  return postInfo<AllMids>({
    type: "allMids",
  });
}

export async function fetchMetaAndAssetCtxs(): Promise<MetaAndAssetCtxs> {
  const raw = await postInfo<[MetaAndAssetCtxs["meta"], MetaAndAssetCtxs["assetCtxs"]]>({
    type: "metaAndAssetCtxs",
  });
  return { meta: raw[0], assetCtxs: raw[1] };
}
