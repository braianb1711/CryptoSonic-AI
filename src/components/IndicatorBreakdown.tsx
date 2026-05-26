import type { TradeSignal } from '../lib/types';

interface IndicatorBreakdownProps {
  signal: TradeSignal | null;
  loading: boolean;
}

export function IndicatorBreakdown({ signal, loading }: IndicatorBreakdownProps) {
  if (loading || !signal) {
    return (
      <div className="glass card-glow p-5 animate-pulse space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-white/5 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="glass card-glow p-5">
      <h3 className="text-sm font-semibold text-gray-200 mb-1">Quantitative Analysis</h3>
      <p className="text-xs text-gray-500 mb-4">
        Weighted ensemble of {signal.votes.length} indicators — Bayesian-style scoring
      </p>
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {signal.votes.map((vote) => (
          <div
            key={vote.name}
            className="bg-surface-700/40 rounded-xl p-3 border border-white/[0.03]"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-medium text-gray-300">{vote.name}</span>
              <span className="text-[10px] text-gray-500">w={vote.weight}</span>
            </div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden relative">
                <div
                  className={`absolute top-0 h-full rounded-full transition-all ${
                    vote.score >= 0 ? 'bg-emerald-500 left-1/2' : 'bg-red-500 right-1/2'
                  }`}
                  style={{
                    width: `${Math.abs(vote.score) * 50}%`,
                    ...(vote.score < 0 ? { right: '50%', left: 'auto' } : {}),
                  }}
                />
                <div className="absolute left-1/2 top-0 w-px h-full bg-white/20" />
              </div>
              <span
                className={`font-mono text-xs w-10 text-right ${
                  vote.score > 0.2
                    ? 'text-emerald-400'
                    : vote.score < -0.2
                      ? 'text-red-400'
                      : 'text-gray-500'
                }`}
              >
                {vote.score > 0 ? '+' : ''}
                {(vote.score * 100).toFixed(0)}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 leading-snug">{vote.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
