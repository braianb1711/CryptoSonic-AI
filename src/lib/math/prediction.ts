import type { Candle, IndicatorSnapshot, IndicatorVote, SignalAction, TradeSignal } from '../types';
import { buildIndicatorSnapshot, hurstExponent, regressionSlope } from './indicators';

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function scoreToAction(score: number): SignalAction {
  if (score >= 0.55) return 'STRONG_BUY';
  if (score >= 0.2) return 'BUY';
  if (score <= -0.55) return 'STRONG_SELL';
  if (score <= -0.2) return 'SELL';
  return 'HOLD';
}

function rsiVote(rsi: number): IndicatorVote {
  let score = 0;
  let detail = `RSI at ${rsi.toFixed(1)} — neutral zone`;
  if (rsi < 30) {
    score = 0.9;
    detail = `RSI ${rsi.toFixed(1)} — oversold, mean-reversion buy opportunity`;
  } else if (rsi < 40) {
    score = 0.5;
    detail = `RSI ${rsi.toFixed(1)} — approaching oversold`;
  } else if (rsi > 70) {
    score = -0.9;
    detail = `RSI ${rsi.toFixed(1)} — overbought, caution on new longs`;
  } else if (rsi > 60) {
    score = -0.4;
    detail = `RSI ${rsi.toFixed(1)} — elevated, momentum may exhaust`;
  }
  return { name: 'RSI (14)', score, weight: 1.2, detail };
}

function macdVote(m: IndicatorSnapshot['macd']): IndicatorVote {
  let score = 0;
  let detail = 'MACD flat — no clear momentum';
  if (m.histogram > 0 && m.macd > m.signal) {
    score = 0.85;
    detail = 'MACD bullish crossover with positive histogram';
  } else if (m.histogram > 0) {
    score = 0.4;
    detail = 'MACD histogram positive — building bullish momentum';
  } else if (m.histogram < 0 && m.macd < m.signal) {
    score = -0.85;
    detail = 'MACD bearish crossover with negative histogram';
  } else if (m.histogram < 0) {
    score = -0.4;
    detail = 'MACD histogram negative — bearish pressure';
  }
  return { name: 'MACD (12,26,9)', score, weight: 1.3, detail };
}

function emaVote(price: number, snap: IndicatorSnapshot): IndicatorVote {
  let score = 0;
  const bullishStack = price > snap.ema9 && snap.ema9 > snap.ema21 && snap.ema21 > snap.ema50;
  const bearishStack = price < snap.ema9 && snap.ema9 < snap.ema21 && snap.ema21 < snap.ema50;

  if (bullishStack) {
    score = 0.9;
  } else if (price > snap.ema21 && snap.ema21 > snap.ema50) {
    score = 0.5;
  } else if (bearishStack) {
    score = -0.9;
  } else if (price < snap.ema21 && snap.ema21 < snap.ema50) {
    score = -0.5;
  }

  const detail = bullishStack
    ? 'EMA ribbon bullish — short > mid > long term trend'
    : bearishStack
      ? 'EMA ribbon bearish — downtrend structure'
      : `Price ${price > snap.ema21 ? 'above' : 'below'} EMA-21 — mixed trend`;
  return { name: 'EMA Stack (9/21/50)', score, weight: 1.4, detail };
}

function bollingerVote(bb: IndicatorSnapshot['bollinger']): IndicatorVote {
  let score = 0;
  let detail = `%B at ${(bb.percentB * 100).toFixed(0)}% — mid-band`;
  if (bb.percentB < 0.1) {
    score = 0.8;
    detail = 'Price at lower Bollinger band — statistical overshoot, potential bounce';
  } else if (bb.percentB < 0.25) {
    score = 0.45;
    detail = 'Price in lower Bollinger zone — favorable risk/reward for entries';
  } else if (bb.percentB > 0.9) {
    score = -0.8;
    detail = 'Price at upper Bollinger band — extended, watch for pullback';
  } else if (bb.percentB > 0.75) {
    score = -0.4;
    detail = 'Price in upper Bollinger zone — limited upside near term';
  }
  return { name: 'Bollinger Bands (20,2σ)', score, weight: 1.0, detail };
}

function stochasticVote(stoch: IndicatorSnapshot['stochastic']): IndicatorVote {
  let score = 0;
  let detail = `Stochastic K=${stoch.k.toFixed(0)} D=${stoch.d.toFixed(0)}`;
  if (stoch.k < 20 && stoch.k > stoch.d) {
    score = 0.75;
    detail += ' — oversold with bullish crossover';
  } else if (stoch.k > 80 && stoch.k < stoch.d) {
    score = -0.75;
    detail += ' — overbought with bearish crossover';
  }
  return { name: 'Stochastic (14,3)', score, weight: 0.9, detail };
}

function adxVote(adxVal: number, price: number, ema21: number): IndicatorVote {
  const trending = adxVal > 25;
  const bullish = price > ema21;
  let score = 0;
  let detail = `ADX ${adxVal.toFixed(0)} — ${trending ? 'trending' : 'ranging'} market`;
  if (trending && bullish) {
    score = 0.6;
    detail += ', bullish trend confirmed';
  } else if (trending && !bullish) {
    score = -0.6;
    detail += ', bearish trend confirmed';
  }
  return { name: 'ADX (14)', score, weight: 0.8, detail };
}

