import { ASSETS } from '../lib/assets';
import type { Asset } from '../lib/types';

interface AssetSelectorProps {
  selected: Asset;
  onSelect: (asset: Asset) => void;
}

export function AssetSelector({ selected, onSelect }: AssetSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {ASSETS.map((asset) => (
        <button
          key={asset.pair}
          type="button"
          onClick={() => onSelect(asset)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all border ${
            selected.pair === asset.pair
              ? 'bg-accent-cyan/15 border-accent-cyan/30 text-accent-cyan'
              : 'bg-surface-800/60 border-white/5 text-gray-400 hover:text-white hover:border-white/10'
          }`}
        >
          <span className="text-lg">{asset.icon}</span>
          <span className="text-sm font-medium">{asset.symbol}</span>
        </button>
      ))}
    </div>
  );
}
