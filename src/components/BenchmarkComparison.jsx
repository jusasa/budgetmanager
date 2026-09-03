import React, { useState, useEffect } from 'react';
import { Users, BarChart2, CheckCircle, Share2, HelpCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function BenchmarkComparison({ analytics, onShowNotification }) {
  const [ageGroup, setAgeGroup] = useState('30s');
  const [quintile, setQuintile] = useState(3);
  const [benchmarkData, setBenchmarkData] = useState(null);
  const [hasContributed, setHasContributed] = useState(false);
  const [isContributing, setIsContributing] = useState(false);

  useEffect(() => {
    fetchBenchmark();
  }, [ageGroup, quintile]);

  const fetchBenchmark = async () => {
    try {
      const res = await fetch(`/api/benchmark/stats?ageGroup=${ageGroup}&quintile=${quintile}`);
      const json = await res.json();
      if (json.success) {
        setBenchmarkData(json.benchmark);
      }
    } catch (e) {
      console.error('Benchmark fetch error', e);
    }
  };

  const handleContributeAnonymous = async () => {
    if (hasContributed) return;
    setIsContributing(true);
    try {
      const res = await fetch('/api/benchmark/contribute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ageGroup,
          incomeBracket: `${quintile}분위`,
          monthlyExpense: analytics.monthlyAvgExpense,
          savingsRate: analytics.savingsRate,
          topCategory: analytics.categoryBreakdown[0]?.category || '기타',
          peakTime: analytics.peakWindow,
          userConsent: true
        })
      });
      const data = await res.json();
      if (data.success) {
        setHasContributed(true);
        onShowNotification('개인정보 없는 순수 통계 지표가 안전하게 기여되었습니다. 감사합니다!', 'success');
      }
    } catch (e) {
      onShowNotification('기여 처리 중 오류가 발생했습니다.', 'error');
    } finally {
      setIsContributing(false);
    }
  };

  const { monthlyAvgIncome = 0, monthlyAvgExpense = 0, savingsRate = 0 } = analytics;
  const peerIncome = benchmarkData?.avg_monthly_income || 4350000;
  const peerExpense = benchmarkData?.avg_monthly_expense || 2750000;
  const peerSavingsRate = benchmarkData?.avg_savings_rate || 36.8;

  const incomeDiff = monthlyAvgIncome - peerIncome;
  const expenseDiff = monthlyAvgExpense - peerExpense;
  const savingsRateDiff = (savingsRate - peerSavingsRate).toFixed(1);

  return (
    <div className="wp-card" style={{ marginBottom: '2.25rem' }}>
      <div className="chart-header">
        <div className="chart-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <Users size={20} style={{ color: 'var(--wp-blue-primary)' }} />
            <h3>통계청 공공데이터 비교 (또래 벤치마크)</h3>
          </div>
          <p className="chart-subtitle">
            통계청 가계동향조사 및 가계금융복지조사 마이크로데이터 기반 동 연령대·분위 비교
          </p>
        </div>

        {/* 연령대 & 분위 선택 필터 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>연령:</span>
            <select 
              className="form-select" 
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', width: 'auto' }}
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
            >
              <option value="20s">20대 (사회초년생)</option>
              <option value="30s">30대 (직장인)</option>
              <option value="all">전 연령 가구</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>소득 분위:</span>
            <select 
              className="form-select" 
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', width: 'auto' }}
              value={quintile}
              onChange={(e) => setQuintile(Number(e.target.value))}
            >
              <option value="1">1분위 (하위 20%)</option>
              <option value="3">3분위 (중위 50%)</option>
              <option value="5">5분위 (상위 20%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3대 비교 메트릭 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {/* 월평균 소득 비교 */}
        <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: '12px', padding: '1.2rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
            월 소득 비교
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-navy)' }}>
            {(monthlyAvgIncome / 10000).toFixed(0)}만 원
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            또래 평균: {(peerIncome / 10000).toFixed(0)}만 원
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            marginTop: '0.65rem', fontSize: '0.78rem', fontWeight: 700,
            color: incomeDiff >= 0 ? 'var(--color-income)' : 'var(--text-secondary)'
          }}>
            {incomeDiff >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>또래 평균 대비 {incomeDiff >= 0 ? `+${(incomeDiff / 10000).toFixed(0)}만 원` : `${(incomeDiff / 10000).toFixed(0)}만 원`}</span>
          </div>
        </div>

        {/* 월평균 소비 비교 */}
        <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: '12px', padding: '1.2rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
            월 소비 지출 비교
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: expenseDiff <= 0 ? 'var(--color-income)' : 'var(--color-expense)' }}>
            {(monthlyAvgExpense / 10000).toFixed(0)}만 원
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            또래 평균: {(peerExpense / 10000).toFixed(0)}만 원
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            marginTop: '0.65rem', fontSize: '0.78rem', fontWeight: 700,
            color: expenseDiff <= 0 ? 'var(--color-income)' : 'var(--color-expense)'
          }}>
            {expenseDiff <= 0 ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
            <span>또래 평균 대비 {expenseDiff <= 0 ? `${(Math.abs(expenseDiff) / 10000).toFixed(0)}만 원 절약 중` : `${(expenseDiff / 10000).toFixed(0)}만 원 초과 지출`}</span>
          </div>
        </div>

        {/* 저축률 비교 */}
        <div style={{ background: 'var(--bg-surface-elevated)', borderRadius: '12px', padding: '1.2rem', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
            저축 및 투자율 비교
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: Number(savingsRateDiff) >= 0 ? 'var(--wp-navy-dark)' : 'var(--color-warning)' }}>
            {savingsRate}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            또래 평균: {peerSavingsRate}%
          </div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '2px',
            marginTop: '0.65rem', fontSize: '0.78rem', fontWeight: 700,
            color: Number(savingsRateDiff) >= 0 ? 'var(--color-income)' : 'var(--color-warning)'
          }}>
            {Number(savingsRateDiff) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>또래 평균 대비 {Number(savingsRateDiff) >= 0 ? `+${savingsRateDiff}%p 우수` : `${savingsRateDiff}%p`}</span>
          </div>
        </div>
      </div>

      {/* 익명 기여 옵트인 배너 (overview.md line 38 지원) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '1.1rem 1.35rem', borderRadius: '12px',
        background: 'var(--wp-blue-tint)', border: '1px solid rgba(79, 156, 249, 0.25)',
        flexWrap: 'wrap', gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'var(--wp-blue-light)', color: 'var(--wp-navy-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Share2 size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--wp-navy-dark)' }}>
              익명 통계 기여 참여 (소비자 생태계 지원)
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              개인정보는 절대 포함되지 않으며, 다른 사용자의 통계 벤치마크 정확도 향상에만 참고됩니다.
            </div>
          </div>
        </div>

        <button 
          className={hasContributed ? 'btn-wp-outline' : 'btn-wp-primary'}
          style={{ padding: '0.55rem 1.1rem', fontSize: '0.84rem' }}
          onClick={handleContributeAnonymous}
          disabled={hasContributed || isContributing}
        >
          {hasContributed ? (
            <>
              <CheckCircle size={15} style={{ color: 'var(--color-income)' }} />
              <span style={{ color: 'var(--color-income)' }}>익명 기여 완료</span>
            </>
          ) : (
            <span>{isContributing ? '기여 처리 중...' : '동의하고 익명 기여하기'}</span>
          )}
        </button>
      </div>
    </div>
  );
}
