// Admin & Debug Simulation Verification Router
import { Router } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

// 글로벌 카오스 상태 (서버 메모리 유지)
export const chaosState = {
  simulateHometaxError: false,
  simulateLatencyMs: 0
};

// 1. 관리자 토큰 검증 API (프론트엔드 잠금 해제용)
router.post('/verify-token', (req, res) => {
  const { token } = req.body;
  const adminSecret = process.env.ADMIN_DEBUG_TOKEN || 'admin2026!';

  if (!token || token.trim() !== adminSecret.trim()) {
    return res.status(403).json({
      success: false,
      error: '관리자 인증 토큰이 일치하지 않습니다.'
    });
  }

  res.json({
    success: true,
    message: '관리자 디버그 모드가 정상 승인되었습니다.'
  });
});

// 2. 카오스 상태 업데이트 (관리자 토큰 필요)
router.post('/chaos', (req, res) => {
  const adminSecret = process.env.ADMIN_DEBUG_TOKEN;
  const authHeader = req.headers['x-admin-token'] || req.body.token;

  // 로컬 개발 환경(localhost)이거나 올바른 토큰일 경우 허용
  const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  if (!isLocal && authHeader !== adminSecret) {
    return res.status(403).json({ success: false, error: '관리자 권한이 없습니다.' });
  }

  const { simulateHometaxError, simulateLatencyMs } = req.body;
  if (typeof simulateHometaxError === 'boolean') {
    chaosState.simulateHometaxError = simulateHometaxError;
  }
  if (typeof simulateLatencyMs === 'number') {
    chaosState.simulateLatencyMs = simulateLatencyMs;
  }

  res.json({
    success: true,
    chaosState
  });
});

// 3. 카오스 상태 조회
router.get('/chaos', (req, res) => {
  res.json({
    success: true,
    chaosState
  });
});

export default router;
