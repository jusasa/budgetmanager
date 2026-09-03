import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

import fintechRoutes from './routes/fintech.js';
import benchmarkRoutes from './routes/benchmark.js';
import adviceRoutes from './routes/advice.js';
import openbankingRoutes from './routes/openbanking.js';
import authRoutes from './routes/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Azure App Service는 process.env.PORT (보통 8080 또는 80)를 자동 주입합니다.
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/fintech', fintechRoutes);
app.use('/api/openbanking', openbankingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/benchmark', benchmarkRoutes);
app.use('/api/advice', adviceRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FinWise Asset Analytics API (Production Cloud)',
    timestamp: new Date().toISOString()
  });
});

// [클라우드 24시간 배포용] Vite 정적 빌드 폴더(dist) 서빙
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA Client Routing 지원 (모든 비-API 경로는 index.html로 포워딩)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Production Server] FinWise running on http://localhost:${PORT}`);
});
