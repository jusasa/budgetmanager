// Scenario Presets for Debug Simulator

export function getScenarioDataset(type) {
  const currentYear = 2026;
  const months = [];
  const transactions = [];

  let baseIncome = 4200000;
  let targetExpense = 2700000;

  if (type === 'deficit') {
    // 1. 사회초년생 적자형
    baseIncome = 2300000;
    targetExpense = 2650000;
  } else if (type === 'nightOwl') {
    // 2. 외식/야간 과소비형
    baseIncome = 4200000;
    targetExpense = 3700000;
  } else if (type === 'fire') {
    // 3. 알뜰 FIRE 저축형
    baseIncome = 4600000;
    targetExpense = 1950000;
  } else if (type === 'bonus') {
    // 4. 성과급 달
    baseIncome = 7600000;
    targetExpense = 3200000;
  }

  // 12개월 소득 생성
  for (let i = 11; i >= 0; i--) {
    const d = new Date(currentYear, 8 - i, 1);
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push({
      yearMonth: ym,
      salary: baseIncome,
      taxWithheld: Math.round(baseIncome * 0.1),
      pension: Math.round(baseIncome * 0.045),
      healthIns: Math.round(baseIncome * 0.035)
    });
  }

  // 거래 내역 생성
  let id = 1;
  months.forEach((m) => {
    // 고정비
    transactions.push({
      id: `scen_${type}_fix_${id++}`,
      date: `${m.yearMonth}-05`,
      time: '09:00',
      hour: 9,
      dayOfWeek: 1,
      name: type === 'fire' ? '공유주거 관리비' : '원룸 월세 및 관리비',
      category: '주거/통신/공과금',
      amount: type === 'fire' ? 350000 : 700000,
      paymentMethod: '계좌이체',
      isFixedExpense: true
    });

    // 변동비
    let currentExp = type === 'fire' ? 350000 : 700000;
    while (currentExp < targetExpense) {
      const day = Math.min(28, Math.max(1, Math.floor(Math.random() * 28) + 1));
      let hour = 13;
      if (type === 'nightOwl') {
        hour = Math.random() > 0.4 ? Math.floor(Math.random() * 4) + 21 : 12; // 심야 집중
      } else {
        hour = Math.floor(Math.random() * 12) + 9;
      }

      let category = '식비/카페';
      let name = '일반 식사';
      let amt = 15000;

      if (type === 'nightOwl') {
        category = Math.random() > 0.3 ? '식비/카페' : '쇼핑/생활';
        name = category === '식비/카페' ? '배달의민족 야식/치맥' : '쿠팡 심야 로켓배송';
        amt = Math.round((Math.random() * 60000 + 20000) / 1000) * 1000;
      } else if (type === 'fire') {
        category = Math.random() > 0.5 ? '식비/카페' : '교통/차량';
        name = category === '식비/카페' ? '식자재 마트 알뜰 장보기' : '알뜰교통카드 결제';
        amt = Math.round((Math.random() * 25000 + 4000) / 1000) * 1000;
      } else {
        category = '쇼핑/생활';
        name = '카드 결제';
        amt = Math.round((Math.random() * 40000 + 10000) / 1000) * 1000;
      }

      transactions.push({
        id: `scen_${type}_tx_${id++}`,
        date: `${m.yearMonth}-${String(day).padStart(2, '0')}`,
        time: `${String(hour).padStart(2, '0')}:15`,
        hour,
        dayOfWeek: Math.floor(Math.random() * 7),
        name,
        category,
        amount: amt,
        paymentMethod: '신용카드',
        isFixedExpense: false
      });

      currentExp += amt;
    }
  });

  return {
    meta: {
      dataSource: [`[시뮬레이터 모드] ${type} 페르소나 데이터셋`],
      period: `${months[0].yearMonth} ~ ${months[months.length - 1].yearMonth}`,
      scenarioType: type
    },
    hometax: {
      annualGrossIncome: baseIncome * 12,
      annualTaxWithheld: Math.round(baseIncome * 12 * 0.1),
      taxPayerName: `시뮬레이션 사용자 (${type})`,
      incomeType: '근로소득',
      verificationCode: `SIM-${type.toUpperCase()}-2026`
    },
    monthlyIncome: months,
    transactions
  };
}
