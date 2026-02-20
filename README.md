# Hyperkeys

A keyboard-native perpetual futures trading interface built on top of the Hyperliquid API. Real-time market data, an interactive orderbook, candlestick charting, and simulated order execution — all driven primarily by keyboard shortcuts.

## Tech Stack

- **Next.js 16** with the app router and React 19
- **Zustand** for global state (single store for market selection, order params, positions, theme)
- **TanStack React Query** for data fetching with `staleTime: Infinity` — initial loads come from REST, then WebSocket pushes keep everything current
- **Tailwind CSS 4** with CSS custom properties for theming
- **Lightweight Charts** (TradingView) for candlestick rendering

## Real-Time Data

All market data flows through the Hyperliquid WebSocket (`wss://api.hyperliquid.xyz/ws`):

- **Mid prices** — streamed for both the default and xyz builder DEX, merged into a single object
- **L2 orderbook** — 20-level depth, updates on every tick
- **Candles** — live candle updates across 14 intervals (1m → 1M)

The WebSocket layer is a singleton with automatic reconnection (exponential backoff), reference-counted subscriptions, and channel-based message routing. React Query caches the initial REST snapshot, then `queryClient.setQueryData` patches in WS updates so components stay reactive without polling.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑` / `↓` | Increase / decrease order size |
| `Enter` | Execute order |
| `Space` | Cycle size increment ($100 → $500 → … → $100k) |
| `S` | Toggle long / short |
| `Q` | Toggle denomination (USD / base units) |
| `M` | Cycle market |
| `I` | Cycle candle interval |
| `T` | Toggle theme |

Input elements are excluded so typing in fields doesn't trigger shortcuts.

## Markets

Four markets are supported, spanning both the default DEX and the xyz builder DEX:

- BTC/USD, ETH/USD (default DEX)
- PLTR/USD, GOLD/USD (xyz DEX — prefixed with `xyz:`)

Each market has per-asset precision settings for price and size display.

## Order Execution

Orders run against a simulated $1M balance with full position management:

- **Open** a new position (long or short)
- **Increase** an existing same-side position (weighted average entry)
- **Reduce** a position partially (realize PnL on the closed portion)
- **Flip** a position if the opposite-side order exceeds current size

PnL is calculated from live mid prices and displayed per-position and in aggregate.

## Theming

Dark and light themes are driven by CSS variables mapped through Tailwind's `@theme` directive. The initial theme is set by time of day (dark outside 7am–7pm) via an inline script that runs before hydration, avoiding any flash. Users can toggle manually with `T`.

## Layout

The UI is a responsive grid:

- **Header** — market selector dropdown, live price with flash animation, 24h change, funding rate, open interest, theme toggle
- **Chart** — responsive candlestick chart that resizes with its container via `ResizeObserver`
- **Orderbook + order entry** — side-by-side on desktop, toggleable on mobile
- **Positions table** — all open positions with unrealized PnL, entry/mark prices, and timestamps
- **Keyboard hints bar** — shortcut reference along the bottom

## Performance

- `CandleChart` is dynamically imported (code-split)
- Orderbook and position rows are memoized with `React.memo`
- A `midsRef` keeps the latest prices available to the order execution path without triggering re-renders
- Container sizing uses `requestAnimationFrame` throttling
- Chart theme changes update colors in place without recreating the chart instance
