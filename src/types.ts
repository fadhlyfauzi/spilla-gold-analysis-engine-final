export interface TraderLoginRecord {
  id: string;
  identifier: string;
  accountNumber?: string;
  brokerServer?: string;
  loginDate: string;
  loginTime: string;
  status: 'SUCCESS' | 'FAILED';
  selectedMaster: string;
  createdAt: string;
}

export type MarketStatus = 'OPEN' | 'CLOSED' | 'PRE_MARKET';
export type TradingSession = 'ASIAN' | 'LONDON' | 'NEW_YORK' | 'LONDON_NY_OVERLAP' | 'OFF_HOURS';
export type SignalType = 'STRONG_BUY' | 'BUY' | 'WAIT' | 'SELL' | 'STRONG_SELL';
export type ImpactLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type SentimentType = 'BULLISH' | 'BEARISH' | 'NEUTRAL';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ProviderType = 'OFFICIAL_API' | 'RSS_FEED' | 'WEB_SCRAPER' | 'PLACEHOLDER';

export interface ValidationResult {
  synced: boolean;
  status: 'VALID' | 'PRICE_MISMATCH' | 'WAITING_FOR_DATA';
  message: string;
  price?: number;
  chartClose?: number;
  timestamp?: string;
}

export interface ProviderStatus {
  id: string;
  name: string;
  type: ProviderType;
  description: string;
  dataType: string;
  requiresApiKey: boolean;
  hasOfficialApi: boolean;
  refreshInterval: string;
  status: 'ONLINE' | 'WARNING' | 'OFFLINE' | 'UNCONFIGURED';
  message: string;
  lastUpdate: string;
  responseTimeMs: number;
}

export interface MarketPrice {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  high24h: number;
  low24h: number;
  change24h: number;
  change24hPercent: number;
  spread: number;
  timestamp: string;
  status: MarketStatus;
  session: TradingSession;
  dollarIndex: number;
  treasuryYield10Y: number;
}

export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal: SentimentType;
  description: string;
}

export interface SupportResistance {
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
}

export interface TechnicalScore {
  score: number; // 0-100
  status: SentimentType;
  rsi: { value: number; signal: SentimentType };
  macd: { macdLine: number; signalLine: number; histogram: number; signal: SentimentType };
  ema20: number;
  ema50: number;
  ema200: number;
  sma50: number;
  sma200: number;
  atr14: number;
  adx14: number;
  pivotPoints: SupportResistance;
  timeframeAnalysis: {
    M15: SentimentType;
    H1: SentimentType;
    H4: SentimentType;
    D1: SentimentType;
  };
  reasoning: string[];
}

export interface FundamentalIndicator {
  id: string;
  name: string;
  category: string;
  actual: string | number;
  forecast: string | number;
  previous: string | number;
  impact: ImpactLevel;
  weight: number; // 1-10
  bias: SentimentType;
  description: string;
}

export interface FundamentalScore {
  score: number; // 0-100
  status: SentimentType;
  indicators: FundamentalIndicator[];
  reasoning: string[];
}

export interface CotData {
  commercialLongs: number;
  commercialShorts: number;
  nonCommercialLongs: number; // Speculators
  nonCommercialShorts: number;
  netPositionSpeculators: number;
  changeFromLastWeek: number;
  sentiment: SentimentType;
}

export interface EtfFlow {
  date: string;
  gldHoldingsTonnes: number;
  netFlowTonnes: number;
  netFlowUsdMillions: number;
  sentiment: SentimentType;
}

export interface MarketNews {
  id: string;
  source: string;
  title: string;
  summary: string;
  url?: string;
  timestamp: string;
  impact: ImpactLevel;
  sentiment: SentimentType;
  category: 'CENTRAL_BANK' | 'GEOPOLITICAL' | 'GOLD_DEMAND' | 'MACRO' | 'MARKETS';
}

