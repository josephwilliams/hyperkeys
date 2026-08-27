/** Parses an API price string, returning null for missing or nonsensical values. */
export function parsePrice(raw: string | undefined): number | null {
  if (!raw) return null;
  const price = parseFloat(raw);
  return Number.isFinite(price) && price > 0 ? price : null;
}

export function formatPrice(price: number, decimals: number): string {
  return price.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatSize(size: number, decimals: number): string {
  return size.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatUsd(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Abbreviated USD for figures too large to read in full, e.g. open interest. */
export function formatUsdCompact(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (abs >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return formatUsd(value);
}

export function formatPercent(percent: number, decimals = 2): string {
  return `${percent.toFixed(decimals)}%`;
}

/** Percentage with an explicit "+" on gains, so direction reads at a glance. */
export function formatSignedPercent(percent: number, decimals = 2): string {
  return `${percent >= 0 ? "+" : ""}${formatPercent(percent, decimals)}`;
}

export function formatPnl(pnl: number): string {
  return `${pnl >= 0 ? "+" : ""}${formatUsd(pnl)}`;
}

export function formatPnlPercent(pnl: number, costBasis: number): string {
  if (costBasis === 0) return formatSignedPercent(0);
  return formatSignedPercent((pnl / costBasis) * 100);
}

/** Percentage move from `prev` to `current`; null when either side is unknown. */
export function changePercent(
  current: number | null,
  prev: number | null
): number | null {
  if (current === null || prev === null || prev === 0) return null;
  return ((current - prev) / prev) * 100;
}

export function calcPnlPerUnit(
  side: "long" | "short",
  entryPrice: number,
  markPrice: number
): number {
  return side === "long" ? markPrice - entryPrice : entryPrice - markPrice;
}
