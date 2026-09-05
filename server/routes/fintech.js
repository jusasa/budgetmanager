// FinTech & National Tax Service (국세청) Integration Route with Real Institutions
import { Router } from 'express';
import { chaosState } from './debug.js';

const router = Router();

// 지원 금융기관 마스터 목록 (국내 주요 8대 은행, 7대 카드사, 국세청)
export const INSTITUTIONS = [
  // 공공기관
  { id: 'hometax', name: '국세청 홈택스', type: 'tax', color: '#043873', bg: '#EBF4FE', category: '소득금액증명/연말정산' },

  // 은행
  { id: 'kb_bank', name: 'KB국민은행', type: 'bank', color: '#66594C', bg: '#FFF8E6', category: '입출금/예적금' },
  { id: 'shinhan_bank', name: '신한은행', type: 'bank', color: '#0046FF', bg: '#EBF0FF', category: '입출금/예적금' },
  { id: 'kakao_bank', name: '카카오뱅크', type: 'bank', color: '#3B1E1E', bg: '#FFFDE6', category: '입출금/모임통장' },
  { id: 'toss_bank', name: '토스뱅크', type: 'bank', color: '#0064FF', bg: '#EAF1FF', category: '수시입출금/비상금' },
  { id: 'woori_bank', name: '우리은행', type: 'bank', color: '#0067AC', bg: '#E8F3FA', category: '입출금/청약' },
  { id: 'hana_bank', name: '하나은행', type: 'bank', color: '#008485', bg: '#E6F5F5', category: '입출금/급여계좌' },
  { id: 'nh_bank', name: 'NH농협은행', type: 'bank', color: '#009E38', bg: '#E8F8EE', category: '입출금/예적금' },
  { id: 'ibk_bank', name: 'IBK기업은행', type: 'bank', color: '#004B9B', bg: '#EBF2FA', category: '입출금' },

  // 카드사
  { id: 'shinhan_card', name: '신한카드', type: 'card', color: '#0046FF', bg: '#EBF0FF', category: '신용/체크 승인' },
  { id: 'hyundai_card', name: '현대카드', type: 'card', color: '#1E1E1E', bg: '#F2F2F2', category: '신용카드 승인' },
  { id: 'samsung_card', name: '삼성카드', type: 'card', color: '#0C4DA2', bg: '#EAF1FA', category: '신용카드 승인' },
  { id: 'kb_card', name: 'KB국민카드', type: 'card', color: '#705B48', bg: '#F4F1EE', category: '신용/체크 승인' },
  { id: 'lotte_card', name: '롯데카드', type: 'card', color: '#ED1C24', bg: '#FDE8E9', category: '신용카드 승인' },
  { id: 'hana_card', name: '하나카드', type: 'card', color: '#008485', bg: '#E6F5F5', category: '신용/체크 승인' },
  { id: 'bc_card', name: 'BC카드', type: 'card', color: '#E51937', bg: '#FDE8EB', category: '체크/신용 승인' }
];

// 1. 지원 금융기관 목록 조회 API
router.get('/institutions', (req, res) => {
  res.json({
    success: true,
    count: INSTITUTIONS.length,
    institutions: INSTITUTIONS
  });
});

