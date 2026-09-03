// Statistics Korea (통계청) Public Data & Benchmark API
import { Router } from 'express';
import { db } from '../db/db.js';

const router = Router();

// 1. 통계청 벤치마크 데이터 조회
router.get('/stats', async (req, res) => {
  try {
    const ageGroup = req.query.ageGroup || '30s';
    const quintile = parseInt(req.query.quintile || '3', 10);

    const benchmark = await db.getBenchmark(ageGroup, quintile);
    const allBenchmarks = await db.getAllBenchmarks();

    res.json({
      success: true,
      source: '통계청 가계동향조사 및 가계금융복지조사 공공 마이크로데이터',
      benchmark,
      allBenchmarks
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. 사용자 익명 통계 기여 API (동의 시)
router.post('/contribute', async (req, res) => {
  try {
    const { ageGroup, incomeBracket, monthlyExpense, savingsRate, topCategory, peakTime, userConsent } = req.body;

    if (!userConsent) {
      return res.status(400).json({ error: '익명 통계 기여 동의가 필요합니다.' });
    }

    const result = await db.addAnonymousStat({
      ageGroup,
      incomeBracket,
      monthlyExpense,
      savingsRate,
      topCategory,
      peakTime
    });

    res.json({
      success: true,
      message: '소중한 통계 데이터가 익명으로 안전하게 기여되었습니다.',
      result
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. 누적 익명 기여 요약
router.get('/community-summary', async (req, res) => {
  try {
    const summary = await db.getAnonymousStatsSummary();
    res.json({ success: true, summary });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