function vwapVote(price: number, vwapVal: number): IndicatorVote {
  const diff = ((price - vwapVal) / vwapVal) * 100;
  let score = 0;
  let detail = `Price ${diff >= 0 ? '+' : ''}${diff.toFixed(2)}% vs VWAP`;
  if (diff < -1.5) {
    score = 0.6;
    detail += ' — trading below fair value, institutional buy zone';
  } else if (diff > 1.5) {
    score = -0.5;
    detail += ' — extended above VWAP';
  }
  return { name: 'VWAP (50 bars)', score, weight: 1.0, detail };
}

function obvVote(trend: IndicatorSnapshot['obvTrend']): IndicatorVote {
  const map = { up: 0.5, down: -0.5, flat: 0 } as const;
  return {
    name: 'OBV Flow',
    score: map[trend],
    weight: 0.7,
    detail: `Volume flow ${trend === 'up' ? 'accumulation' : trend === 'down' ? 'distribution' : 'neutral'}`,
  };
}

function hurstVote(closes: number[]): IndicatorVote {
  const H = hurstExponent(closes.slice(-100));
  let score = 0;
  let detail = `Hurst H=${H.toFixed(2)} — random walk`;
  if (H > 0.55) {
    score = 0.4;
    detail = `Hurst H=${H.toFixed(2)} — persistent trend (momentum favorable)`;
  } else if (H < 0.45) {
    score = 0.3;
    detail = `Hurst H=${H.toFixed(2)} — mean-reverting regime (buy dips)`;
  }
  return { name: 'Hurst Exponent', score, weight: 0.6, detail };
}

function regressionVote(closes: number[]): IndicatorVote {
  const slope = regressionSlope(closes, 30);
  const score = clamp(slope * 80, -1, 1);
  return {
    name: 'Linear Regression (30)',
    score,
    weight: 0.9,
    detail: `30-bar slope ${(slope * 100).toFixed(3)}%/bar — ${slope > 0 ? 'uptrend' : slope < 0 ? 'downtrend' : 'flat'}`,
  };
}

/** Bayesian-style ensemble: weighted average of indicator votes */
export function generateTradeSignal(candles: Candle[], interval: string): TradeSignal {
  const snap = buildIndicatorSnapshot(candles);
  const price = candles[candles.length - 1].close;
  const closes = candles.map((c) => c.close);

  const votes: IndicatorVote[] = [
    rsiVote(snap.rsi),
    macdVote(snap.macd),
    emaVote(price, snap),
    bollingerVote(snap.bollinger),
    stochasticVote(snap.stochastic),
    adxVote(snap.adx, price, snap.ema21),
    vwapVote(price, snap.vwap),
    obvVote(snap.obvTrend),
    hurstVote(closes),
    regressionVote(closes),
  ];

  const totalWeight = votes.reduce((s, v) => s + v.weight, 0);
  const compositeScore =
    votes.reduce((s, v) => s + v.score * v.weight, 0) / totalWeight;

  const atrVal = snap.atr || price * 0.02;
  const atrPct = atrVal / price;

  let targetMult = 2.0;
  let stopMult = 1.0;
  if (snap.adx > 30) {
    targetMult = 2.5;
    stopMult = 1.2;
  }

  const isBullish = compositeScore > 0;
  const targetPrice = isBullish
    ? price + atrVal * targetMult
    : price - atrVal * targetMult;
  const stopLoss = isBullish
    ? price - atrVal * stopMult
    : price + atrVal * stopMult;

  const risk = Math.abs(price - stopLoss);
  const reward = Math.abs(targetPrice - price);
  const riskReward = risk > 0 ? reward / risk : 0;

  const confidence = Math.min(
    98,
    Math.round(
      (Math.abs(compositeScore) * 70 +
        Math.min(snap.adx, 50) * 0.4 +
        (votes.filter((v) => Math.sign(v.score) === Math.sign(compositeScore)).length /
          votes.length) *
          20) *
        (1 - Math.min(atrPct * 5, 0.15))
    )
  );

  const volatilityRegime: TradeSignal['volatilityRegime'] =
    atrPct < 0.008 ? 'low' : atrPct > 0.025 ? 'high' : 'normal';

  const action = scoreToAction(compositeScore);

  const horizonMap: Record<string, string> = {
    '1m': '15–60 minutes',
    '5m': '1–4 hours',
    '15m': '4–12 hours',
    '1h': '1–3 days',
    '4h': '3–10 days',
    '1d': '1–4 weeks',
  };

  const optimalWindow =
    compositeScore > 0.3
      ? `Enter on pullbacks to EMA-21 ($${snap.ema21.toLocaleString(undefined, { maximumFractionDigits: 2 })})`
      : compositeScore < -0.3
        ? 'Wait for trend reversal confirmation before entering long'
        : 'Range-bound — scale in at support, take profit at resistance';

  const summaries: Record<SignalAction, string> = {
    STRONG_BUY:
      'Multiple indicators align bullish. Statistical edge favors entering a long position with defined risk.',
    BUY: 'Moderately bullish setup. Consider partial position with tight stop below recent swing low.',
    HOLD: 'Mixed signals — no clear edge. Stay flat or hold existing positions until clarity improves.',
    SELL: 'Bearish pressure building. Avoid new longs; consider reducing exposure.',
    STRONG_SELL:
      'Strong bearish confluence. Protect capital — exit longs or wait for capitulation before re-entry.',
  };

  return {
    action,
    confidence,
    entryPrice: price,
    targetPrice,
    stopLoss,
    riskReward,
    horizon: horizonMap[interval] ?? '1–7 days',
    summary: summaries[action],
    votes,
    compositeScore,
    trendStrength: snap.adx,
    volatilityRegime,
    optimalWindow,
    timestamp: Date.now(),
  };
}
