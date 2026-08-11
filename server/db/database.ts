import {
  AnalysisHistoryRecord,
  CollectorStatus,
  EngineSettings,
  SystemLog,
  FundamentalIndicator,
  TraderLoginRecord
} from '../../src/types.js';

class InMemoryDatabase {
  private history: AnalysisHistoryRecord[] = [];
  private logs: SystemLog[] = [];
  private traderLogins: TraderLoginRecord[] = [];
  private collectorStatuses: Map<string, CollectorStatus> = new Map();
  private settings: EngineSettings = {
    fundamentalWeights: {
      INTEREST_RATE: 10,
      INFLATION_CPI: 9,
      FED_PROBABILITY: 9,
      TREASURY_YIELD_10Y: 8,
      DOLLAR_INDEX: 8,
      NFP_JOBS: 7,
      GDP_GROWTH: 7,
      GOLD_ETF_FLOW: 7,
      MONEY_SUPPLY_M2: 6,
      MANUFACTURING_PMI: 5,
      PPI_INFLATION: 5,
      RETAIL_SALES: 5,
      CONSUMER_CONFIDENCE: 4,
    },
    technicalWeights: {
      rsi: 8,
      macd: 8,
      ema: 9,
      pivot: 7,
      timeframeConfluence: 10,
    },
    riskTolerance: 'MODERATE',
    autoSyncIntervalSeconds: 30,
    enableAiReasoning: true,
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed initial logs
    this.addLog('INFO', 'SYSTEM', 'SPILLA GOLD Analysis Engine initialized.');
    this.addLog('INFO', 'COLLECTOR_MGR', 'Booting modular collectors for ForexFactory, MetaTrader 5 (MT5), FRED, COT, WGC...');

    // Seed collectors status
    const collectorsList = [
      { id: 'forex_factory', name: 'ForexFactory Collector', source: 'ForexFactory API / RSS' },
      { id: 'mt5', name: 'MetaTrader 5 (MT5) Collector', source: 'MT5 Terminal Bridge API' },
      { id: 'investing_com', name: 'Investing.com Collector', source: 'Investing.com Macro' },
      { id: 'fred', name: 'FRED Collector', source: 'St. Louis Fed API' },
      { id: 'trading_economics', name: 'Trading Economics Collector', source: 'Trading Economics' },
      { id: 'reuters', name: 'Reuters News Collector', source: 'Reuters Financial Wire' },
      { id: 'kitco', name: 'Kitco Gold Collector', source: 'Kitco Metals Data' },
      { id: 'world_gold_council', name: 'World Gold Council Collector', source: 'World Gold Council' },
      { id: 'cot_cftc', name: 'COT Report Collector', source: 'CFTC Gold Futures' },
      { id: 'cme_fedwatch', name: 'CME FedWatch Collector', source: 'CME Group Interest Rate Tool' },
      { id: 'ice_dxy', name: 'ICE Dollar Index Collector', source: 'ICE Futures US DXY' },
      { id: 'bls', name: 'BLS Collector', source: 'US Bureau of Labor Statistics' },
      { id: 'bea', name: 'BEA Collector', source: 'US Bureau of Economic Analysis' },
      { id: 'treasury', name: 'US Treasury Collector', source: 'US Dept of Treasury Yields' },
    ];

    const now = new Date().toISOString();
    collectorsList.forEach((col) => {
      this.collectorStatuses.set(col.id, {
        id: col.id,
        name: col.name,
        source: col.source,
        lastRun: now,
        status: 'HEALTHY',
        latencyMs: Math.floor(Math.random() * 80) + 40,
        itemCount: Math.floor(Math.random() * 50) + 120,
      });
    });

    // Seed mock initial history
    const basePrice = 2865.40;
    const pastRecords: AnalysisHistoryRecord[] = [
      {
        id: 'HIST-1001',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        price: 4242.20,
        recommendation: 'STRONG_BUY',
        fundamentalScore: 84,
        technicalScore: 88,
        sentimentScore: 79,
        riskScore: 32,
        aiConfidence: 91,
        entryPrice: 4243.00,
        stopLoss: 4226.00,
        takeProfit1: 4265.00,
        riskRewardRatio: 2.35,
        status: 'HIT_TP1',
        returnPips: 160,
      },
      {
        id: 'HIST-1002',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        price: 4235.10,
        recommendation: 'BUY',
        fundamentalScore: 78,
        technicalScore: 81,
        sentimentScore: 72,
        riskScore: 40,
        aiConfidence: 85,
        entryPrice: 4236.50,
        stopLoss: 4221.00,
        takeProfit1: 4252.00,
        riskRewardRatio: 2.10,
        status: 'HIT_TP2',
        returnPips: 310,
      },
      {
        id: 'HIST-1003',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
        price: 4258.90,
        recommendation: 'WAIT',
        fundamentalScore: 52,
        technicalScore: 49,
        sentimentScore: 55,
        riskScore: 78,
        aiConfidence: 62,
        entryPrice: 4258.90,
        stopLoss: 4275.00,
        takeProfit1: 4240.00,
        riskRewardRatio: 1.80,
        status: 'EXPIRED',
        returnPips: 0,
      },
    ];

    // Seed initial trader logins for demonstration
    this.traderLogins = [
      {
        id: 'TLOG-1001',
        identifier: 'trader1@email.com',
        accountNumber: '88201923',
        brokerServer: 'AIMS-Live',
        loginDate: '11-08-2026',
        loginTime: '20:00:00',
        status: 'SUCCESS',
        selectedMaster: 'SPILLA INFINITY',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: 'TLOG-1002',
        identifier: 'trader2@email.com',
        accountNumber: '88204811',
        brokerServer: 'AIMS-Live',
        loginDate: '11-08-2026',
        loginTime: '20:15:00',
        status: 'SUCCESS',
        selectedMaster: 'SPILLA ELITE',
        createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
      },
    ];

    this.history = pastRecords;
  }

