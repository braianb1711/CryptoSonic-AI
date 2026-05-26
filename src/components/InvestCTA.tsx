import type { SignalAction, TradeSignal } from '../lib/types';
import { formatPrice } from '../utils/format';

const EXCHANGES = [
  { name: 'Binance', url: 'https://www.binance.com/en/trade/' },
  { name: 'Coinbase', url: 'https://www.coinbase.com/price/' },
  { name: 'Kraken', url: 'https://www.kraken.com/prices/' },
];

interface InvestCTAProps {
  signal: TradeSignal | null;
  symbol: string;
  assetName: string;
}

function actionLabel(action: SignalAction): string {
  if (action.includes('BUY')) return 'Consider buying';
  if (action.includes('SELL')) return 'Consider reducing exposure';
  return 'Wait for clearer signal';
}

export function InvestCTA({ signal, symbol, assetName }: InvestCTAProps) {
  if (!signal) return null;

  const slug = symbol.toLowerCase();

  return (
    <div className="glass card-glow p-6 border border-accent-cyan/10">
      <h3 className="text-lg font-semibold text-white mb-1">Ready to invest?</h3>
      <p className="text-sm text-gray-400 mb-4">
        {actionLabel(signal.action)} {assetName} based on our AI analysis. Use a reputable
        exchange and never invest more than you can afford to lose.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <div className="bg-surface-700/50 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase text-gray-500 mb-1">Suggested entry</p>
          <p className="font-mono font-bold text-accent-cyan">${formatPrice(signal.entryPrice)}</p>
        </div>
        <div className="bg-surface-700/50 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase text-gray-500 mb-1">Profit target</p>
          <p className="font-mono font-bold text-emerald-400">${formatPrice(signal.targetPrice)}</p>
        </div>
        <div className="bg-surface-700/50 rounded-xl p-4 text-center">
          <p className="text-[10px] uppercase text-gray-500 mb-1">Protect at</p>
          <p className="font-mono font-bold text-red-400/90">${formatPrice(signal.stopLoss)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXCHANGES.map((ex) => (
          <a
            key={ex.name}
            href={`${ex.url}${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-accent-cyan/20 to-emerald-500/10 border border-accent-cyan/25 text-sm font-medium text-accent-cyan hover:from-accent-cyan/30 transition-all"
          >
            Trade on {ex.name} →
          </a>
        ))}
      </div>

      <p className="text-[10px] text-gray-600 mt-4 leading-relaxed">
        ⚠ Not financial advice. CryptoPulse AI provides technical analysis for educational
        purposes only. Past performance does not guarantee future results. Always do your own
        research (DYOR).
      </p>
    </div>
  );
}
