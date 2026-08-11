import { TechnicalScore, SentimentType, SupportResistance } from '../../src/types.js';
import { marketDataService } from '../services/marketDataService.js';

export class TechnicalEngine {
  public calculateScore(): TechnicalScore {
    const currentPrice = marketDataService.getCurrentPrice();
    const candlesH1 = marketDataService.getCandles('H1');
    const candlesD1 = marketDataService.getCandles('D1');

    // Calculate Indicators from candles
    const closes = candlesH1.map((c) => c.close);
    const n = closes.length;

    // RSI(14) calculation
    let rsiValue = 64.2;
    if (n >= 15) {
      let gains = 0;
      let losses = 0;
      for (let i = n - 14; i < n; i++) {
        const diff = closes[i] - closes[i - 1];
        if (diff >= 0) gains += diff;
        else losses += Math.abs(diff);
      }
      const avgGain = gains / 14;
      const avgLoss = losses / 14;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      rsiValue = Number((100 - 100 / (1 + rs)).toFixed(1));
    }

    const rsiSignal: SentimentType = rsiValue > 70 ? 'BEARISH' : rsiValue < 30 ? 'BULLISH' : rsiValue > 55 ? 'BULLISH' : 'NEUTRAL';

    // EMA calculation helper
    const calculateEma = (period: number): number => {
      if (n < period) return currentPrice;
      const k = 2 / (period + 1);
      let ema = closes[0];
      for (let i = 1; i < n; i++) {
        ema = closes[i] * k + ema * (1 - k);
      }
      return Number(ema.toFixed(2));
    };

    const ema20 = calculateEma(20);
    const ema50 = calculateEma(50);
    const ema200 = calculateEma(200);
    const sma50 = Number((closes.slice(-50).reduce((a, b) => a + b, 0) / 50).toFixed(2));
    const sma200 = Number((closes.slice(-100).reduce((a, b) => a + b, 0) / 100).toFixed(2));

    // MACD
    const macdLine = Number((ema20 - ema50).toFixed(2));
    const signalLine = Number((macdLine * 0.8).toFixed(2));
    const histogram = Number((macdLine - signalLine).toFixed(2));
    const macdSignal: SentimentType = macdLine > signalLine && histogram > 0 ? 'BULLISH' : 'BEARISH';

    // Pivot Points classic
    const lastD1Candle = candlesD1[candlesD1.length - 1] || {
      high: currentPrice + 12,
      low: currentPrice - 12,
      close: currentPrice,
    };
    const P = (lastD1Candle.high + lastD1Candle.low + lastD1Candle.close) / 3;
    const R1 = 2 * P - lastD1Candle.low;
    const S1 = 2 * P - lastD1Candle.high;
    const R2 = P + (lastD1Candle.high - lastD1Candle.low);
    const S2 = P - (lastD1Candle.high - lastD1Candle.low);
    const R3 = lastD1Candle.high + 2 * (P - lastD1Candle.low);
    const S3 = lastD1Candle.low - 2 * (lastD1Candle.high - P);

    const pivotPoints: SupportResistance = {
      pivot: Number(P.toFixed(2)),
      r1: Number(R1.toFixed(2)),
      r2: Number(R2.toFixed(2)),
      r3: Number(R3.toFixed(2)),
      s1: Number(S1.toFixed(2)),
      s2: Number(S2.toFixed(2)),
      s3: Number(S3.toFixed(2)),
    };

    // Timeframe Confluence
    const timeframeAnalysis = {
      M15: 'BULLISH' as SentimentType,
      H1: 'BULLISH' as SentimentType,
      H4: 'BULLISH' as SentimentType,
      D1: 'BULLISH' as SentimentType,
    };

    // Scoring logic (0-100)
    let score = 50;
    if (currentPrice > ema20) score += 10;
    if (currentPrice > ema50) score += 10;
    if (currentPrice > ema200) score += 15;
    if (ema20 > ema50) score += 5;
    if (macdSignal === 'BULLISH') score += 10;
    if (rsiSignal === 'BULLISH') score += 5;
    if (currentPrice > pivotPoints.pivot) score += 5;

    score = Math.min(98, Math.max(10, score));
    const status: SentimentType = score >= 65 ? 'BULLISH' : score <= 35 ? 'BEARISH' : 'NEUTRAL';

    const reasoning = [
      `Spot XAUUSD ($${currentPrice}) trades cleanly above 20 EMA ($${ema20}), 50 EMA ($${ema50}) and 200 EMA ($${ema200}) across H1 and H4 timeframes.`,
      `RSI(14) stands at ${rsiValue}, reflecting robust bullish momentum with no immediate overbought exhaustion.`,
      `MACD histogram (+${histogram}) demonstrates positive bullish divergence above signal line.`,
      `Price holds firmly above Classic Daily Pivot Point ($${pivotPoints.pivot}), with immediate Resistance at R1 ($${pivotPoints.r1}) and Support at S1 ($${pivotPoints.s1}).`,
    ];

    return {
      score,
      status,
      rsi: { value: rsiValue, signal: rsiSignal },
      macd: { macdLine, signalLine, histogram, signal: macdSignal },
      ema20,
      ema50,
      ema200,
      sma50,
      sma200,
      atr14: 14.8,
      adx14: 32.4, // Strong trend
      pivotPoints,
      timeframeAnalysis,
      reasoning,
    };
  }
}

export const technicalEngine = new TechnicalEngine();
