import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import publicRoutes from './routes/public.js';
import superAdminRoutes from './routes/superadmin.js';
import { isCloudinaryConfigured } from './config/cloudinary.js';

const app = express();

app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

app.use(
  cors({
    origin(origin, callback) {
      // no Origin header (curl, server-to-server) or no restriction configured
      if (!origin || env.clientUrls.length === 0) return callback(null, true);
      if (env.clientUrls.includes(origin.replace(/\/$/, ''))) return callback(null, true);
      const error = new Error(`CORS blocked for origin ${origin}`);
      error.status = 403;
      return callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

if (!env.isProd) app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.json({ success: true, message: 'Sudhir Mahur portfolio API is running' }));
app.get('/api/health', (req, res) =>
  res.json({ success: true, status: 'ok', cloudinary: isCloudinaryConfigured(), time: new Date().toISOString() })
);

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', publicRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
