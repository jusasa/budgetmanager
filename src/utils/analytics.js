// Client-Side Preprocessing Engine
// 브라우저 내부 연산으로 지표를 산출하여 서버/AI 토큰 부하를 최소화

export const CATEGORY_COLORS = {
  '식비/카페': '#3b82f6',
  '주거/통신/공과금': '#8b5cf6',
  '쇼핑/생활': '#ec4899',
  '교통/차량': '#f59e0b',
  '문화/여가/취미': '#10b981',
  '의료/건강': '#06b6d4',
  '현금/영수증': '#14b8a6',
  '기타': '#64748b'
};

export function analyzeFinancialDataset(incomeList = [], transactions = []) {
  if (!transactions || transactions.length === 0) {
    return {
      hasData: false,
      monthlyAvgIncome: 0,
      monthlyAvgExpense: 0,
      savingsRate: 0,
      totalNetCashflow: 0,
      monthlyTrends: [],
      categoryBreakdown: [],
      hourlyPattern: [],
      dayOfWeekPattern: [],
      peakWindow: '18-21시',
      weekendRatio: 0,
      fixedExpenseRatio: 0
    };
  }

  // 1. 월별 수입 및 지출 집계
  const monthMap = {};

  // 수입 반영
  incomeList.forEach((inc) => {
    if (!monthMap[inc.yearMonth]) {
      monthMap[inc.yearMonth] = { yearMonth: inc.yearMonth, income: 0, expense: 0 };
    }
    monthMap[inc.yearMonth].income += inc.salary || 0;
  });

  // 지출 반영
  let totalFixed = 0;
  let totalVariable = 0;
  let cashTotal = 0;

  transactions.forEach((tx) => {
    const ym = tx.date ? tx.date.substring(0, 7) : '2026-01';
    if (!monthMap[ym]) {
      monthMap[ym] = { yearMonth: ym, income: 0, expense: 0 };
    }
    monthMap[ym].expense += tx.amount || 0;

    if (tx.isFixedExpense) totalFixed += tx.amount || 0;
    else totalVariable += tx.amount || 0;

    if (tx.paymentMethod && (tx.paymentMethod.includes('현금') || tx.category === '현금/영수증')) {
      cashTotal += tx.amount || 0;
    }
  });

  const monthsSorted = Object.keys(monthMap).sort();
  const monthlyTrends = monthsSorted.map((ym) => {
    const item = monthMap[ym];
    const surplus = item.income - item.expense;
    const rate = item.income > 0 ? ((surplus / item.income) * 100).toFixed(1) : 0;
    return {
      yearMonth: ym,
      displayMonth: `${parseInt(ym.split('-')[1], 10)}월`,
      income: item.income,
      expense: item.expense,
      surplus,
      savingsRate: Number(rate)
    };
  });

  // 12개월 평균 계산
  const numMonths = Math.max(1, monthlyTrends.length);
  const totalIncomeAll = monthlyTrends.reduce((sum, m) => sum + m.income, 0);
  const totalExpenseAll = monthlyTrends.reduce((sum, m) => sum + m.expense, 0);

  const monthlyAvgIncome = Math.round(totalIncomeAll / numMonths);
  const monthlyAvgExpense = Math.round(totalExpenseAll / numMonths);
  const totalNetCashflow = monthlyAvgIncome - monthlyAvgExpense;
  const savingsRate = monthlyAvgIncome > 0 ? Number(((totalNetCashflow / monthlyAvgIncome) * 100).toFixed(1)) : 0;
  const fixedExpenseRatio = totalExpenseAll > 0 ? Math.round((totalFixed / totalExpenseAll) * 100) : 0;

  // 2. 업종/카테고리별 비중 집계
  const catMap = {};
  transactions.forEach((tx) => {
    const cat = tx.category || '기타';
    if (!catMap[cat]) catMap[cat] = { category: cat, totalAmount: 0, count: 0 };
    catMap[cat].totalAmount += tx.amount || 0;
    catMap[cat].count += 1;
  });

  const categoryBreakdown = Object.values(catMap)
    .map((c) => ({
      ...c,
      percent: totalExpenseAll > 0 ? Number(((c.totalAmount / totalExpenseAll) * 100).toFixed(1)) : 0,
      color: CATEGORY_COLORS[c.category] || CATEGORY_COLORS['기타']
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount);

  // 3. 시간대별 소비 패턴 (24시간 및 주요 시간대 블록)
  const hourBuckets = Array(24).fill(0);
  const blockMap = {
    '새벽/아침 (00-09시)': 0,
    '오전 (09-12시)': 0,
    '점심 (12-14시)': 0,
    '오후 (14-18시)': 0,
    '퇴근/저녁 (18-21시)': 0,
    '심야 (21-24시)': 0
  };

  transactions.forEach((tx) => {
    let hr = 12;
    if (typeof tx.hour === 'number') {
      hr = tx.hour;
    } else if (tx.time) {
      hr = parseInt(tx.time.split(':')[0], 10) || 12;
    }
    if (hr >= 0 && hr < 24) {
      hourBuckets[hr] += tx.amount || 0;
    }

    if (hr < 9) blockMap['새벽/아침 (00-09시)'] += tx.amount || 0;
    else if (hr < 12) blockMap['오전 (09-12시)'] += tx.amount || 0;
    else if (hr < 14) blockMap['점심 (12-14시)'] += tx.amount || 0;
    else if (hr < 18) blockMap['오후 (14-18시)'] += tx.amount || 0;
    else if (hr < 21) blockMap['퇴근/저녁 (18-21시)'] += tx.amount || 0;
    else blockMap['심야 (21-24시)'] += tx.amount || 0;
  });

  // 피크 시간 블록 찾기
  let maxBlock = '퇴근/저녁 (18-21시)';
  let maxBlockAmount = 0;
  Object.entries(blockMap).forEach(([block, amt]) => {
    if (amt > maxBlockAmount) {
      maxBlockAmount = amt;
      maxBlock = block;
    }
  });

  // 4. 요일별 소비 패턴 및 주말 비중
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayBuckets = Array(7).fill(0);
  let weekendSum = 0;

  transactions.forEach((tx) => {
    let day = 1;
    if (typeof tx.dayOfWeek === 'number') {
      day = tx.dayOfWeek;
    } else if (tx.date) {
      day = new Date(tx.date).getDay();
    }
    if (day >= 0 && day < 7) {
      dayBuckets[day] += tx.amount || 0;
      if (day === 0 || day === 6) weekendSum += tx.amount || 0;
    }
  });

  const weekendRatio = totalExpenseAll > 0 ? Math.round((weekendSum / totalExpenseAll) * 100) : 0;
  const dayOfWeekPattern = dayNames.map((name, idx) => ({
    name,
    amount: dayBuckets[idx],
    isWeekend: idx === 0 || idx === 6
  }));

  return {
    hasData: true,
    totalTransactionCount: transactions.length,
    monthlyAvgIncome,
    monthlyAvgExpense,
    totalNetCashflow,
    savingsRate,
    fixedExpenseRatio,
    cashTotal,
    monthlyTrends,
    categoryBreakdown,
    hourlyPattern: hourBuckets.map((amt, hr) => ({ hour: hr, amount: amt })),
    timeBlocks: Object.entries(blockMap).map(([label, amt]) => ({ label, amount: amt })),
    dayOfWeekPattern,
    peakWindow: maxBlock,
    weekendRatio
  };
}