// 12개월 거래 내역 및 소득 생성 헬퍼
function generateInstitutionalFinancialData(selectedIds = ['hometax', 'kb_bank', 'shinhan_card'], userName = '홍*동') {
  const currentYear = 2026;
  const months = [];
  const transactions = [];

  const hasHometax = selectedIds.includes('hometax');
  const selectedBanks = INSTITUTIONS.filter((inst) => inst.type === 'bank' && selectedIds.includes(inst.id));
  const selectedCards = INSTITUTIONS.filter((inst) => inst.type === 'card' && selectedIds.includes(inst.id));

  const primaryBank = selectedBanks[0]?.name || '주거래은행 (오픈뱅킹)';
  const baseSalary = 4200000;

  // 12개월 소득 생성
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, 8 - i, 1);
    const yearMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthNum = d.getMonth() + 1;

    let monthlyBonus = 0;
    if (monthNum === 1 || monthNum === 7) {
      monthlyBonus = Math.round(baseSalary * 0.4);
    }

    const netSalary = baseSalary + monthlyBonus;
    months.push({
      yearMonth,
      salary: netSalary,
      taxWithheld: Math.round(netSalary * 0.095),
      pension: Math.round(netSalary * 0.045),
      healthIns: Math.round(netSalary * 0.0354)
    });
  }

  // 거래 템플릿
  const categories = [
    { name: '식비/카페', items: ['스타벅스 강남점', '배달의민족', 'GS25 편의점', '이마트 역삼점', '쿠팡프레시', '파리바게뜨', '김밥천국'] },
    { name: '주거/통신/공과금', items: ['월세/관리비 이체', 'SKT 통신요금', '한국전력공사 전기세', '삼천리 도시가스', '넷플릭스 구독'] },
    { name: '교통/차량', items: ['티머니 후불교통', '카카오택시', 'GS칼텍스 주유', 'SRT 열차예매'] },
    { name: '쇼핑/생활', items: ['쿠팡 결제', '네이버페이', '무신사 스토어', '다이소', '올리브영 화장품'] },
    { name: '문화/여가/취미', items: ['CGV 영화관', '밀리의서재', '클라이밍짐 일일권', '교보문고', '스팀 게임구매'] },
    { name: '의료/건강', items: ['연세내과의원', '온누리약국', '치과의원 진료', '필라테스 수강료'] }
  ];

  let txId = 1;
  months.forEach((m) => {
    const [y, mon] = m.yearMonth.split('-').map(Number);
    const monthlyTarget = Math.round(baseSalary * 0.62 + (Math.random() * 300000 - 150000));

    // 고정비 생성 (은행 계좌이체)
    transactions.push({
      id: `inst_tx_${txId++}`,
      date: `${m.yearMonth}-05`,
      time: '09:15',
      hour: 9,
      dayOfWeek: 1,
      name: '월세 및 주거관리비',
      category: '주거/통신/공과금',
      amount: 650000,
      institution: primaryBank,
      institutionId: selectedBanks[0]?.id || 'bank_default',
      paymentMethod: `${primaryBank} 계좌이체`,
      isFixedExpense: true
    });

    transactions.push({
      id: `inst_tx_${txId++}`,
      date: `${m.yearMonth}-20`,
      time: '11:00',
      hour: 11,
      dayOfWeek: 3,
      name: '통신요금 자동이체',
      category: '주거/통신/공과금',
      amount: 68000,
      institution: primaryBank,
      institutionId: selectedBanks[0]?.id || 'bank_default',
      paymentMethod: `${primaryBank} 자동이체`,
      isFixedExpense: true
    });

    let currentExpense = 718000;
    while (currentExpense < monthlyTarget) {
      const day = Math.min(28, Math.max(1, Math.floor(Math.random() * 28) + 1));
      const dateStr = `${m.yearMonth}-${String(day).padStart(2, '0')}`;
      const dObj = new Date(y, mon - 1, day);
      const dayOfWeek = dObj.getDay();

      const randTimeSlot = Math.random();
      let hour = 12;
      if (randTimeSlot < 0.3) hour = Math.floor(Math.random() * 3) + 12;
      else if (randTimeSlot < 0.7) hour = Math.floor(Math.random() * 4) + 18;
      else if (randTimeSlot < 0.9) hour = Math.floor(Math.random() * 4) + 8;
      else hour = Math.floor(Math.random() * 3) + 21;

      const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      const timeStr = `${String(hour).padStart(2, '0')}:${minute}`;

      const catPick = categories[Math.floor(Math.random() * categories.length)];
      const itemPick = catPick.items[Math.floor(Math.random() * catPick.items.length)];

      let amt = 0;
      if (catPick.name === '식비/카페') amt = Math.round((Math.random() * 45000 + 5000) / 1000) * 1000;
      else if (catPick.name === '쇼핑/생활') amt = Math.round((Math.random() * 90000 + 15000) / 1000) * 1000;
      else if (catPick.name === '교통/차량') amt = Math.round((Math.random() * 35000 + 2500) / 500) * 500;
      else amt = Math.round((Math.random() * 60000 + 10000) / 1000) * 1000;

      // 결제 카드/은행 배정
      let assignedCard = selectedCards.length > 0
        ? selectedCards[Math.floor(Math.random() * selectedCards.length)]
        : null;

      const instName = assignedCard ? assignedCard.name : primaryBank;
      const instId = assignedCard ? assignedCard.id : (selectedBanks[0]?.id || 'bank_default');
      const paymentMethod = assignedCard ? `${assignedCard.name} 결제` : `${primaryBank} 체크카드`;

      transactions.push({
        id: `inst_tx_${txId++}`,
        date: dateStr,
        time: timeStr,
        hour,
        dayOfWeek,
        name: itemPick,
        category: catPick.name,
        amount: amt,
        institution: instName,
        institutionId: instId,
        paymentMethod,
        isFixedExpense: false
      });

      currentExpense += amt;
    }
  });

  transactions.sort((a, b) => (a.date > b.date ? -1 : 1));

  // 연결된 기관 메타정보
  const connectedMeta = INSTITUTIONS.filter((i) => selectedIds.includes(i.id)).map((i) => ({
    ...i,
    connectedAt: new Date().toISOString(),
    accountOrCardCount: i.type === 'bank' ? 2 : i.type === 'card' ? 1 : 1
  }));

  return {
    meta: {
      generatedAt: new Date().toISOString(),
      dataSource: connectedMeta.map((i) => i.name),
      period: `${months[0].yearMonth} ~ ${months[months.length - 1].yearMonth}`,
      monthsCount: 12
    },
    connectedInstitutions: connectedMeta,
    hometax: hasHometax ? {
      annualGrossIncome: months.reduce((acc, m) => acc + m.salary, 0),
      annualTaxWithheld: months.reduce((acc, m) => acc + m.taxWithheld, 0),
      taxPayerName: userName || '홍*동',
      incomeType: '근로소득',
      verificationCode: 'HTX-2026-9482-991A'
    } : null,
    monthlyIncome: months,
    transactions
  };
}

