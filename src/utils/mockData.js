// Default Realistic Korean Financial Mock Data for Instant Preview
export function getDefaultSampleData() {
  const months = [
    { yearMonth: '2025-10', salary: 4200000, taxWithheld: 399000, pension: 189000, healthIns: 148680 },
    { yearMonth: '2025-11', salary: 4200000, taxWithheld: 399000, pension: 189000, healthIns: 148680 },
    { yearMonth: '2025-12', salary: 4200000, taxWithheld: 399000, pension: 189000, healthIns: 148680 },
    { yearMonth: '2026-01', salary: 5800000, taxWithheld: 551000, pension: 189000, healthIns: 205320 }, // 설 상여 포함
    { yearMonth: '2026-02', salary: 4200000, taxWithheld: 399000, pension: 189000, healthIns: 148680 },
    { yearMonth: '2026-03', salary: 4200000, taxWithheld: 399000, pension: 189000, healthIns: 148680 },
    { yearMonth: '2026-04', salary: 4200000, taxWithheld: 399000, pension: 189000, healthIns: 148680 },
    { yearMonth: '2026-05', salary: 4200000, taxWithheld: 399000, pension: 189000, healthIns: 148680 },
    { yearMonth: '2026-06', salary: 4200000, taxWithheld: 399000, pension: 189000, healthIns: 148680 },
    { yearMonth: '2026-07', salary: 5400000, taxWithheld: 513000, pension: 189000, healthIns: 191160 }, // 여름 성과급 포함
    { yearMonth: '2026-08', salary: 4200000, taxWithheld: 399000, pension: 189000, healthIns: 148680 },
    { yearMonth: '2026-09', salary: 4200000, taxWithheld: 399000, pension: 189000, healthIns: 148680 }
  ];

  const transactions = [];
  let id = 1;

  months.forEach((m) => {
    // 고정비
    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-05`,
      time: '09:00',
      hour: 9,
      dayOfWeek: 1,
      name: '월세 및 관리비',
      category: '주거/통신/공과금',
      amount: 650000,
      paymentMethod: '계좌이체',
      isFixedExpense: true
    });

    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-20`,
      time: '10:15',
      hour: 10,
      dayOfWeek: 3,
      name: 'SKT 통신비 & 인터넷',
      category: '주거/통신/공과금',
      amount: 68000,
      paymentMethod: '카드자동납부',
      isFixedExpense: true
    });

    // 식비
    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-08`,
      time: '12:30',
      hour: 12,
      dayOfWeek: 2,
      name: '이마트 역삼점 장보기',
      category: '식비/카페',
      amount: 88000,
      paymentMethod: '신용카드',
      isFixedExpense: false
    });

    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-14`,
      time: '19:45',
      hour: 19,
      dayOfWeek: 5,
      name: '배달의민족 저녁식사',
      category: '식비/카페',
      amount: 32000,
      paymentMethod: '신용카드',
      isFixedExpense: false
    });

    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-18`,
      time: '13:10',
      hour: 13,
      dayOfWeek: 4,
      name: '스타벅스 아메리카노 & 샌드위치',
      category: '식비/카페',
      amount: 11000,
      paymentMethod: '신용카드',
      isFixedExpense: false
    });

    // 쇼핑
    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-11`,
      time: '21:15',
      hour: 21,
      dayOfWeek: 3,
      name: '쿠팡 로켓배송 생필품',
      category: '쇼핑/생활',
      amount: 47000,
      paymentMethod: '신용카드',
      isFixedExpense: false
    });

    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-22`,
      time: '17:30',
      hour: 17,
      dayOfWeek: 6,
      name: '무신사 의류 구매',
      category: '쇼핑/생활',
      amount: 79000,
      paymentMethod: '신용카드',
      isFixedExpense: false
    });

    // 교통
    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-28`,
      time: '08:30',
      hour: 8,
      dayOfWeek: 2,
      name: '지하철/버스 후불교통',
      category: '교통/차량',
      amount: 72000,
      paymentMethod: '신용카드',
      isFixedExpense: false
    });

    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-15`,
      time: '23:10',
      hour: 23,
      dayOfWeek: 5,
      name: '카카오 T 택시',
      category: '교통/차량',
      amount: 21000,
      paymentMethod: '신용카드',
      isFixedExpense: false
    });

    // 문화 / 여가
    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-16`,
      time: '15:20',
      hour: 15,
      dayOfWeek: 6,
      name: 'CGV 영화관람 및 팝콘',
      category: '문화/여가/취미',
      amount: 28000,
      paymentMethod: '신용카드',
      isFixedExpense: false
    });

    // 의료 / 건강
    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-24`,
      time: '16:00',
      hour: 16,
      dayOfWeek: 4,
      name: '정형외과 도수치료 및 약제비',
      category: '의료/건강',
      amount: 55000,
      paymentMethod: '신용카드',
      isFixedExpense: false
    });

    // 현금 사용 (영수증)
    transactions.push({
      id: `init_tx_${id++}`,
      date: `${m.yearMonth}-19`,
      time: '12:40',
      hour: 12,
      dayOfWeek: 5,
      name: '전통시장 청과물 현금 결제 (영수증)',
      category: '식비/카페',
      amount: 25000,
      paymentMethod: '현금(영수증)',
      isFixedExpense: false
    });
  });

  return {
    meta: {
      dataSource: ['국세청 소득금액증명 (모의)', '오픈뱅킹 금융결제원 연동'],
      period: '2025-10 ~ 2026-09',
      isSample: true
    },
    hometax: {
      annualGrossIncome: 53200000,
      annualTaxWithheld: 5054000,
      taxPayerName: '홍*동 (가명)',
      incomeType: '근로소득',
      verificationCode: 'HTX-2026-9482-991A'
    },
    connectedInstitutions: [
      { id: 'kb_bank', name: 'KB국민은행', type: 'bank', color: '#66594C', bg: '#FFF8E6', category: '입출금/예적금' },
      { id: 'kakao_bank', name: '카카오뱅크', type: 'bank', color: '#3B1E1E', bg: '#FFFDE6', category: '입출금/모임통장' },
      { id: 'shinhan_card', name: '신한카드', type: 'card', color: '#0046FF', bg: '#EBF0FF', category: '신용/체크 승인' },
      { id: 'hometax', name: '국세청 홈택스', type: 'tax', color: '#043873', bg: '#EBF4FE', category: '소득금액증명' }
    ],
    monthlyIncome: months,
    transactions
  };
}
