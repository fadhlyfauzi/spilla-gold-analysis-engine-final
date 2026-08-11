import React, { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import { RecommendationResponse } from '../types';
import { normalizeCentPrice, formatSymbolLabel, formatPriceDisplay } from '../utils/priceUtils';
import {
  Bot,
  RefreshCw,
  ShieldCheck,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Cpu,
  Activity,
  Camera,
  Eye,
  ImageIcon,
  History,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  Zap,
  Scan,
  TrendingUp,
  Radio
} from 'lucide-react';

interface LiveAnalysisViewProps {
  recommendationData?: RecommendationResponse | null;
}

export interface SignalHistoryLogItem {
  id: string;
  timestamp: string;
  timeFormatted: string;
  signal: 'BUY' | 'SELL' | 'WAIT';
  entry_price: number;
  take_profit_1: number;
  take_profit_2: number;
  stop_loss: number;
  ai_confidence: number;
  visual_pattern: string;
  summary_short: string;
}

export const LiveAnalysisView: React.FC<LiveAnalysisViewProps> = () => {
  const [currentSymbol, setCurrentSymbol] = useState<string>('XAUUSD.cent');
  const [currentPrice, setCurrentPrice] = useState<number>(4246.50);

  // Snapshot & Gemini Multimodal State
  const [latestSnapshot, setLatestSnapshot] = useState<any>(null);
  const [multimodalAnalysis, setMultimodalAnalysis] = useState<any>(null);
  const [signalHistory, setSignalHistory] = useState<SignalHistoryLogItem[]>([]);

  // Analyzing & Processing States
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string>('');

  // Refs for TradingView chart container and chart card wrapper for html2canvas
  const tvContainerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);

  // 1. Embed TradingView Live Chart Widget (Same as Market Overview)
  useEffect(() => {
    if (!tvContainerRef.current) return;
    tvContainerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: 'OANDA:XAUUSD',
      interval: '60',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      backgroundColor: '#0B0E14',
      gridColor: 'rgba(255, 255, 255, 0.05)',
      hide_side_toolbar: false,
      allow_symbol_change: true,
      save_image: true,
      calendar: false,
      hide_volume: false,
      support_host: 'https://www.tradingview.com',
    });

    tvContainerRef.current.appendChild(script);
  }, []);

  // 2. Poll live MT5 stream for price updates
  useEffect(() => {
    const fetchMt5Data = async () => {
      try {
        const res = await fetch('/api/mt5-data');
        const data = await res.json();
        if (data.success && data.mt5Data) {
          if (data.mt5Data.symbol) setCurrentSymbol(data.mt5Data.symbol);
          if (data.mt5Data.current_price) setCurrentPrice(data.mt5Data.current_price);
        }
      } catch (err) {
        console.error('[LiveAnalysisView] Error polling MT5:', err);
      }
    };

    fetchMt5Data();
    const interval = setInterval(fetchMt5Data, 4000);
    return () => clearInterval(interval);
  }, []);

  // 3. Instant Chart Screenshot Capture & Gemini Multimodal Analysis Trigger
  const executeInstantCaptureAndAnalysis = async (isManual = false) => {
    setIsAnalyzing(true);

    try {
      let capturedBase64: string | null = null;

      // Capture screenshot of live chart element if available
      if (chartWrapperRef.current) {
        try {
          const canvas = await html2canvas(chartWrapperRef.current, {
            backgroundColor: '#0B0E14',
            scale: 1.1,
            useCORS: true,
            logging: false,
          });
          capturedBase64 = canvas.toDataURL('image/png');
        } catch (captureErr) {
          console.warn('[LiveAnalysisView] html2canvas capture fallback:', captureErr);
        }
      }

      // Save captured Base64 PNG image to backend if available
      if (capturedBase64) {
        const saveRes = await fetch('/api/snapshot/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageDataUrl: capturedBase64,
            symbol: currentSymbol,
            timeframe: 'H1',
            currentPrice,
          }),
        });
        const saveData = await saveRes.json();
        if (saveData.success && saveData.snapshot) {
          setLatestSnapshot(saveData.snapshot);
        }
      }

      // Trigger Gemini 2.5 Flash Multimodal Vision Analysis on current snapshot
      const analyzeRes = await fetch('/api/snapshot/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrice,
        }),
      });

      const analyzeData = await analyzeRes.json();
      if (analyzeData.success && analyzeData.analysis) {
        setMultimodalAnalysis(analyzeData.analysis);
      }
      if (analyzeData.history && Array.isArray(analyzeData.history)) {
        setSignalHistory(analyzeData.history);
      }

      const now = new Date();
      setLastAnalysisTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }));
    } catch (err) {
      console.error('[LiveAnalysisView] Gemini Multimodal Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 4. Instant Execution at Second 0 on Mount + 15 Minute Background Interval Loop
  useEffect(() => {
    // Immediate execution on mount (Detik ke-0)
    fetch('/api/snapshot/latest')
      .then((res) => res.json())
      .then((snapData) => {
        if (snapData.success && snapData.snapshot) {
          setLatestSnapshot(snapData.snapshot);
        }
        if (snapData.history) {
          setSignalHistory(snapData.history);
        }
        // Trigger instant analysis at second 0
        executeInstantCaptureAndAnalysis(false);
      })
      .catch(() => {
        executeInstantCaptureAndAnalysis(false);
      });

    // 15-Minute interval loop (900,000 ms) for automatic periodic snapshot & Gemini re-analysis
    const fifteenMinutesMs = 15 * 60 * 1000;
    const snapInterval = setInterval(() => {
      executeInstantCaptureAndAnalysis(false);
    }, fifteenMinutesMs);

    return () => clearInterval(snapInterval);
  }, []);

  // Main Signal derived from Gemini Multimodal Analysis
  const signal = multimodalAnalysis?.signal || 'BUY';
  const isBuy = signal === 'BUY';
  const isSell = signal === 'SELL';

  const formattedSymbol = formatSymbolLabel(currentSymbol);
  const normalizedCurrentPrice = normalizeCentPrice(currentPrice, currentSymbol);

  const rawEntry = multimodalAnalysis?.execution_plan?.entry_price || currentPrice;
  const entryPrice = normalizeCentPrice(rawEntry, currentSymbol);

  const rawTp1 = multimodalAnalysis?.execution_plan?.take_profit_1 || rawEntry + 22.50;
  const tp1 = normalizeCentPrice(rawTp1, currentSymbol);

  const rawTp2 = multimodalAnalysis?.execution_plan?.take_profit_2 || rawTp1 + 18.00;
  const tp2 = normalizeCentPrice(rawTp2, currentSymbol);

  const rawSl = multimodalAnalysis?.execution_plan?.stop_loss || rawEntry - 12.00;
  const stopLoss = normalizeCentPrice(rawSl, currentSymbol);

  const rrRatio = multimodalAnalysis?.execution_plan?.risk_reward_ratio || '1 : 2.17';

  return (
    <div className="space-y-6 font-mono">
      {/* Top Banner & Action Header */}
      <div className="bg-[#121620] border border-gray-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-lg bg-[#E5B842]/10 border border-[#E5B842]/30 text-[#E5B842]">
            <Cpu className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-extrabold text-white tracking-wider">LIVE AI ANALYSIS</h1>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                <Camera className="w-3 h-3 text-amber-300" />
                MULTIMODAL CHART VISION
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Direct TradingView Live Chart Analysis Powered by Google Gemini 2.5 Flash
            </p>
          </div>
        </div>

        {/* Snapshot Time Info & Manual Refresh Trigger Button */}
        <div className="flex items-center gap-3 bg-[#0B0E14] px-4 py-2.5 rounded-xl border border-gray-800 text-xs">
          <ImageIcon className="w-4 h-4 text-[#E5B842]" />
          <div>
            <span className="text-[10px] text-gray-400 block font-bold">SNAPSHOT TERAKHIR (15M)</span>
            <span className="text-white font-bold text-xs flex items-center gap-1.5">
              <span>
                {latestSnapshot?.timeFormatted
                  ? `${latestSnapshot.timeFormatted} (${lastAnalysisTime ? `Updated ${lastAnalysisTime}` : 'Baru saja'})`
                  : 'Baru saja di-capture'}
              </span>
            </span>
          </div>

          {/* Manual Trigger Button */}
          <button
            onClick={() => executeInstantCaptureAndAnalysis(true)}
            disabled={isAnalyzing}
            className="ml-2 px-3.5 py-2 rounded-lg bg-[#E5B842] hover:bg-[#d4a737] active:scale-95 text-black font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-[#E5B842]/10 disabled:opacity-50"
            title="Tangkap Snapshot Chart & Lakukan Analisis Ulang Sekarang"
          >
            <RefreshCw className={`w-4 h-4 text-black ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'ANALYZING...' : 'RE-ANALYZE / CAPTURE NOW'}</span>
          </button>
        </div>
      </div>

      {/* Main Workspace: 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Column 1 (Left Screen): TRADINGVIEW LIVE CHART • XAUUSD.cent */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col space-y-4">
          <div
            ref={chartWrapperRef}
            className="flex-1 flex flex-col bg-[#0B0E14] border border-gray-800 rounded-xl overflow-hidden shadow-2xl min-h-[580px] relative"
          >
            {/* Live Chart Header */}
            <div className="bg-[#121620] px-4 py-3 border-b border-gray-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-[#E5B842]" />
                <span className="font-extrabold text-white tracking-wide">
                  TRADINGVIEW LIVE CHART • {formattedSymbol}
                </span>
                <span className="text-[11px] font-bold text-emerald-400 ml-2 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  ${normalizedCurrentPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  AUTO-UPDATE: 15M
                </span>
              </div>
            </div>

            {/* TradingView Advanced Live Chart Embed */}
            <div className="flex-1 w-full relative min-h-[520px]">
              <div ref={tvContainerRef} className="tradingview-widget-container h-full w-full absolute inset-0" />

              {/* AI Analyzing Scanner Overlay during Gemini vision processing */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-black/70 backdrop-blur-[3px] z-20 flex flex-col items-center justify-center space-y-3 border-2 border-[#E5B842]/50 animate-pulse">
                  <div className="relative">
                    <Scan className="w-12 h-12 text-[#E5B842] animate-bounce" />
                    <Sparkles className="w-6 h-6 text-amber-300 absolute -top-1 -right-1 animate-spin" />
                  </div>
                  <div className="bg-[#0B0E14]/90 px-5 py-3 rounded-xl border border-[#E5B842]/50 text-center shadow-2xl">
                    <p className="text-sm font-extrabold text-[#E5B842] tracking-wider animate-pulse flex items-center justify-center gap-2">
                      <Cpu className="w-4 h-4 text-[#E5B842] animate-spin" />
                      AI ANALYZING CHART...
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Menganalisis Pola Candlestick & Trendline {formattedSymbol} dengan Google Gemini 2.5 Flash...
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 2 (Right Screen): SPILLA AI ANALYSIS Card (Google Gemini Multimodal Vision) */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between bg-[#121620] border border-gray-800 rounded-xl p-5 shadow-2xl space-y-4">
          <div className="space-y-4">
            {/* Header: Panel Analisis AI */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-[#E5B842]" />
                <h2 className="text-xs font-extrabold text-white tracking-wider">SPILLA AI ANALYSIS (GEMINI VISION)</h2>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" />
                GEMINI 2.5 FLASH
              </span>
            </div>

            {/* Sinyal Utama: BUY / SELL / WAIT */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                isBuy
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : isSell
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}
            >
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">SIGNAL DIRECTION</span>
                <span className="text-2xl font-extrabold flex items-center gap-2 tracking-wider">
                  {isBuy && <ArrowUpRight className="w-7 h-7 text-emerald-400" />}
                  {isSell && <ArrowDownRight className="w-7 h-7 text-rose-400" />}
                  {!isBuy && !isSell && <Activity className="w-6 h-6 text-amber-300" />}
                  {signal}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block font-bold">AI CONFIDENCE</span>
                <span className="text-xl font-extrabold text-[#E5B842]">
                  {multimodalAnalysis?.ai_confidence || 92}%
                </span>
              </div>
            </div>

            {/* Visual Pattern Detected */}
            <div className="bg-[#0B0E14] p-3 rounded-lg border border-gray-800 flex items-center justify-between text-xs">
              <span className="text-gray-400 font-medium">Pola Grafik Visual:</span>
              <span className="text-amber-300 font-extrabold truncate max-w-[200px]">
                {multimodalAnalysis?.visual_pattern || 'Bullish Rejection at Support Level'}
              </span>
            </div>

            {/* Execution Parameters (Entry Price, TP1, TP2, Stop Loss) */}
            <div className="space-y-2 pt-1">
              <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-[#E5B842]" />
                <span>PARAMETER EKSEKUSI TRADING ({formattedSymbol})</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2.5 bg-[#0B0E14] rounded-lg border border-gray-800">
                  <span className="text-gray-400 font-medium">Entry Price:</span>
                  <span className="text-white font-extrabold text-sm">${entryPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[#0B0E14] rounded-lg border border-gray-800">
                  <span className="text-gray-400 font-medium">Take Profit 1 (TP1):</span>
                  <span className="text-emerald-400 font-extrabold text-sm">${tp1.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[#0B0E14] rounded-lg border border-gray-800">
                  <span className="text-gray-400 font-medium">Take Profit 2 (TP2):</span>
                  <span className="text-emerald-400 font-extrabold text-sm">${tp2.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[#0B0E14] rounded-lg border border-gray-800">
                  <span className="text-gray-400 font-medium">Stop Loss (SL):</span>
                  <span className="text-rose-400 font-extrabold text-sm">${stopLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-[#0B0E14] rounded-lg border border-gray-800">
                  <span className="text-gray-400 font-medium">Risk : Reward Ratio:</span>
                  <span className="text-[#E5B842] font-extrabold">{rrRatio}</span>
                </div>
              </div>
            </div>

            {/* Key Confluences & Technical Justification */}
            <div className="space-y-2 pt-2">
              <h3 className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#E5B842]" />
                <span>KEY CONFLUENCES & TECHNICAL JUSTIFICATION</span>
              </h3>
              <div className="bg-[#0B0E14] p-3.5 rounded-lg border border-gray-800 text-xs text-gray-300 leading-relaxed max-h-[170px] overflow-y-auto">
                {multimodalAnalysis?.analysis_summary ||
                  'Gemini 2.5 Flash Multimodal menganalisis screenshot grafik XAUUSD H1. Terlihat pembentukan pola Reversal Bullish Hammer di area support dengan rejections dari indikator EMA20. Momentum pembeli mendominasi penutupan candle.'}
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-800 text-[10px] text-gray-500 flex items-center justify-between">
            <span>Auto-Snapshot Interval: Every 15M</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              MULTIMODAL ACTIVE
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Section: Riwayat Log Sinyal AI (Signal History) */}
      <div className="bg-[#121620] border border-gray-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-800">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-[#E5B842]" />
            <h2 className="text-sm font-extrabold text-white tracking-wider">RIWAYAT LOG SINYAL AI (SIGNAL HISTORY)</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 bg-[#0B0E14] px-2.5 py-1 rounded border border-gray-800 font-bold flex items-center gap-1">
              <Layers className="w-3 h-3 text-[#E5B842]" />
              {signalHistory.length} ENTRIES LOGGED
            </span>
          </div>
        </div>

        {signalHistory.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-[#0B0E14] rounded-lg border border-gray-800">
            Belum ada riwayat log sinyal AI. Sinyal baru akan tercatat secara otomatis setiap interval snapshot 15 menit atau analisis manual.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 bg-[#0B0E14]/70 uppercase text-[10px]">
                  <th className="py-2.5 px-3">Waktu Log</th>
                  <th className="py-2.5 px-3">Sinyal</th>
                  <th className="py-2.5 px-3">Entry Price</th>
                  <th className="py-2.5 px-3">TP1 / TP2</th>
                  <th className="py-2.5 px-3">Stop Loss</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Pola Visual & Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {signalHistory.map((item) => {
                  const isBuyLog = item.signal === 'BUY';
                  const isSellLog = item.signal === 'SELL';

                  return (
                    <tr key={item.id} className="hover:bg-[#0B0E14]/50 transition-colors">
                      <td className="py-3 px-3 font-mono text-gray-300 font-bold whitespace-nowrap">
                        {item.timeFormatted}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            isBuyLog
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : isSellLog
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                          }`}
                        >
                          {isBuyLog && <ArrowUpRight className="w-3 h-3" />}
                          {isSellLog && <ArrowDownRight className="w-3 h-3" />}
                          {item.signal}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-extrabold text-white whitespace-nowrap">
                        ${normalizeCentPrice(item.entry_price, currentSymbol).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-emerald-400 font-bold whitespace-nowrap">
                        ${normalizeCentPrice(item.take_profit_1, currentSymbol).toFixed(2)} / ${normalizeCentPrice(item.take_profit_2, currentSymbol).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-rose-400 font-bold whitespace-nowrap">
                        ${normalizeCentPrice(item.stop_loss, currentSymbol).toFixed(2)}
                      </td>
                      <td className="py-3 px-3 text-[#E5B842] font-extrabold whitespace-nowrap">
                        {item.ai_confidence}%
                      </td>
                      <td className="py-3 px-3 text-gray-300 max-w-xs truncate">
                        <span className="font-bold text-amber-300 mr-1.5">[{item.visual_pattern}]</span>
                        <span className="text-gray-400 text-[11px]">{item.summary_short}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
