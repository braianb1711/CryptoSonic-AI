export type SignalAction = 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';

export type Interval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Asset {
  symbol: string;
  name: string;
  pair: string;
  icon: string;
}

export interface IndicatorSnapshot {
  rsi: number;
  macd: { macd: number; signal: number; histogram: number };
  ema9: number;
  ema21: number;
  ema50: number;
  sma200: number;
  bollinger: { upper: number; middle: number; lower: number; percentB: number };
  stochastic: { k: number; d: number };
  atr: number;
  adx: number;
  obvTrend: 'up' | 'down' | 'flat';
  vwap: number;
}

export interface IndicatorVote {
  name: string;
  score: number;
  weight: number;
  detail: string;
}

export interface TradeSignal {
  action: SignalAction;
  confidence: number;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskReward: number;
  horizon: string;
  summary: string;
  votes: IndicatorVote[];
  compositeScore: number;
  trendStrength: number;
  volatilityRegime: 'low' | 'normal' | 'high';
  optimalWindow: string;
  timestamp: number;
}

export interface MarketTicker {
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}
