// KFTC (금융결제원) 오픈뱅킹 오픈플랫폼 v2.0 공식 표준 API 클라이언트
import { Router } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

const KFTC_API_HOST = process.env.OPENBANKING_API_HOST || 'https://testapi.openbanking.or.kr';
const CLIENT_ID = process.env.OPENBANKING_CLIENT_ID || 'test_client_id_kftc_9824';
const CLIENT_SECRET = process.env.OPENBANKING_CLIENT_SECRET || 'test_client_secret_kftc_secret_key';
const REDIRECT_URI = process.env.OPENBANKING_REDIRECT_URI || 'http://localhost:5173/api/openbanking/callback';

// 1. 금융결제원 공식 표준 OAuth 2.0 사용자 인가 URL 생성
router.get('/auth-url', (req, res) => {
  const state = Math.random().toString(36).substring(2, 15);
  // 금융결제원 오픈뱅킹 표준 인가 요청 URL 파라미터 (v2.0)
  const authUrl = `${KFTC_API_HOST}/oauth/2.0/authorize?response_type=code&client_id=${encodeURIComponent(CLIENT_ID)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=login%20inquiry&state=${state}&auth_type=0`;

  res.json({
    success: true,
    authUrl,
    state,
    kftcHost: KFTC_API_HOST,
    scope: 'login inquiry',
    mode: KFTC_API_HOST.includes('testapi') ? 'KFTC_TESTBED' : 'KFTC_PRODUCTION'
  });
});

// 2. 금융결제원 공식 표준 토큰 발급 (POST /oauth/2.0/token)
router.post('/token', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: '인가 코드(code)가 제공되지 않았습니다.' });
  }

  try {
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('client_id', CLIENT_ID);
    params.append('client_secret', CLIENT_SECRET);
    params.append('redirect_uri', REDIRECT_URI);
    params.append('grant_type', 'authorization_code');

    const tokenRes = await fetch(`${KFTC_API_HOST}/oauth/2.0/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
      body: params.toString()
    });

    const tokenData = await tokenRes.json();
    res.json(tokenData);
  } catch (err) {
    console.error('[KFTC Token Error]', err);
    res.status(500).json({ error: '금융결제원 토큰 발급 통신 오류: ' + err.message });
  }
});

// 3. 금융결제원 공식 표준 등록 계좌 목록 조회 (GET /v2.0/account/list)
router.post('/accounts', async (req, res) => {
  const { accessToken, userSeqNo } = req.body;

  try {
    const targetUrl = `${KFTC_API_HOST}/v2.0/account/list?user_seq_no=${encodeURIComponent(userSeqNo || 'U123456789')}&include_cancel_yn=N&sort_order=D`;
    const accRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken || 'test_access_token'}`,
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });

    const data = await accRes.json();
    res.json(data);
  } catch (err) {
    console.error('[KFTC Accounts Error]', err);
    res.status(500).json({ error: '금융결제원 계좌 목록 조회 실패: ' + err.message });
  }
});

// 4. 금융결제원 공식 표준 계좌 거래내역 조회 (GET /v2.0/account/transaction_list/fin_num)
router.post('/transactions', async (req, res) => {
  const { accessToken, fintechUseNum, fromDate, toDate } = req.body;

  const now = new Date();
  const tranDtime = now.toISOString().replace(/[-:T]/g, '').substring(0, 14);

  const queryParams = new URLSearchParams({
    bank_tran_id: `M202600001U${String(Date.now()).substring(4, 13)}`,
    fintech_use_num: fintechUseNum || '199000123456789012345678',
    inquiry_type: 'A',
    inquiry_base: 'D',
    from_date: fromDate || '20251001',
    to_date: toDate || '20260901',
    sort_order: 'D',
    tran_dtime: tranDtime
  });

  try {
    const txRes = await fetch(`${KFTC_API_HOST}/v2.0/account/transaction_list/fin_num?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken || 'test_access_token'}`,
        'Content-Type': 'application/json; charset=UTF-8'
      }
    });

    const data = await txRes.json();
    res.json(data);
  } catch (err) {
    console.error('[KFTC Transaction List Error]', err);
    res.status(500).json({ error: '금융결제원 거래내역 조회 실패: ' + err.message });
  }
});

// 5. 금융결제원 표준 전문 데이터 -> FinWise 내부 거래 모델 정규화 변환기
export function normalizeKftcTransactionList(kftcResList = [], bankName = '오픈뱅킹 계좌') {
  return kftcResList.map((item, idx) => {
    // kftc tran_date: YYYYMMDD -> YYYY-MM-DD
    const rawDate = item.tran_date || '20260815';
    const date = `${rawDate.substring(0, 4)}-${rawDate.substring(4, 6)}-${rawDate.substring(6, 8)}`;
    
    // kftc tran_time: HHMMSS -> HH:MM
    const rawTime = item.tran_time || '123000';
    const time = `${rawTime.substring(0, 2)}:${rawTime.substring(2, 4)}`;
    const hour = parseInt(rawTime.substring(0, 2), 10) || 12;

    const amount = parseInt(item.tran_amt, 10) || 0;
    const printContent = item.print_content || '오픈뱅킹 출금';

    // 가맹점명 기반 스마트 카테고리 추론
    let category = '기타';
    if (/마트|식당|카페|커피|김밥|식품|배달|푸드|스타벅스|이마트/.test(printContent)) category = '식비/카페';
    else if (/월세|관리비|가스|전력|전기|통신|SKT|KT|LGU|넷플릭스/.test(printContent)) category = '주거/통신/공과금';
    else if (/교통|택시|주유|코레일|SRT|티머니|카카오T|지하철/.test(printContent)) category = '교통/차량';
    else if (/쿠팡|네이버|쇼핑|무신사|다이소|백화점|올리브영/.test(printContent)) category = '쇼핑/생활';
    else if (/영화|CGV|메가박스|도서|서점|게임|취미|헬스/.test(printContent)) category = '문화/여가/취미';
    else if (/병원|약국|의원|치과|내과/.test(printContent)) category = '의료/건강';

    return {
      id: `kftc_tx_${Date.now()}_${idx}`,
      date,
      time,
      hour,
      dayOfWeek: new Date(date).getDay() || 1,
      name: printContent,
      category,
      amount,
      institution: bankName,
      paymentMethod: `${bankName} (${item.inout_type || '출금'})`,
      isFixedExpense: /월세|관리비|통신요금/.test(printContent)
    };
  });
}

export default router;
