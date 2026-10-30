import express, { Application, Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/environment';
import portfolioRoutes from './routes/portfolio.routes';
import { getPortfolioWebApplication } from './controllers/portfolio.web.controller';
import { getInquiriesWebApplication } from './controllers/inquiries.web.controller';
import { PortfolioController } from './controllers/portfolio.controller';

const app: Application = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: config.corsOrigin === '*' ? true : config.corsOrigin,
    credentials: true,
  })
);

// HTTP logger
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets (resume PDF, icons, etc.)
app.use('/public', express.static(path.resolve(process.cwd(), 'public')));
app.use('/assets', express.static(path.resolve(process.cwd(), 'public/assets')));

// Direct Resume Download / View Route
app.get('/resume', PortfolioController.downloadResume);
app.get('/cv', PortfolioController.downloadResume);

// Private Inquiries Dashboard (SQLite DB Inspector)
app.get('/inquiries', getInquiriesWebApplication);
app.get('/admin', getInquiriesWebApplication);

// Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Saurabh Yagyik Portfolio Platform',
  });
});

// Primary Public Portfolio Web Application
app.get('/', getPortfolioWebApplication);
app.get('/portfolio', getPortfolioWebApplication);

// Mount Portfolio REST API
app.use('/api/portfolio', portfolioRoutes);

// Fallback 404
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

export default app;