export interface SentimentScore {
  score: number; // 0-100
  status: SentimentType;
  cot: CotData;
  etf: EtfFlow;
  newsSentiment: {
    bullishPercent: number;
    bearishPercent: number;
    neutralPercent: number;
  };
  reasoning: string[];
}

export interface RiskScore {
  score: number; // 0-100
  level: RiskLevel;
  volatility: 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME';
  spreadRisk: 'NORMAL' | 'ELEVATED' | 'WIDE';
  liquidity: 'HIGH' | 'MEDIUM' | 'THIN';
  newsProximityMinutes: number; // Minutes to next high-impact news
  sessionRisk: 'LOW' | 'MEDIUM' | 'HIGH';
  atrPercent: number;
  warnings: string[];
  reasoning: string[];
}

export interface AiConfidence {
  score: number; // 0-100
  level: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  marketNarrative: string;
  keyDrivers: string[];
  bullCase: string;
  baseCase: string;
  bearCase: string;
  reasoning: string;
  modelUsed: string;
  timestamp: string;
}

export interface TradeSetup {
  signal: SignalType;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2: number;
  takeProfit3: number;
  riskRewardRatio: number;
  riskAmountPercent: number;
  suggestedLotSize: number; // Per $10k account
  reasoning: string[];
  strategyType: 'TREND_FOLLOWING' | 'BREAKOUT' | 'COUNTER_TREND' | 'RANGE_BOUND';
}

export interface RecommendationResponse {
  symbol: string;
  currentPrice: number;
  timestamp: string;
  recommendation: SignalType;
  setup: TradeSetup;
  fundamentalScore: FundamentalScore;
  technicalScore: TechnicalScore;
  sentimentScore: SentimentScore;
  riskScore: RiskScore;
  aiConfidence: AiConfidence;
  validation?: ValidationResult;
}

export interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: ImpactLevel;
  actual?: string;
  forecast?: string;
  previous?: string;
  unit?: string;
  date: string;
}

export interface AnalysisHistoryRecord {
  id: string;
  timestamp: string;
  price: number;
  recommendation: SignalType;
  fundamentalScore: number;
  technicalScore: number;
  sentimentScore: number;
  riskScore: number;
  aiConfidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  riskRewardRatio: number;
  status: 'PENDING' | 'HIT_TP1' | 'HIT_TP2' | 'HIT_SL' | 'EXPIRED';
  returnPips?: number;
}

export interface CollectorStatus {
  id: string;
  name: string;
  source: string;
  lastRun: string;
  status: 'HEALTHY' | 'SYNCING' | 'DEGRADED' | 'ERROR';
  latencyMs: number;
  itemCount: number;
  lastError?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  module: string;
  message: string;
  details?: string;
}

export interface EngineSettings {
  fundamentalWeights: Record<string, number>; // Indicator ID -> weight 1 to 10
  technicalWeights: {
    rsi: number;
    macd: number;
    ema: number;
    pivot: number;
    timeframeConfluence: number;
  };
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
  autoSyncIntervalSeconds: number;
  enableAiReasoning: boolean;
}

export type UserRole = 'USER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  accountType?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  adminCount: number;
}

export interface Mt5PayloadIndicators {
  ema_20: number;
  ema_50: number;
  pivot: number;
  r1: number;
  r2: number;
  r3: number;
  s1: number;
  s2: number;
  s3: number;
  volume: number;
}

export interface Mt5Payload {
  symbol: string;
  timeframe: string;
  current_price: number;
  indicators: Mt5PayloadIndicators;
  candles: Array<{
    time: string | number;
    open: number;
    high: number;
    low: number;
    close: number;
    vol?: number;
    volume?: number;
  }>;
}

export interface Mt5AiAnalysisResult {
  fundamental_score: number;
  technical_score: number;
  market_sentiment: number;
  risk_score: number;
  ai_confidence: number;
  trade_quality_score: number;
  signal: 'STRONG BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG SELL';
  execution_plan: {
    entry_price: number;
    stop_loss: number;
    take_profit_1: number;
    risk_reward_ratio: string;
  };
  analysis_summary: string;
}