  public getSettings(): EngineSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<EngineSettings>): EngineSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.addLog('INFO', 'SETTINGS', 'Engine parameters updated by user.');
    return this.settings;
  }

  public getHistory(): AnalysisHistoryRecord[] {
    return this.history;
  }

  public addHistoryRecord(record: Omit<AnalysisHistoryRecord, 'id'>): AnalysisHistoryRecord {
    const fullRecord: AnalysisHistoryRecord = {
      ...record,
      id: `HIST-${Date.now().toString().slice(-6)}`,
    };
    this.history.unshift(fullRecord);
    if (this.history.length > 200) {
      this.history.pop();
    }
    return fullRecord;
  }

  public getLogs(): SystemLog[] {
    return this.logs;
  }

  public addLog(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', module: string, message: string, details?: string) {
    const log: SystemLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      level,
      module,
      message,
      details,
    };
    this.logs.unshift(log);
    if (this.logs.length > 300) {
      this.logs.pop();
    }
  }

  public getCollectorStatuses(): CollectorStatus[] {
    return Array.from(this.collectorStatuses.values());
  }

  public updateCollectorStatus(id: string, updates: Partial<CollectorStatus>) {
    const existing = this.collectorStatuses.get(id);
    if (existing) {
      this.collectorStatuses.set(id, { ...existing, ...updates, lastRun: new Date().toISOString() });
    }
  }

  public getTraderLogins(): TraderLoginRecord[] {
    return this.traderLogins;
  }

  public addTraderLogin(record: Omit<TraderLoginRecord, 'id' | 'createdAt' | 'loginDate' | 'loginTime'>): TraderLoginRecord {
    const now = new Date();
    // Format date as DD-MM-YYYY
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const loginDate = `${day}-${month}-${year}`;

    // Format time as HH:MM:SS
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const loginTime = `${hours}:${minutes}:${seconds}`;

    const newRecord: TraderLoginRecord = {
      id: `TLOG-${Date.now()}`,
      identifier: record.identifier.trim(),
      accountNumber: record.accountNumber ? record.accountNumber.trim() : '-',
      brokerServer: record.brokerServer ? record.brokerServer.trim() : 'AIMS-Live',
      loginDate,
      loginTime,
      status: record.status || 'SUCCESS',
      selectedMaster: record.selectedMaster,
      createdAt: now.toISOString(),
    };

    this.traderLogins.unshift(newRecord);
    if (this.traderLogins.length > 500) {
      this.traderLogins.pop();
    }
    return newRecord;
  }
}

export const db = new InMemoryDatabase();
