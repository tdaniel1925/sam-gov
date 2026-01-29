// =============================================================================
// SAM.GOV OPPORTUNITIES API SERVER
// Following CodeBakers patterns
// =============================================================================

// Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Load .env.local for local development

import express from 'express';
import cors from 'cors';
import searchRoutes from './routes/search';
import savedRoutes from './routes/saved';
import notificationsRoutes from './routes/notifications';
import exportRoutes from './routes/export';
import profileRoutes from './routes/profile';
import opportunitiesRoutes from './routes/opportunities';
import chatbotRoutes from './routes/chatbot';
import documentationRoutes from './routes/documentation';
import authRoutes from './routes/auth';
import subscriptionsRoutes from './routes/subscriptions';
import webhooksRoutes from './routes/webhooks';
import alertsRoutes from './routes/alerts';
import contentBlocksRoutes from './routes/content-blocks';
import savedSearchesRoutes from './routes/saved-searches';
import apiKeysRoutes from './routes/apiKeys';
import { NotificationJob } from './services/notification-job';
import { OpportunityMonitor } from './services/opportunity-monitor';

const app = express();
const PORT = process.env.PORT || 3001;

// CORS Configuration - Support multiple origins including all Vercel deployments
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3002',
  'http://localhost:5173',
  'https://sam-gov-nu.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    // Allow all Vercel deployment URLs (*.vercel.app)
    if (origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }

    // Allow explicitly listed origins
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Webhook endpoint needs raw body for signature verification
app.use('/api/webhooks/stripe', express.raw({ type: 'application/json' }));

// JSON parsing for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/saved', savedRoutes);
app.use('/api/saved-searches', savedSearchesRoutes);
app.use('/api/content-blocks', contentBlocksRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/opportunities', opportunitiesRoutes);
app.use('/api/chat', chatbotRoutes);
app.use('/api/documentation', documentationRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/api-keys', apiKeysRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    code: 'NOT_FOUND',
    path: req.path,
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    message: err.message,
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   SAM.gov Contracting Opportunities API                  ║
║                                                           ║
║   Server running on port: ${PORT}                          ║
║   Environment: ${process.env.NODE_ENV || 'development'}                               ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);

  // Start notification cron jobs
  NotificationJob.start();
  console.log('✓ Notification jobs started');

  // Start opportunity monitoring jobs
  OpportunityMonitor.start();
  console.log('✓ Opportunity monitoring started');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  NotificationJob.stop();
  OpportunityMonitor.stop();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  NotificationJob.stop();
  OpportunityMonitor.stop();
  process.exit(0);
});

export default app;
