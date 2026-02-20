"use client";

import { useEffect, useRef } from "react";
import { useContainerSize } from "@/hooks/useContainerSize";
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  type CandlestickData,
  type Time,
  ColorType,
  CrosshairMode,
} from "lightweight-charts";
import { useCandles } from "@/hooks/useCandles";
import { useTradingStore } from "@/stores/tradingStore";
import type { CandleData } from "@/types/api";

function toChartData(candle: CandleData): CandlestickData<Time> {
  return {
    time: (candle.t / 1000) as Time,
    open: parseFloat(candle.o),
    high: parseFloat(candle.h),
    low: parseFloat(candle.l),
    close: parseFloat(candle.c),
  };
}

function getChartColors(theme: "dark" | "light") {
  if (theme === "light") {
    return {
      bg: "#f5f5f8",
      grid: "#eaeaef",
      text: "#555570",
      border: "#d0d0da",
      crosshair: "#2563eb44",
    };
  }
  return {
    bg: "#0a0a0f",
    grid: "#1a1a25",
    text: "#8888a0",
    border: "#2a2a3a",
    crosshair: "#4a8cff44",
  };
}

function CandleChartInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const prevDataLenRef = useRef(0);

  const selectedCoin = useTradingStore((s) => s.selectedCoin);
  const candleInterval = useTradingStore((s) => s.candleInterval);
  const theme = useTradingStore((s) => s.theme);
  const { candles } = useCandles(selectedCoin, candleInterval);
  const { width, height } = useContainerSize(containerRef);

  // Create chart (recreate on market/interval change, NOT theme)
  useEffect(() => {
    if (!containerRef.current) return;
    const colors = getChartColors(theme);

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: colors.bg },
        textColor: colors.text,
        fontFamily: "'SF Mono', 'Cascadia Code', monospace",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: colors.crosshair, width: 1, style: 2 },
        horzLine: { color: colors.crosshair, width: 1, style: 2 },
      },
      rightPriceScale: { borderColor: colors.border },
      timeScale: {
        borderColor: colors.border,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#00c853",
      downColor: "#ff1744",
      borderUpColor: "#00c853",
      borderDownColor: "#ff1744",
      wickUpColor: "#00c853",
      wickDownColor: "#ff1744",
    });

    chartRef.current = chart;
    seriesRef.current = series;
    prevDataLenRef.current = 0;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCoin, candleInterval]);

  // Update chart colors on theme change without recreating
  useEffect(() => {
    if (!chartRef.current) return;
    const colors = getChartColors(theme);
    chartRef.current.applyOptions({
      layout: {
        background: { type: ColorType.Solid, color: colors.bg },
        textColor: colors.text,
      },
      grid: {
        vertLines: { color: colors.grid },
        horzLines: { color: colors.grid },
      },
      crosshair: {
        vertLine: { color: colors.crosshair },
        horzLine: { color: colors.crosshair },
      },
      rightPriceScale: { borderColor: colors.border },
      timeScale: { borderColor: colors.border },
    });
  }, [theme]);

  // Update data
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;

    const chartData = candles.map(toChartData);

    if (prevDataLenRef.current === 0 || candles.length < prevDataLenRef.current) {
      seriesRef.current.setData(chartData);
      chartRef.current?.timeScale().fitContent();
    } else if (candles.length === prevDataLenRef.current) {
      seriesRef.current.update(chartData[chartData.length - 1]);
    } else {
      for (let i = prevDataLenRef.current; i < chartData.length; i++) {
        seriesRef.current.update(chartData[i]);
      }
    }
    prevDataLenRef.current = candles.length;
  }, [candles]);

  return <div ref={containerRef} className="w-full h-full" />;
}

export default CandleChartInner;
