import { useState } from 'react';
import { ASSETS } from './lib/assets';
import type { Asset, Interval } from './lib/types';
import { useMarketData } from './hooks/useMarketData';
import { AssetSelector } from './components/AssetSelector';
import { Header } from './components/Header';
import { PriceChart } from './components/PriceChart';
import { SignalPanel } from './components/SignalPanel';
import { IndicatorBreakdown } from './components/IndicatorBreakdown';
import { InvestCTA } from './components/InvestCTA';
import { LiveTicker } from './components/LiveTicker';

export default function App() {
  const [asset, setAsset] = useState<Asset>(ASSETS[0]);
  const [interval, setChartInterval] = useState<Interval>('1h');

  const { candles, ticker, livePrice, signal, loading, error, refresh } = useMarketData(
    asset,
    interval
  );

  return (
    <div className="min-h-screen">
      <nav className="border-b border-white/5 bg-surface-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-cyan to-emerald-500 flex items-center justify-center text-surface-900 font-bold text-sm">
              CP
            </div>
            <div>
              <span className="font-bold text-white">CryptoPulse</span>
              <span className="text-accent-cyan font-bold"> AI</span>
            </div>
          </div>
          <p className="hidden sm:block text-xs text-gray-500">
            Real-time analysis · Ensemble quant model · Not financial advice
          </p>
        </div>
      </nav>

      <LiveTicker />

      <main className="max-w-[1600px] mx-auto px-4 pb-12">
        <div className="mb-4 mt-4">
          <AssetSelector selected={asset} onSelect={setAsset} />
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
            {error} — Check your internet connection. Data is sourced from Binance public API.
          </div>
        )}

        <Header
          asset={asset}
          ticker={ticker}
          livePrice={livePrice}
          interval={interval}
          onIntervalChange={setChartInterval}
          onRefresh={refresh}
          loading={loading}
        />

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
          <div className="xl:col-span-2 glass card-glow p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-300">Live Chart</h2>
              <span className="text-[10px] text-gray-500 font-mono">
                Binance WebSocket · {interval} candles
              </span>
            </div>
            {candles.length > 0 ? (
              <PriceChart candles={candles} signal={signal} livePrice={livePrice} />
            ) : (
              <div className="h-[420px] flex items-center justify-center text-gray-500 animate-pulse">
                Loading chart data…
              </div>
            )}
          </div>

          <div className="space-y-4">
            <SignalPanel signal={signal} loading={loading} symbol={asset.symbol} />
            <IndicatorBreakdown signal={signal} loading={loading} />
          </div>
        </div>

        <InvestCTA signal={signal} symbol={asset.symbol} assetName={asset.name} />

        <section className="mt-8 grid md:grid-cols-3 gap-4">
          <FeatureCard
            title="10+ Technical Indicators"
            desc="RSI, MACD, Bollinger Bands, Stochastic, ADX, VWAP, OBV, EMA stack, Hurst exponent, and linear regression — combined via weighted ensemble."
          />
          <FeatureCard
            title="Real-Time Data"
            desc="Live prices and candlesticks stream directly from Binance. Charts update every tick; signals refresh on each closed candle."
          />
          <FeatureCard
            title="Risk-Managed Targets"
            desc="ATR-based stop loss and profit targets with risk-reward ratios. Volatility regime detection adjusts position sizing guidance."
          />
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="glass card-glow p-5">
      <h3 className="text-sm font-semibold text-accent-cyan mb-2">{title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
    </div>
  );
}
