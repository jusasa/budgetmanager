import express from 'express';
import cors from 'cors';
import { localOnlyGuard } from './middleware/localOnly.js';
import fintechRoutes from './routes/fintech.js';
import benchmarkRoutes from './routes/benchmark.js';
import adviceRoutes from './routes/advice.js';
import openbankingRoutes from './routes/openbanking.js';
import authRoutes from './routes/auth.js';

const app = express();
const DEBUG_PORT = process.env.DEBUG_PORT || 4001;
const BIND_HOST = '127.0.0.1'; // 외부 네트워크 인터페이스 차단 (로컬 호스트 바인딩)

app.use(cors());
app.use(express.json());

// 1. 서버 컴퓨터(로컬) 전용 1차 방어 미들웨어
app.use(localOnlyGuard);

// 2. 카오스 테스팅 & 시뮬레이션 상태 관리
let chaosState = {
  simulateHometaxError: false,
  simulateLatencyMs: 0
};

// 3. 지연/에러 인젝션 미들웨어
app.use(async (req, res, next) => {
  if (chaosState.simulateLatencyMs > 0 && req.path.startsWith('/api/fintech')) {
    await new Promise((resolve) => setTimeout(resolve, chaosState.simulateLatencyMs));
  }

  if (chaosState.simulateHometaxError && req.path.includes('/sync')) {
    return res.status(500).json({
      success: false,
      error: '[시뮬레이션 모의 오류] 국세청 홈택스 전자세정 인증 서버 응답 지연 (HTTP 500)',
      isSimulatedError: true
    });
  }

  next();
});

// 4. 디버그 전용 엔드포인트
app.get('/api/debug/status', (req, res) => {
  res.json({
    mode: 'DEBUG_SIMULATION',
    host: BIND_HOST,
    port: DEBUG_PORT,
    chaosState,
    remoteIp: req.socket?.remoteAddress,
    accessGranted: true
  });
});

app.post('/api/debug/chaos', (req, res) => {
  const { simulateHometaxError, simulateLatencyMs } = req.body;
  if (typeof simulateHometaxError === 'boolean') {
    chaosState.simulateHometaxError = simulateHometaxError;
  }
  if (typeof simulateLatencyMs === 'number') {
    chaosState.simulateLatencyMs = simulateLatencyMs;
  }
  res.json({
    success: true,
    message: '시뮬레이션 카오스 설정이 업데이트되었습니다.',
    chaosState
  });
});

// 5. 기본 API 엔드포인트 (동일한 기능 제공)
app.use('/api/fintech', fintechRoutes);
app.use('/api/openbanking', openbankingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/benchmark', benchmarkRoutes);
app.use('/api/advice', adviceRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'FinWise DEBUG & SIMULATION Server',
    port: DEBUG_PORT,
    boundTo: BIND_HOST,
    timestamp: new Date().toISOString()
  });
});

// 서버 컴퓨터 127.0.0.1에만 바인딩 (외부 네트워크 패킷은 OS 커널 레벨에서 거부)
app.listen(DEBUG_PORT, BIND_HOST, () => {
  console.log(`=======================================================`);
  console.log(`[DEBUG SERVER] Running EXCLUSIVELY on http://${BIND_HOST}:${DEBUG_PORT}`);
  console.log(`[SECURITY] External IPs are blocked by OS bind & IP guard.`);
  console.log(`=======================================================`);
});
