import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import authRoutes from './routes/auth';
import uploadRoutes from './routes/upload';
import userRoutes from './routes/user';
import logger from './logger';
import { apiLimiter } from './middleware/rateLimiter';
import helmet from 'helmet';
import morgan from 'morgan';
import swagger from './swagger';
import aiRoutes from './routes/ai';
import subscriptionRoutes from './routes/subscription';
import { summary, quiz, listSummaries, deleteSummaryController, importSummary, downloadSummaryPdf } from './controllers/aiController';
import { supabaseAuth } from './middleware/auth';

const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('combined'));

// Rate limiter applied to API
app.use('/api/', apiLimiter);

app.use((req, res, next) => {
  logger.info('Request', { method: req.method, path: req.path });
  next();
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/user', userRoutes);
app.post('/summary', supabaseAuth, summary);
app.post('/quiz', supabaseAuth, quiz);
app.get('/summaries', supabaseAuth, listSummaries);
app.delete('/summary/:id', supabaseAuth, deleteSummaryController);
app.post('/summaries/import', supabaseAuth, importSummary);
app.get('/summary/:id/pdf', supabaseAuth, downloadSummaryPdf);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);

app.use('/api-docs', swagger.swaggerUi.serve, swagger.swaggerUi.setup(swagger.swaggerDocument));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error', { err });
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
