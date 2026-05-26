import {
  ColorType,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  createChart,
} from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import type { Candle, TradeSignal } from '../lib/types';

interface PriceChartProps {
  candles: Candle[];
  signal: TradeSignal | null;
  livePrice: number | null;
}

export function PriceChart({ candles, signal, livePrice }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
        fontFamily: '"JetBrains Mono", monospace',
      },
      grid: {
        vertLines: { color: 'rgba(255,255,255,0.03)' },
        horzLines: { color: 'rgba(255,255,255,0.03)' },
      },
      crosshair: { mode: CrosshairMode.Normal },
      rightPriceScale: { borderColor: 'rgba(255,255,255,0.06)' },
      timeScale: {
        borderColor: 'rgba(255,255,255,0.06)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: 420,
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26a69a',
      priceFormat: { type: 'volume' },
      priceScaleId: '',
    });
    chart.priceScale('').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    volumeSeriesRef.current = volumeSeries;

    const resize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || candles.length === 0) return;

    candleSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time as never,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }))
    );

    volumeSeriesRef.current.setData(
      candles.map((c) => ({
        time: c.time as never,
        value: c.volume,
        color: c.close >= c.open ? 'rgba(16,185,129,0.35)' : 'rgba(239,68,68,0.35)',
      }))
    );

    chartRef.current?.timeScale().fitContent();
  }, [candles]);

  useEffect(() => {
    if (!candleSeriesRef.current || !signal) return;

    const markers = [
      {
        time: candles[candles.length - 1]?.time as never,
        position: 'belowBar' as const,
        color:
          signal.action.includes('BUY')
            ? '#10b981'
            : signal.action.includes('SELL')
              ? '#ef4444'
              : '#f59e0b',
        shape: 'arrowUp' as const,
        text: signal.action.replace('_', ' '),
      },
    ];
    candleSeriesRef.current.setMarkers(markers);
  }, [signal, candles]);

  return (
    <div className="relative w-full">
      {livePrice !== null && (
        <div className="absolute top-3 left-3 z-10 font-mono text-xs text-accent-cyan bg-surface-900/80 px-2 py-1 rounded-lg border border-white/5">
          LIVE ${livePrice.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
      )}
      <div ref={containerRef} className="w-full rounded-xl overflow-hidden" />
    </div>
  );
}
