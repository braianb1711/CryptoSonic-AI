import type { SignalAction, TradeSignal } from '../lib/types';
import { formatPrice } from '../utils/format';

const ACTION_STYLES: Record<
  SignalAction,
  { bg: string; border: string; text: string; glow: string }
> = {
  STRONG_BUY: {
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/40',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/20',
  },
  BUY: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/25',
    text: 'text-emerald-300',
    glow: '',
  },
  HOLD: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/25',
    text: 'text-amber-300',
    glow: '',
  },
  SELL: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/25',
    text: 'text-red-300',
    glow: '',
  },
  STRONG_SELL: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/40',
    text: 'text-red-400',
    glow: 'shadow-red-500/20',
  },
};

interface SignalPanelProps {
  signal: TradeSignal | null;
  loading: boolean;
  symbol: string;
}

export function SignalPanel({ signal, loading, symbol }: SignalPanelProps) {
  if (loading || !signal) {
    return (
      <div className="glass card-glow p-6 animate-pulse">
        <div className="h-8 bg-white/5 rounded-lg w-2/3 mb-4" />
        <div className="h-4 bg-white/5 rounded w-full mb-2" />
        <div className="h-4 bg-white/5 rounded w-4/5" />
      </div>
    );
  }

  const style = ACTION_STYLES[signal.action];
  const isBuy = signal.action.includes('BUY');

  return (
    <div className={`glass card-glow p-6 border ${style.border} ${style.glow} shadow-lg`}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">AI Signal</p>
          <h2 className={`text-2xl font-bold ${style.text}`}>
            {signal.action.replace('_', ' ')}
          </h2>
          <p className="text-sm text-gray-400 mt-1">{symbol}/USDT</p>
        </div>
        <div className="text-right">
          <div className="relative w-16 h-16">
            <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                stroke={isBuy ? '#10b981' : signal.action.includes('SELL') ? '#ef4444' : '#f59e0b'}
                strokeWidth="3"
                strokeDasharray={`${signal.confidence} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold font-mono">
              {signal.confidence}%
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">confidence</p>
        </div>
      </div>

      <p className="text-sm text-gray-300 leading-relaxed mb-5">{signal.summary}</p>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <Metric label="Entry" value={`$${formatPrice(signal.entryPrice)}`} />
        <Metric
          label="Target"
          value={`$${formatPrice(signal.targetPrice)}`}
          accent={isBuy ? 'text-emerald-400' : 'text-red-400'}
        />
        <Metric label="Stop Loss" value={`$${formatPrice(signal.stopLoss)}`} accent="text-red-400/80" />
        <Metric label="R:R Ratio" value={`${signal.riskReward.toFixed(2)}:1`} />
      </div>

      <div className="space-y-2 text-xs">
        <Row label="Time horizon" value={signal.horizon} />
        <Row label="Trend strength (ADX)" value={signal.trendStrength.toFixed(0)} />
        <Row label="Volatility" value={signal.volatilityRegime} />
        <Row label="Optimal entry" value={signal.optimalWindow} />
      </div>

      <div className="mt-5 pt-4 border-t border-white/5">
        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-3">
          Ensemble score: {(signal.compositeScore * 100).toFixed(0)} / 100
        </p>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 ${
              signal.compositeScore >= 0 ? 'bg-emerald-500' : 'bg-red-500'
            }`}
            style={{
              width: `${Math.min(100, Math.abs(signal.compositeScore) * 100)}%`,
              marginLeft: signal.compositeScore < 0 ? 'auto' : undefined,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="bg-surface-700/50 rounded-xl p-3">
      <p className="text-[10px] uppercase text-gray-500 mb-0.5">{label}</p>
      <p className={`font-mono font-semibold text-sm ${accent ?? 'text-white'}`}>{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-300 text-right">{value}</span>
    </div>
  );
}
