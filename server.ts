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

  // ============================================================
  // SERVER CONFIGURATION
  // ============================================================

  // Railway menyediakan PORT melalui environment variable.
  // Fallback 3000 digunakan ketika menjalankan aplikasi secara lokal.
  const PORT = Number(process.env.PORT) || 3000;

  // Railway harus dapat mengakses server dari luar container.
  // Jangan gunakan 127.0.0.1 untuk production.
  const HOST = '0.0.0.0';

  // ============================================================
  // MIDDLEWARES
  // ============================================================

  app.use(express.json({ limit: '10mb' }));

  app.use(
    express.urlencoded({
      extended: true,
      limit: '10mb',
    })
  );

  // ============================================================
  // HEALTH CHECK
  // ============================================================

  // Railway menggunakan endpoint ini untuk memastikan
  // aplikasi berhasil berjalan.
  app.use('/api/health', healthRouter);

  // ============================================================
  // AUTHENTICATION & ADMIN
  // ============================================================

  app.use('/api/auth', authRouter);

  app.use('/api/admin', adminRouter);

  // ============================================================
  // COPY TRADE
  // ============================================================

  app.use('/api/copytrade', copytradeRouter);

  // ============================================================
  // CORE API ENDPOINTS
  // ============================================================

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

  // ============================================================
  // ADDITIONAL API ENDPOINTS
  // ============================================================

  app.use('/api/market', marketRouter);

  app.use('/api/ai', aiRouter);

  app.use('/api/collectors', collectorsRouter);

  app.use('/api/settings', settingsRouter);

  app.use('/api/logs', logsRouter);

  // ============================================================
  // FRONTEND
  // ============================================================

  if (process.env.NODE_ENV !== 'production') {
    // Development mode:
    // Jalankan Vite sebagai middleware.
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production mode:
    // Gunakan hasil build Vite dari folder dist.
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    // React SPA fallback.
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // ============================================================
  // START SERVER
  // ============================================================

  app.listen(PORT, HOST, () => {
    console.log(
      `🚀 SPILLA GOLD Analysis Engine running on http://${HOST}:${PORT}`
    );

    console.log(
      `🌐 Environment: ${process.env.NODE_ENV || 'development'}`
    );

    console.log(
      `❤️ Health Check: http://${HOST}:${PORT}/api/health`
    );
  });
}

// ============================================================
// APPLICATION START
// ============================================================

startServer().catch((error) => {
  console.error('❌ Failed to start SPILLA GOLD Analysis Engine:');
  console.error(error);

  process.exit(1);
});