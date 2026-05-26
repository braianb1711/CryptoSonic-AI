import { useEffect, useState } from 'react';
import { ASSETS } from '../lib/assets';
import { fetchTicker } from '../lib/api/binance';
import { formatPercent, formatPrice } from '../utils/format';

interface TickerItem {
  symbol: string;
  price: number;
  change: number;
}

export function LiveTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const results = await Promise.all(
          ASSETS.map(async (a) => {
            const t = await fetchTicker(a.pair);
            return { symbol: a.symbol, price: t.price, change: t.changePercent24h };
          })
        );
        setItems(results);
      } catch {
        /* ignore */
      }
    };
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, []);

  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-white/5 bg-surface-800/40 mb-4">
      <div className="flex animate-[scroll_40s_linear_infinite] w-max">
        {doubled.map((item, i) => (
          <div
            key={`${item.symbol}-${i}`}
            className="flex items-center gap-3 px-6 py-2 text-xs font-mono whitespace-nowrap"
          >
            <span className="text-gray-400">{item.symbol}</span>
            <span className="text-white">${formatPrice(item.price)}</span>
            <span className={item.change >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {formatPercent(item.change)}
            </span>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
