// CSV Ledger Parser and Exporter Utility

// 1. 사용자 업로드 CSV 파싱
export function parseLedgerCsv(csvText) {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    throw new Error('CSV 파일에 유효한 데이터 행이 없습니다.');
  }

  // 헤더 분석
  const header = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''));
  const dateIdx = header.findIndex((h) => h.includes('날짜') || h.includes('일자') || h.toLowerCase().includes('date'));
  const nameIdx = header.findIndex((h) => h.includes('상호') || h.includes('내역') || h.includes('적요') || h.toLowerCase().includes('name'));
  const amountIdx = header.findIndex((h) => h.includes('금액') || h.includes('지출') || h.toLowerCase().includes('amount'));
  const catIdx = header.findIndex((h) => h.includes('분류') || h.includes('카테고리') || h.toLowerCase().includes('category'));
  const timeIdx = header.findIndex((h) => h.includes('시간') || h.toLowerCase().includes('time'));
  const methodIdx = header.findIndex((h) => h.includes('결제') || h.includes('수단') || h.toLowerCase().includes('method'));

  if (dateIdx === -1 || amountIdx === -1) {
    throw new Error('필수 열(날짜, 금액)을 찾을 수 없습니다. 샘플 템플릿 서식을 확인해주세요.');
  }

  const transactions = [];
  for (let i = 1; i < lines.length; i++) {
    const rawCols = lines[i].split(',');
    if (rawCols.length < 2) continue;

    const date = rawCols[dateIdx]?.trim().replace(/"/g, '');
    const amountRaw = rawCols[amountIdx]?.trim().replace(/["원,\s]/g, '');
    const amount = Math.abs(parseInt(amountRaw, 10));

    if (!date || isNaN(amount) || amount === 0) continue;

    const name = nameIdx !== -1 ? rawCols[nameIdx]?.trim().replace(/"/g, '') : '가계부 항목';
    const category = catIdx !== -1 ? rawCols[catIdx]?.trim().replace(/"/g, '') || '기타' : '기타';
    const time = timeIdx !== -1 && rawCols[timeIdx] ? rawCols[timeIdx].trim().replace(/"/g, '') : '14:00';
    const paymentMethod = methodIdx !== -1 ? rawCols[methodIdx]?.trim().replace(/"/g, '') || '신용카드' : '신용카드';

    const hour = parseInt(time.split(':')[0], 10) || 12;
    const dayOfWeek = new Date(date).getDay() || 1;

    transactions.push({
      id: `csv_tx_${i}`,
      date,
      time,
      hour,
      dayOfWeek,
      name,
      category,
      amount,
      paymentMethod,
      isFixedExpense: false
    });
  }

  return transactions;
}

// 2. 가계부 샘플 CSV 템플릿 다운로드용 문자열 생성
export function generateSampleCsvContent() {
  const rows = [
    ['날짜', '시간', '상호명/내역', '카테고리', '금액', '결제수단'],
    ['2026-08-05', '08:40', '스타벅스 역삼역점', '식비/카페', '5500', '신용카드'],
    ['2026-08-05', '12:30', '김밥천국 점심식사', '식비/카페', '9000', '현금'],
    ['2026-08-05', '19:15', '이마트 역삼점 장보기', '식비/카페', '42000', '신용카드'],
    ['2026-08-06', '09:10', '티머니 후불교통', '교통/차량', '1500', '신용카드'],
    ['2026-08-06', '20:00', 'CGV 강남 영화티켓', '문화/여가/취미', '15000', '신용카드'],
    ['2026-08-10', '10:00', 'SKT 통신요금 자동이체', '주거/통신/공과금', '68000', '계좌이체'],
    ['2026-08-15', '14:30', '무신사 여름 셔츠 구매', '쇼핑/생활', '38000', '신용카드'],
    ['2026-08-18', '21:30', '배달의민족 야식 치킨', '식비/카페', '24000', '신용카드'],
    ['2026-08-20', '16:00', '온누리약국 비타민', '의료/건강', '30000', '현금'],
    ['2026-08-25', '11:00', '월세 및 관리비 이체', '주거/통신/공과금', '650000', '계좌이체']
  ];

  return rows.map((r) => r.join(',')).join('\n');
}

// 3. 분석 결과 CSV 내보내기용 문자열 생성
export function exportAnalysisToCsv(monthlyTrends, categoryBreakdown, transactions) {
  let csv = '\uFEFF'; // UTF-8 BOM for Excel in Korean
  csv += '=== [1. 월별 수입 및 지출 내역] ===\n';
  csv += '연월,월수입(원),월지출(원),잉여자금(원),저축률(%)\n';
  monthlyTrends.forEach((m) => {
    csv += `${m.yearMonth},${m.income},${m.expense},${m.surplus},${m.savingsRate}\n`;
  });

  csv += '\n=== [2. 카테고리별 소비 비중] ===\n';
  csv += '카테고리,총지출액(원),비중(%),결제건수\n';
  categoryBreakdown.forEach((c) => {
    csv += `${c.category},${c.totalAmount},${c.percent},${c.count}\n`;
  });

  csv += '\n=== [3. 최근 거래 내역 (일부)] ===\n';
  csv += '날짜,시간,상호명,카테고리,금액(원),결제수단\n';
  transactions.slice(0, 100).forEach((t) => {
    csv += `${t.date},${t.time || '12:00'},"${t.name}",${t.category},${t.amount},${t.paymentMethod || '카드'}\n`;
  });

  return csv;
}
