import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Import Routers
import { marketRouter } from './server/routes/marketRoutes.js';
import { fundamentalRouter } from './server/routes/fundamentalRoutes.js';
import { dashboardRouter } from './server/routes/dashboardRoutes.js';
import { newsRouter } from './server/routes/newsRoutes.js';
import { calendarRouter } from './server/routes/calendarRoutes.js';
import { systemRouter } from './server/routes/systemRoutes.js';
import { healthRouter } from './server/routes/healthRoutes.js';
import { eaRouter } from './server/routes/eaRoutes.js';
import { authRouter } from './server/routes/authRoutes.js';
import { adminRouter } from './server/routes/adminRoutes.js';
import { copytradeRouter } from './server/routes/copytradeRoutes.js';
import { snapshotRouter } from './server/routes/snapshotRoutes.js';

import {
  technicalRouter,
  sentimentRouter,
  riskRouter,
  recommendationRouter,
  aiRouter,
  historyRouter,
  collectorsRouter,
  settingsRouter,
  logsRouter,
} from './server/routes/analysisRoutes.js';

async function startServer() {
  const app = express();
  
  // Ambil Port dari .env atau default ke 3000
  const PORT = Number(process.env.PORT) || 3000;
  
  // Konfigurasi Host: Gunakan 127.0.0.1 untuk Lokal
  const HOST = process.env.HOST || '127.0.0.1';

  // Middlewares
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint (Railway requirement)
  app.use('/api/health', healthRouter);

  // Authentication & Admin Management Endpoints
  app.use('/api/auth', authRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/copytrade', copytradeRouter);

  // Core API Endpoints
  app.use('/api/dashboard', dashboardRouter);
  app.use('/api/fundamental', fundamentalRouter);
  app.use('/api/technical', technicalRouter);
  app.use('/api/sentiment', sentimentRouter);
  app.use('/api/risk', riskRouter);
  app.use('/api/recommendation', recommendationRouter);
  app.use('/api/ea', eaRouter);
  app.use('/api/mt5-data', eaRouter);
  app.use('/api/snapshot', snapshotRouter);
  app.use('/api/history', historyRouter);
  app.use('/api/news', newsRouter);
  app.use('/api/calendar', calendarRouter);
  app.use('/api/system', systemRouter);

  // Additional Helper Endpoints
  app.use('/api/market', marketRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/collectors', collectorsRouter);
  app.use('/api/settings', settingsRouter);
  app.use('/api/logs', logsRouter);

  // Vite Middleware for Development / Static serving for Production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Jalankan Server di IP 127.0.0.1
  app.listen(PORT, HOST, () => {
    console.log(`🚀 SPILLA GOLD Analysis Engine running on http://${HOST}:${PORT}`);
  });
}

startServer();