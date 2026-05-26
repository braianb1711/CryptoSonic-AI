import type { Candle } from '../types';

/** Simple Moving Average */
export function sma(values: number[], period: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(NaN);
      continue;
    }
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += values[j];
    out.push(sum / period);
  }
  return out;
}

/** Exponential Moving Average */
export function ema(values: number[], period: number): number[] {
  const out: number[] = [];
  const k = 2 / (period + 1);
  let prev = NaN;
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      out.push(NaN);
      continue;
    }
    if (Number.isNaN(prev)) {
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) sum += values[j];
      prev = sum / period;
    } else {
      prev = values[i] * k + prev * (1 - k);
    }
    out.push(prev);
  }
  return out;
}

/** Relative Strength Index (Wilder smoothing) */
export function rsi(closes: number[], period = 14): number[] {
  const out: number[] = new Array(closes.length).fill(NaN);
  if (closes.length < period + 1) return out;

  let avgGain = 0;
  let avgLoss = 0;
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) avgGain += diff;
    else avgLoss -= diff;
  }
  avgGain /= period;
  avgLoss /= period;

  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

/** MACD line, signal, histogram */
export function macd(
  closes: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const emaFast = ema(closes, fast);
  const emaSlow = ema(closes, slow);
  const macdLine: number[] = closes.map((_, i) =>
    Number.isNaN(emaFast[i]) || Number.isNaN(emaSlow[i]) ? NaN : emaFast[i] - emaSlow[i]
  );
  const signalLine = ema(
    macdLine.map((v) => (Number.isNaN(v) ? 0 : v)),
    signalPeriod
  );
  const histogram = macdLine.map((m, i) =>
    Number.isNaN(m) || Number.isNaN(signalLine[i]) ? NaN : m - signalLine[i]
  );
  return { macd: macdLine, signal: signalLine, histogram };
}

/** Bollinger Bands + %B */
export function bollinger(
  closes: number[],
  period = 20,
  stdDev = 2
): { upper: number[]; middle: number[]; lower: number[]; percentB: number[] } {
  const middle = sma(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];
  const percentB: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1 || Number.isNaN(middle[i])) {
      upper.push(NaN);
      lower.push(NaN);
      percentB.push(NaN);
      continue;
    }
    let sumSq = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const d = closes[j] - middle[i];
      sumSq += d * d;
    }
    const sd = Math.sqrt(sumSq / period);
    upper.push(middle[i] + stdDev * sd);
    lower.push(middle[i] - stdDev * sd);
    const range = upper[i] - lower[i];
    percentB.push(range === 0 ? 0.5 : (closes[i] - lower[i]) / range);
  }
  return { upper, middle, lower, percentB };
}

/** Average True Range */
export function atr(candles: Candle[], period = 14): number[] {
  const tr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      tr.push(candles[i].high - candles[i].low);
    } else {
      const hl = candles[i].high - candles[i].low;
      const hc = Math.abs(candles[i].high - candles[i - 1].close);
      const lc = Math.abs(candles[i].low - candles[i - 1].close);
      tr.push(Math.max(hl, hc, lc));
    }
  }
  const out: number[] = new Array(candles.length).fill(NaN);
  if (tr.length < period) return out;

  let sum = 0;
  for (let i = 0; i < period; i++) sum += tr[i];
  out[period - 1] = sum / period;

  for (let i = period; i < tr.length; i++) {
    out[i] = (out[i - 1]! * (period - 1) + tr[i]) / period;
  }
  return out;
}

/** Stochastic Oscillator %K and %D */
export function stochastic(
  candles: Candle[],
  kPeriod = 14,
  dPeriod = 3
): { k: number[]; d: number[] } {
  const kArr: number[] = new Array(candles.length).fill(NaN);

  for (let i = kPeriod - 1; i < candles.length; i++) {
    let highest = -Infinity;
    let lowest = Infinity;
    for (let j = i - kPeriod + 1; j <= i; j++) {
      highest = Math.max(highest, candles[j].high);
      lowest = Math.min(lowest, candles[j].low);
    }
    const range = highest - lowest;
    kArr[i] = range === 0 ? 50 : ((candles[i].close - lowest) / range) * 100;
  }

  const validK = kArr.map((v) => (Number.isNaN(v) ? 0 : v));
  const dArr = sma(validK, dPeriod);
  return { k: kArr, d: dArr };
}

/** ADX — trend strength */
export function adx(candles: Candle[], period = 14): number[] {
  const len = candles.length;
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const tr: number[] = [];

  for (let i = 0; i < len; i++) {
    if (i === 0) {
      plusDM.push(0);
      minusDM.push(0);
      tr.push(candles[i].high - candles[i].low);
      continue;
    }
    const up = candles[i].high - candles[i - 1].high;
    const down = candles[i - 1].low - candles[i].low;
    plusDM.push(up > down && up > 0 ? up : 0);
    minusDM.push(down > up && down > 0 ? down : 0);
    const hl = candles[i].high - candles[i].low;
    const hc = Math.abs(candles[i].high - candles[i - 1].close);
    const lc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hc, lc));
  }

  const out: number[] = new Array(len).fill(NaN);
  if (len < period * 2) return out;

  let smoothTR = 0;
  let smoothPlus = 0;
  let smoothMinus = 0;
  for (let i = 0; i < period; i++) {
    smoothTR += tr[i];
    smoothPlus += plusDM[i];
    smoothMinus += minusDM[i];
  }

  const dx: number[] = new Array(len).fill(NaN);

  for (let i = period; i < len; i++) {
    if (i > period) {
      smoothTR = smoothTR - smoothTR / period + tr[i];
      smoothPlus = smoothPlus - smoothPlus / period + plusDM[i];
      smoothMinus = smoothMinus - smoothMinus / period + minusDM[i];
    }
    const plusDI = smoothTR === 0 ? 0 : (100 * smoothPlus) / smoothTR;
    const minusDI = smoothTR === 0 ? 0 : (100 * smoothMinus) / smoothTR;
    const sum = plusDI + minusDI;
    dx[i] = sum === 0 ? 0 : (100 * Math.abs(plusDI - minusDI)) / sum;
  }

  let adxVal = 0;
  let count = 0;
  for (let i = period; i < period * 2 && i < len; i++) {
    if (!Number.isNaN(dx[i])) {
      adxVal += dx[i];
      count++;
    }
  }
  if (count === 0) return out;
  adxVal /= count;
  out[period * 2 - 1] = adxVal;

  for (let i = period * 2; i < len; i++) {
    if (!Number.isNaN(dx[i])) {
      adxVal = (adxVal * (period - 1) + dx[i]) / period;
      out[i] = adxVal;
    }
  }
  return out;
}