// 2. 다중 금융기관 마이데이터/오픈뱅킹 연동 API
router.post('/sync-institutions', async (req, res) => {
  const { selectedInstitutions = [], authMethod = 'kakao', userName = '홍*동' } = req.body;

  // 카오스 지연 시뮬레이션
  if (chaosState.simulateLatencyMs > 0) {
    await new Promise((r) => setTimeout(r, chaosState.simulateLatencyMs));
  }

  // 카오스 국세청 오류 시뮬레이션
  if (chaosState.simulateHometaxError && selectedInstitutions.includes('hometax')) {
    return res.status(500).json({
      error: '[국세청 홈택스 시스템 에러 (500)] 연말정산 간소화 서비스 일시 장애가 발생했습니다. (카오스 엔지니어링 테스트)'
    });
  }

  if (!selectedInstitutions || selectedInstitutions.length === 0) {
    return res.status(400).json({
      error: '연동할 금융기관(은행, 카드사, 국세청 중 1개 이상)을 선택해주세요.'
    });
  }

  const data = generateInstitutionalFinancialData(selectedInstitutions, userName);

  res.json({
    success: true,
    message: `${selectedInstitutions.length}개 금융기관의 최근 12개월 거래 및 소득 데이터 연동이 안전하게 완료되었습니다.`,
    authMethod,
    data
  });
});

// 3. 기존 호환용 단일 동기화 API
router.post('/sync', (req, res) => {
  const { consentHometax, consentFintech, profileType = 'standard' } = req.body;

  const defaultIds = ['hometax', 'kb_bank', 'shinhan_card', 'toss_bank', 'hyundai_card'];
  const data = generateInstitutionalFinancialData(defaultIds, '홍*동');

  res.json({
    success: true,
    message: '국세청 및 금융기관 데이터 연동이 안전하게 완료되었습니다.',
    data
  });
});

export default router;
