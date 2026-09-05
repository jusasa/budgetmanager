// Financial Advisory & Wealth Optimization Engine
// 실제 서비스: OpenRouter API (DeepSeek / Claude / GPT)
// 디버그 모드: 규칙 기반 고속 시뮬레이션
import { Router } from 'express';
import dotenv from 'dotenv';
dotenv.config();

const router = Router();

function extractCleanJson(text) {
  if (!text) return null;
  // 1. ```json 제거
  let cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*$/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    // 2. { ... } 블록 정규식 매칭
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (err) { }
    }
  }
  return null;
}

router.post('/generate', async (req, res) => {
  const {
    monthlyIncome = 4000000,
    monthlyExpense = 2500000,
    savingsRate = 37.5,
    topCategories = [],
    peakSpendingWindow = '18-21시',
    weekendRatio = 42,
    emergencyFundAmount = 0,
    isSimulation = false,
    forceRealAi = false
  } = req.body;

  const surplus = monthlyIncome - monthlyExpense;
  const expenseRatio = Math.round((monthlyExpense / monthlyIncome) * 100);

  // 기본 재무 건강도 및 50/30/20 지표 계산
  let healthScore = 50;
  if (savingsRate >= 40) healthScore += 25;
  else if (savingsRate >= 25) healthScore += 15;
  else if (savingsRate >= 10) healthScore += 5;
  else healthScore -= 15;

  if (expenseRatio <= 65) healthScore += 15;
  else if (expenseRatio > 85) healthScore -= 20;

  const recommendedEmergency = monthlyExpense * 4;
  const emergencyCoverageMonths = monthlyExpense > 0 ? (emergencyFundAmount / monthlyExpense).toFixed(1) : 0;
  if (emergencyCoverageMonths >= 3) healthScore += 10;
  healthScore = Math.max(20, Math.min(98, healthScore));

  const budgetRule = {
    needs: {
      idealPercent: 50,
      idealAmount: Math.round(monthlyIncome * 0.5),
      currentAmount: Math.round(monthlyExpense * 0.55),
      currentPercent: Math.round((monthlyExpense * 0.55 / monthlyIncome) * 100),
      status: '적정'
    },
    wants: {
      idealPercent: 30,
      idealAmount: Math.round(monthlyIncome * 0.3),
      currentAmount: Math.round(monthlyExpense * 0.45),
      currentPercent: Math.round((monthlyExpense * 0.45 / monthlyIncome) * 100),
      status: monthlyExpense * 0.45 > monthlyIncome * 0.35 ? '과다' : '적정'
    },
    savings: {
      idealPercent: 20,
      idealAmount: Math.round(monthlyIncome * 0.2),
      currentAmount: surplus > 0 ? surplus : 0,
      currentPercent: Math.round(savingsRate),
      status: savingsRate >= 20 ? '우수' : '확대 권장'
    }
  };

  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL;

  // 1. 실제 서비스 모드이거나 사용자가 실시간 AI 생성을 요청한 경우 (키 등록 시)
  if ((!isSimulation || forceRealAi) && openRouterKey && openRouterKey.trim().length > 0) {
    try {
      console.log(`[OpenRouter AI] Calling model: ${openRouterModel} for real advice...`);

      const systemPrompt = `You are a certified Korean financial wealth advisor and CFP (공인재무설계사).
Analyze the preprocessed Korean user metrics and generate 4 realistic, creative, tailored financial action items in Korean.
Output valid JSON format with actionItems array and aiSummary.`;

      const userMetrics = {
        월평균소득: `${(monthlyIncome).toLocaleString()}원`,
        월평균지출: `${(monthlyExpense).toLocaleString()}원`,
        월잉여자금: `${(surplus).toLocaleString()}원`,
        저축률: `${savingsRate}%`,
        상위지출처: topCategories.map((c) => `${c.category} (${c.percent}%)`),
        소비피크시간: peakSpendingWindow,
        주말지출비중: `${weekendRatio}%`,
        재무건강도점수: `${healthScore}점`
      };

      const aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'HTTP-Referer': 'https://finwise.local',
          'X-Title': 'FinWise Wealth Analytics',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: `아래 지표를 바탕으로 이 사용자를 위한 4가지 차별화된 맞춤형 자산 최적화 액션플랜을 작성해주세요:\n${JSON.stringify(userMetrics, null, 2)}\n\n반드시 아래 JSON 형식으로만 응답해주세요:
{
  "actionItems": [
    { "priority": "HIGH", "category": "식비 절감", "title": "구체적 권장 조언", "description": "상세한 실행 계획 및 연간 기대 절감액" },
    { "priority": "HIGH", "category": "소비 습관", "title": "구체적 권장 조언", "description": "상세한 실행 계획" },
    { "priority": "MEDIUM", "category": "비상금/저축", "title": "구체적 권장 조언", "description": "상세한 실행 계획" },
    { "priority": "MEDIUM", "category": "세테크/투자", "title": "구체적 권장 조언", "description": "상세한 실행 계획" }
  ],
  "aiSummary": "이 사용자의 소비 성향에 맞춘 총평 (2~3문장)"
}`
            }
          ],
          max_tokens: 3000,
          reasoning: { effort: 'low' },
          response_format: { type: 'json_object' }
        })
      });

      const aiJson = await aiResponse.json();
      const message = aiJson.choices?.[0]?.message;
      const rawContent = message?.content || message?.reasoning;
      console.log('[OpenRouter AI] Raw response received. Length:', rawContent?.length);

      const parsed = extractCleanJson(rawContent);

      if (parsed && Array.isArray(parsed.actionItems) && parsed.actionItems.length > 0) {
        console.log('[OpenRouter AI] Successfully parsed dynamic action items!');
        return res.json({
          success: true,
          isRealAi: true,
          provider: `OpenRouter AI (${openRouterModel})`,
          advice: {
            generatedAt: new Date().toISOString(),
            healthScore,
            healthGrade: healthScore >= 80 ? 'A+ (재무 안정)' : healthScore >= 60 ? 'B (양호)' : 'C (지출 개선 필요)',
            summaryMetrics: { monthlyIncome, monthlyExpense, surplus, savingsRate },
            budgetRule,
            recommendedEmergency,
            actionItems: parsed.actionItems,
            aiSummary: parsed.aiSummary || '소비 패턴을 점검하여 불필요한 고정비를 줄이고 저축률을 점진적으로 높여보세요.'
          }
        });
      } else {
        console.warn('[OpenRouter AI] JSON parsing failed on content:', rawContent);
      }
    } catch (err) {
      console.error('[OpenRouter AI Error]:', err);
    }
  }

  // 2. 디버그 모드이거나 OpenRouter 키 미등록 시: 초고속 시뮬레이션 엔진으로 반환
  const defaultActionItems = [
    {
      priority: 'HIGH',
      category: '식비 다이어트',
      title: '배달 및 외식 빈도 조절로 월 15~20만 원 잉여 자금 확보',
      description: `현재 주요 소비가 식음료에 집중되어 있습니다. 주 1~2회 장보기 밀키트 활용 시 연간 약 180만 원의 추가 저축이 가능합니다.`
    },
    {
      priority: 'MEDIUM',
      category: '소비 패턴 교정',
      title: `${peakSpendingWindow} 스마트 결제 알림 설정 권장`,
      description: '주요 소비가 퇴근 직후 및 심야 시간대에 집중되어 있습니다. 당일 지출 한도 알림이나 무지출 챌린지를 적용해 보세요.'
    },
    {
      priority: 'HIGH',
      category: '비상 자금 마련',
      title: `목표 비상금 ${(recommendedEmergency / 10000).toLocaleString()}만 원 파킹통장 분리 보관`,
      description: `현재 월 지출 ${(monthlyExpense / 10000).toLocaleString()}만 원을 감안할 때, 3~6개월 치 생활비를 CMA 또는 연 3% 이상 고금리 파킹통장에 즉시 인출 가능한 형태로 예치하는 것을 추천합니다.`
    },
    {
      priority: 'MEDIUM',
      category: '절세 포트폴리오',
      title: '연금저축 + IRP 계좌 연 최대 900만 원 세액공제 활용',
      description: '연말정산 환급금을 극대화하기 위해 매월 약 30~50만 원을 연금저축/IRP에 분할 납입하면 최대 148.5만 원의 세액공제 혜택을 챙길 수 있습니다.'
    }
  ];

  res.json({
    success: true,
    isRealAi: false,
    provider: isSimulation ? 'Simulation Engine (Debug Mode)' : 'Rule Engine (OpenRouter Standby)',
    advice: {
      generatedAt: new Date().toISOString(),
      healthScore,
      healthGrade: healthScore >= 80 ? 'A+ (재무 안정)' : healthScore >= 60 ? 'B (양호)' : 'C (지출 개선 필요)',
      summaryMetrics: { monthlyIncome, monthlyExpense, surplus, savingsRate },
      budgetRule,
      recommendedEmergency,
      actionItems: defaultActionItems,
      aiSummary: '고정 지출과 충동 소비를 구분하여 비상예비자금을 확보하는 단계입니다.'
    }
  });
});

export default router;
