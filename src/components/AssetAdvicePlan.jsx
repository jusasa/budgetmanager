import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, AlertTriangle, CheckCircle2, ChevronRight, Target, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';

export default function AssetAdvicePlan({ analytics, onShowNotification, isSimulation = false }) {
  const [adviceData, setAdviceData] = useState(null);
  const [providerName, setProviderName] = useState('');
  const [isRealAi, setIsRealAi] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (analytics && analytics.hasData) {
      fetchAdvice(false);
    }
  }, [analytics]);

  const fetchAdvice = async (forceReal = false) => {
    setIsLoading(true);
    try {
      // 오직 브라우저에서 전처리된 집계 지표만 전송하여 서버 부하/토큰 최소화
      const payload = {
        monthlyIncome: analytics.monthlyAvgIncome,
        monthlyExpense: analytics.monthlyAvgExpense,
        savingsRate: analytics.savingsRate,
        topCategories: analytics.categoryBreakdown.slice(0, 3),
        peakSpendingWindow: analytics.peakWindow,
        weekendRatio: analytics.weekendRatio,
        emergencyFundAmount: analytics.monthlyAvgExpense * 1.5,
        isSimulation: isSimulation && !forceReal,
        forceRealAi: forceReal
      };

      const res = await fetch('/api/advice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        setAdviceData(data.advice);
        setProviderName(data.provider || 'AI Engine');
        setIsRealAi(data.isRealAi || false);
        if (forceReal) {
          onShowNotification?.(`OpenRouter AI (${data.provider}) 맞춤형 솔루션이 생성되었습니다!`, 'success');
        }
      }
    } catch (e) {
      console.error('Failed to generate advice', e);
      onShowNotification?.('AI 솔루션 생성 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!adviceData) {
    return (
      <div className="wp-card" style={{ textAlign: 'center', padding: '2.5rem' }}>
        <Sparkles size={32} style={{ color: 'var(--wp-blue-primary)', margin: '0 auto 0.75rem' }} />
        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--wp-navy-dark)' }}>
          {isLoading ? 'OpenRouter AI가 맞춤형 자산 솔루션을 생성하는 중...' : '데이터가 입력되면 맞춤형 자산관리 플랜이 제시됩니다.'}
        </div>
      </div>
    );
  }

  const { healthScore, healthGrade, budgetRule, actionItems = [], aiSummary } = adviceData;

  return (
    <div className="wp-card" style={{ marginBottom: '2.25rem', position: 'relative' }}>
      {/* 로딩 인디케이터 오버레이 */}
      {isLoading && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(3px)',
          borderRadius: '16px', zIndex: 10,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
        }}>
          <Loader2 size={36} className="animate-spin" style={{ color: 'var(--wp-blue-primary)' }} />
          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--wp-navy-dark)' }}>
            OpenRouter AI가 소비 패턴을 심층 분석 중입니다...
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            12개월 수입·지출 및 피크 시간대 지표 반영 중
          </div>
        </div>
      )}

      {/* 헤더 영역 */}
      <div className="chart-header" style={{ alignItems: 'flex-start' }}>
        <div className="chart-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <Sparkles size={20} style={{ color: 'var(--wp-blue-primary)' }} />
            <h3>스마트 자산관리 솔루션 & 개선 로드맵</h3>
          </div>
          <p className="chart-subtitle">
            소비 패턴 및 통계청 벤치마크를 융합하여 도출된 1:1 맞춤형 자산 최적화 솔루션입니다.
          </p>
        </div>

        {/* 컨트롤 & 배지 영역 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {/* AI 생성/새로고침 버튼 */}
          <button 
            onClick={() => fetchAdvice(true)}
            disabled={isLoading}
            className="btn-secondary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
            <span>AI 솔루션 실시간 생성</span>
          </button>

          {/* AI 엔진 배지 */}
          {providerName && (
            <div style={{
              background: isRealAi ? '#043873' : 'var(--wp-blue-tint)',
              color: isRealAi ? '#FFE492' : 'var(--wp-navy-dark)',
              fontSize: '0.72rem',
              fontWeight: 700, padding: '0.45rem 0.75rem', borderRadius: 'var(--radius-full)',
              border: isRealAi ? '1px solid rgba(255, 228, 146, 0.4)' : '1px solid rgba(79, 156, 249, 0.3)',
              display: 'flex', alignItems: 'center', gap: '0.35rem'
            }}>
              <Sparkles size={13} style={{ color: isRealAi ? '#FFE492' : 'var(--wp-blue-primary)' }} />
              <span>{providerName}</span>
            </div>
          )}

          {/* 재무 건강도 배지 */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.85rem',
            background: 'var(--wp-blue-tint)', padding: '0.45rem 0.9rem',
            borderRadius: 'var(--radius-md)', border: '1px solid rgba(79, 156, 249, 0.3)'
          }}>
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>재무 건강도</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--wp-navy-dark)' }}>
                {healthScore}점 <span style={{ fontSize: '0.78rem', color: 'var(--wp-blue-hover)' }}>({healthGrade})</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 종합 총평 코멘트 띠배너 */}
      {aiSummary && (
        <div style={{
          background: 'rgba(79, 156, 249, 0.08)',
          border: '1px solid rgba(79, 156, 249, 0.25)',
          borderRadius: '12px',
          padding: '0.85rem 1.15rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem'
        }}>
          <Sparkles size={18} style={{ color: 'var(--wp-blue-hover)', flexShrink: 0 }} />
          <div style={{ fontSize: '0.86rem', color: 'var(--wp-navy-dark)', fontWeight: 600, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 800, color: 'var(--wp-blue-primary)', marginRight: '0.35rem' }}>[AI 자산관리 총평]</span>
            {aiSummary}
          </div>
        </div>
      )}

      {/* 50 / 30 / 20 법칙 진단 카드 */}
      <div style={{
        background: 'var(--bg-surface-elevated)', borderRadius: '16px',
        padding: '1.5rem', marginBottom: '1.75rem', border: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-navy)' }}>
              글로벌 표준 50 / 30 / 20 예산 최적화 진단
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              필수지출 50% 이하 | 자율소비 30% 이하 | 저축·투자 20% 이상 권장
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {/* 필수 지출 */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
              <span style={{ fontWeight: 700 }}>필수 지출 (주거/식비 등)</span>
              <span style={{ fontWeight: 800, color: 'var(--wp-navy-dark)' }}>{budgetRule.needs.currentPercent}%</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              권장: 월 {(budgetRule.needs.idealAmount / 10000).toFixed(0)}만 원 (50%)
            </div>
            <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, budgetRule.needs.currentPercent)}%`, background: 'var(--wp-navy-dark)' }}></div>
            </div>
          </div>

          {/* 자율 지출 */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
              <span style={{ fontWeight: 700 }}>자율 지출 (쇼핑/여가 등)</span>
              <span style={{ fontWeight: 800, color: budgetRule.wants.status === '과다' ? 'var(--color-expense)' : 'var(--wp-navy-dark)' }}>
                {budgetRule.wants.currentPercent}%
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              권장: 월 {(budgetRule.wants.idealAmount / 10000).toFixed(0)}만 원 (30%)
            </div>
            <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, budgetRule.wants.currentPercent)}%`, background: 'var(--wp-blue-primary)' }}></div>
            </div>
          </div>

          {/* 저축 및 투자 */}
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.3rem' }}>
              <span style={{ fontWeight: 700 }}>저축 및 투자 (자산증식)</span>
              <span style={{ fontWeight: 800, color: 'var(--color-income)' }}>{budgetRule.savings.currentPercent}%</span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
              권장: 월 {(budgetRule.savings.idealAmount / 10000).toFixed(0)}만 원 (20%)
            </div>
            <div style={{ height: '6px', background: 'var(--border-subtle)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, budgetRule.savings.currentPercent)}%`, background: 'var(--color-income)' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 맞춤 액션 아이템 리스트 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-navy)' }}>
            {isRealAi ? 'AI가 추천하는 4대 맞춤형 자산관리 액션 플랜' : '실행 가능한 4대 자산관리 액션 플랜'}
          </div>
          {isRealAi && (
            <span style={{ fontSize: '0.75rem', color: '#10B981', fontWeight: 700 }}>
              ● 실시간 AI 분석 완료
            </span>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {actionItems.map((item, idx) => (
            <div 
              key={idx} 
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '1rem',
                padding: '1rem 1.25rem', borderRadius: '12px',
                background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
                transition: 'border-color 0.2s ease'
              }}
            >
              <div style={{
                padding: '0.2rem 0.55rem', borderRadius: '6px',
                background: item.priority === 'HIGH' ? 'var(--color-expense-bg)' : 'var(--wp-blue-light)',
                color: item.priority === 'HIGH' ? 'var(--color-expense)' : 'var(--wp-navy-dark)',
                fontWeight: 800, fontSize: '0.72rem', flexShrink: 0
              }}>
                {item.priority === 'HIGH' ? '우선 실행' : '추천'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.78rem', color: 'var(--wp-blue-hover)' }}>
                    [{item.category}]
                  </span>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    {item.title}
                  </div>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {item.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
