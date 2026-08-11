import { Router } from 'express';
import { recommendationEngine } from '../engines/recommendationEngine.js';
import { mt5AiService } from '../services/mt5AiService.js';

export const eaRouter = Router();

/**
 * POST /api/ea/mt5-data
 * Ingest MT5 EA JSON Payload (XAUUSD.cent) and invoke Google AI Studio (Gemini API) Analysis.
 */
eaRouter.post(['/mt5-data', '/payload', '/tick', '/ingest'], async (req, res) => {
  try {
    const payload = req.body || {};
    const result = await mt5AiService.processMt5Payload(payload);

    res.json({
      success: true,
      message: 'MT5 XAUUSD.cent payload successfully processed by Google AI Studio Gemini Engine',
      mt5Data: result.mt5Data,
      analysis: result.analysis,
    });
  } catch (error: any) {
    console.error('[EA Route Error] Failed to process MT5 payload:', error);
    res.status(500).json({
      success: false,
      error: 'MT5_PAYLOAD_PROCESSING_FAILED',
      message: error?.message || 'Failed to process MT5 EA payload',
    });
  }
});

/**
 * GET /api/ea/mt5-data
 * Get latest MT5 payload and Google AI Studio Gemini analysis result.
 */
eaRouter.get('/mt5-data', async (_req, res) => {
  try {
    const mt5Data = mt5AiService.getLatestMt5Data();
    let analysis = mt5AiService.getLatestAnalysis();

    if (!analysis) {
      const processed = await mt5AiService.processMt5Payload(mt5Data);
      analysis = processed.analysis;
    }

    res.json({
      success: true,
      mt5Data,
      analysis,
    });
  } catch (error: any) {
    console.error('[EA Route Error] Failed to retrieve MT5 data:', error);
    res.status(500).json({
      success: false,
      error: 'MT5_DATA_RETRIEVAL_FAILED',
      message: error?.message || 'Failed to retrieve MT5 data',
    });
  }
});

/**
 * GET /api/ea/signal
 * Optimized API Endpoint for MetaTrader 5 (MT5) Expert Advisors (MQL5).
 * Consumes real-time analysis directly from recommendationEngine without data modification.
 */
eaRouter.get('/signal', async (req, res) => {
  try {
    const symbolParam = req.query.symbol as string;
    const recData = await recommendationEngine.generateRecommendation();

    // Preserve query symbol if supplied, default to active engine symbol ("XAUUSD")
    const symbol = symbolParam ? symbolParam.trim() : recData.symbol;

    res.json({
      success: true,
      symbol,
      timestamp: recData.timestamp || new Date().toISOString(),
      signal: recData.recommendation,
      confidence: recData.aiConfidence?.score ?? 0,
      fundamentalScore: recData.fundamentalScore?.score ?? 0,
      technicalScore: recData.technicalScore?.score ?? 0,
      sentimentScore: recData.sentimentScore?.score ?? 0,
      riskScore: recData.riskScore?.score ?? 0,
      currentPrice: recData.currentPrice,
      entryPrice: recData.setup.entryPrice,
      stopLoss: recData.setup.stopLoss,
      takeProfit1: recData.setup.takeProfit1,
      takeProfit2: recData.setup.takeProfit2,
      takeProfit3: recData.setup.takeProfit3,
      riskRewardRatio: recData.setup.riskRewardRatio,
      riskPercent: recData.setup.riskAmountPercent ?? 1.0,
      strategyType: recData.setup.strategyType,
    });
  } catch (error: any) {
    console.error('[EA Route Error] Failed to generate EA signal:', error);
    res.status(500).json({
      success: false,
      error: 'EA_SIGNAL_GENERATION_FAILED',
      message: error?.message || 'Failed to generate recommendation signal for EA',
    });
  }
});

