import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchKlines, fetchTicker, subscribeKline, subscribeMiniTicker } from '../lib/api/binance';
import { generateTradeSignal } from '../lib/math/prediction';
import type { Asset, Candle, Interval, MarketTicker, TradeSignal } from '../lib/types';

export function useMarketData(asset: Asset, interval: Interval) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [ticker, setTicker] = useState<MarketTicker | null>(null);
  const [livePrice, setLivePrice] = useState<number | null>(null);
  const [signal, setSignal] = useState<TradeSignal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const candlesRef = useRef<Candle[]>([]);

  const recomputeSignal = useCallback(
    (data: Candle[]) => {
      if (data.length < 50) return;
      setSignal(generateTradeSignal(data, interval));
    },
    [interval]
  );

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [klines, tick] = await Promise.all([
        fetchKlines(asset.pair, interval, 300),
        fetchTicker(asset.pair),
      ]);
      candlesRef.current = klines;
      setCandles(klines);
      setTicker(tick);
      setLivePrice(tick.price);
      recomputeSignal(klines);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, [asset.pair, interval, recomputeSignal]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const unsubKline = subscribeKline(asset.pair, interval, (candle, isClosed) => {
      const prev = candlesRef.current;
      const idx = prev.findIndex((c) => c.time === candle.time);
      let next: Candle[];
      if (idx >= 0) {
        next = [...prev];
        next[idx] = candle;
      } else {
        next = [...prev, candle];
        if (next.length > 300) next = next.slice(-300);
      }
      candlesRef.current = next;
      setCandles(next);
      setLivePrice(candle.close);
      if (isClosed) recomputeSignal(next);
    });

    const unsubPrice = subscribeMiniTicker(asset.pair, setLivePrice);

    return () => {
      unsubKline();
      unsubPrice();
    };
  }, [asset.pair, interval, recomputeSignal]);

  return {
    candles,
    ticker,
    livePrice,
    signal,
    loading,
    error,
    refresh: loadHistory,
  };
}
