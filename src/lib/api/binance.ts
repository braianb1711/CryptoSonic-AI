import type { Candle, Interval, MarketTicker } from '../types';

const BASE = 'https://api.binance.com/api/v3';
const WS_BASE = 'wss://stream.binance.com:9443/ws';

const INTERVAL_MAP: Record<Interval, string> = {
  '1m': '1m',
  '5m': '5m',
  '15m': '15m',
  '1h': '1h',
  '4h': '4h',
  '1d': '1d',
};

export async function fetchKlines(
  pair: string,
  interval: Interval,
  limit = 300
): Promise<Candle[]> {
  const res = await fetch(
    `${BASE}/klines?symbol=${pair}&interval=${INTERVAL_MAP[interval]}&limit=${limit}`
  );
  if (!res.ok) throw new Error(`Failed to fetch klines: ${res.status}`);
  const data: (string | number)[][] = await res.json();
  return data.map((k) => ({
    time: Math.floor(Number(k[0]) / 1000),
    open: Number(k[1]),
    high: Number(k[2]),
    low: Number(k[3]),
    close: Number(k[4]),
    volume: Number(k[5]),
  }));
}

export async function fetchTicker(pair: string): Promise<MarketTicker> {
  const res = await fetch(`${BASE}/ticker/24hr?symbol=${pair}`);
  if (!res.ok) throw new Error(`Failed to fetch ticker: ${res.status}`);
  const d = await res.json();
  return {
    price: Number(d.lastPrice),
    change24h: Number(d.priceChange),
    changePercent24h: Number(d.priceChangePercent),
    high24h: Number(d.highPrice),
    low24h: Number(d.lowPrice),
    volume24h: Number(d.volume),
  };
}

export function subscribeKline(
  pair: string,
  interval: Interval,
  onCandle: (candle: Candle, isClosed: boolean) => void
): () => void {
  const stream = `${pair.toLowerCase()}@kline_${INTERVAL_MAP[interval]}`;
  const ws = new WebSocket(`${WS_BASE}/${stream}`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data as string);
    const k = msg.k;
    if (!k) return;
    onCandle(
      {
        time: Math.floor(k.t / 1000),
        open: Number(k.o),
        high: Number(k.h),
        low: Number(k.l),
        close: Number(k.c),
        volume: Number(k.v),
      },
      k.x
    );
  };

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}

export function subscribeMiniTicker(
  pair: string,
  onPrice: (price: number) => void
): () => void {
  const stream = `${pair.toLowerCase()}@miniTicker`;
  const ws = new WebSocket(`${WS_BASE}/${stream}`);

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data as string);
    if (msg.c) onPrice(Number(msg.c));
  };

  return () => {
    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close();
    }
  };
}
