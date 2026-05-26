import type { Asset, Interval, MarketTicker } from '../lib/types';
import { formatPercent, formatPrice, formatVolume } from '../utils/format';

interface HeaderProps {
  asset: Asset;
  ticker: MarketTicker | null;
  livePrice: number | null;
  interval: Interval;
  onIntervalChange: (i: Interval) => void;
  onRefresh: () => void;
  loading: boolean;
}

const INTERVALS: Interval[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export function Header({
  asset,
  ticker,
  livePrice,
  interval,
  onIntervalChange,
  onRefresh,
  loading,
}: HeaderProps) {
  const price = livePrice ?? ticker?.price ?? 0;
  const change = ticker?.changePercent24h ?? 0;
  const isUp = change >= 0;

  return (
    <header className="glass card-glow p-4 md:p-5 mb-4">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-cyan/20 to-emerald-500/10 border border-accent-cyan/20 flex items-center justify-center text-2xl">
            {asset.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white">{asset.name}</h1>
              <span className="text-xs font-mono text-gray-500 bg-surface-700 px-2 py-0.5 rounded">
                {asset.pair}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
            <div className="flex items-baseline gap-3 mt-0.5">
              <span className="text-2xl md:text-3xl font-bold font-mono text-white">
                ${formatPrice(price)}
              </span>
              <span
                className={`text-sm font-mono font-medium ${isUp ? 'text-emerald-400' : 'text-red-400'}`}
              >
                {formatPercent(change)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {ticker && (
            <div className="hidden md:flex gap-4 text-xs font-mono text-gray-500 mr-2">
              <span>
                H <span className="text-gray-300">${formatPrice(ticker.high24h)}</span>
              </span>
              <span>
                L <span className="text-gray-300">${formatPrice(ticker.low24h)}</span>
              </span>
              <span>
                Vol <span className="text-gray-300">{formatVolume(ticker.volume24h)}</span>
              </span>
            </div>
          )}

          <div className="flex bg-surface-700/60 rounded-xl p-1 gap-0.5">
            {INTERVALS.map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => onIntervalChange(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  interval === i
                    ? 'bg-accent-cyan/20 text-accent-cyan'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {i}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-surface-700 hover:bg-surface-600 text-sm text-gray-300 transition-colors disabled:opacity-50"
          >
            {loading ? '…' : '↻ Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
}