/** On-Balance Volume trend */
export function obvTrend(candles: Candle[], lookback = 10): 'up' | 'down' | 'flat' {
  const obv: number[] = [0];
  for (let i = 1; i < candles.length; i++) {
    const prev = obv[i - 1];
    if (candles[i].close > candles[i - 1].close) obv.push(prev + candles[i].volume);
    else if (candles[i].close < candles[i - 1].close) obv.push(prev - candles[i].volume);
    else obv.push(prev);
  }
  const n = obv.length;
  if (n < lookback + 1) return 'flat';
  const recent = obv[n - 1] - obv[n - 1 - lookback];
  const threshold = Math.abs(obv[n - 1]) * 0.001;
  if (recent > threshold) return 'up';
  if (recent < -threshold) return 'down';
  return 'flat';
}

/** Volume-weighted average price */
export function vwap(candles: Candle[]): number {
  let cumVol = 0;
  let cumTPV = 0;
  for (const c of candles) {
    const tp = (c.high + c.low + c.close) / 3;
    cumTPV += tp * c.volume;
    cumVol += c.volume;
  }
  return cumVol === 0 ? candles[candles.length - 1]?.close ?? 0 : cumTPV / cumVol;
}

/** Linear regression slope (normalized) for trend */
export function regressionSlope(values: number[], period = 20): number {
  const slice = values.slice(-period);
  const n = slice.length;
  if (n < 2) return 0;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += slice[i];
    sumXY += i * slice[i];
    sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const mean = sumY / n;
  return mean === 0 ? 0 : slope / mean;
}

/** Hurst exponent approximation (mean reversion vs trending) */
export function hurstExponent(values: number[], maxLag = 20): number {
  const n = values.length;
  if (n < maxLag * 2) return 0.5;

  const lags: number[] = [];
  const tau: number[] = [];

  for (let lag = 2; lag <= maxLag; lag++) {
    const diffs: number[] = [];
    for (let i = lag; i < n; i++) {
      diffs.push(values[i] - values[i - lag]);
    }
    if (diffs.length === 0) continue;
    const mean = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    const variance = diffs.reduce((a, d) => a + (d - mean) ** 2, 0) / diffs.length;
    lags.push(Math.log(lag));
    tau.push(Math.log(Math.sqrt(variance) + 1e-10));
  }

  if (lags.length < 2) return 0.5;
  const mLag = lags.reduce((a, b) => a + b, 0) / lags.length;
  const mTau = tau.reduce((a, b) => a + b, 0) / tau.length;
  let num = 0;
  let den = 0;
  for (let i = 0; i < lags.length; i++) {
    num += (lags[i] - mLag) * (tau[i] - mTau);
    den += (lags[i] - mLag) ** 2;
  }
  const H = den === 0 ? 0.5 : num / den;
  return Math.max(0, Math.min(1, H));
}

export function lastValid<T>(arr: T[], fallback: T): T {
  for (let i = arr.length - 1; i >= 0; i--) {
    const v = arr[i];
    if (typeof v === 'number' && Number.isNaN(v)) continue;
    if (v !== undefined && v !== null) return v;
  }
  return fallback;
}

export function buildIndicatorSnapshot(candles: Candle[]) {
  const closes = candles.map((c) => c.close);
  const rsiArr = rsi(closes);
  const macdRes = macd(closes);
  const bb = bollinger(closes);
  const stoch = stochastic(candles);
  const atrArr = atr(candles);
  const adxArr = adx(candles);

  const ema9Arr = ema(closes, 9);
  const ema21Arr = ema(closes, 21);
  const ema50Arr = ema(closes, 50);
  const sma200Arr = sma(closes, 200);

  const i = closes.length - 1;
  return {
    rsi: lastValid(rsiArr, 50),
    macd: {
      macd: lastValid(macdRes.macd, 0),
      signal: lastValid(macdRes.signal, 0),
      histogram: lastValid(macdRes.histogram, 0),
    },
    ema9: lastValid(ema9Arr, closes[i]),
    ema21: lastValid(ema21Arr, closes[i]),
    ema50: lastValid(ema50Arr, closes[i]),
    sma200: lastValid(sma200Arr, closes[i]),
    bollinger: {
      upper: lastValid(bb.upper, closes[i]),
      middle: lastValid(bb.middle, closes[i]),
      lower: lastValid(bb.lower, closes[i]),
      percentB: lastValid(bb.percentB, 0.5),
    },
    stochastic: {
      k: lastValid(stoch.k, 50),
      d: lastValid(stoch.d, 50),
    },
    atr: lastValid(atrArr, 0),
    adx: lastValid(adxArr, 25),
    obvTrend: obvTrend(candles),
    vwap: vwap(candles.slice(-50)),
  };
}
