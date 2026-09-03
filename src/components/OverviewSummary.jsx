import React from 'react';
import { DollarSign, CreditCard, PiggyBank, TrendingUp, ShieldCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function OverviewSummary({ analytics, hometaxMeta }) {
  const {
    monthlyAvgIncome = 0,
    monthlyAvgExpense = 0,
    totalNetCashflow = 0,
    savingsRate = 0,
    fixedExpenseRatio = 0,
    cashTotal = 0
  } = analytics;

  // 권장 비상자금 (월 지출의 4개월치)
  const recommendedEmergency = monthlyAvgExpense * 4;

  return (
    <div className="kpi-grid">
      {/* 1. 월평균 총소득 */}
      <div className="wp-card kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">월평균 총소득</span>
          <div className="kpi-icon" style={{ background: 'var(--color-income-bg)', color: 'var(--color-income)' }}>
            <DollarSign size={20} />
          </div>
        </div>
        <div>
          <div className="kpi-value num-font">
            {(monthlyAvgIncome / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}
            <span style={{ fontSize: '1.05rem', fontWeight: 600, marginLeft: '0.2rem' }}>만 원</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            연간 환산: 약 {((monthlyAvgIncome * 12) / 10000).toLocaleString()}만 원
          </div>
        </div>
        <div className="kpi-footer">
          <span className="kpi-pill" style={{ background: 'var(--color-income-bg)', color: 'var(--color-income)' }}>
            <ArrowUpRight size={12} style={{ display: 'inline', marginRight: '2px' }} />
            국세청 홈택스 인증
          </span>
          <span>원천징수 반영</span>
        </div>
      </div>

      {/* 2. 월평균 소비지출 */}
      <div className="wp-card kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">월평균 소비지출</span>
          <div className="kpi-icon" style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)' }}>
            <CreditCard size={20} />
          </div>
        </div>
        <div>
          <div className="kpi-value num-font" style={{ color: 'var(--color-expense)' }}>
            {(monthlyAvgExpense / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}
            <span style={{ fontSize: '1.05rem', fontWeight: 600, marginLeft: '0.2rem' }}>만 원</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            고정비 {fixedExpenseRatio}% | 변동비 {100 - fixedExpenseRatio}%
          </div>
        </div>
        <div className="kpi-footer">
          <span className="kpi-pill" style={{ background: 'var(--color-expense-bg)', color: 'var(--color-expense)' }}>
            소득 대비 {monthlyAvgIncome > 0 ? Math.round((monthlyAvgExpense / monthlyAvgIncome) * 100) : 0}%
          </span>
          <span>현금/영수증 {(cashTotal / 10000).toFixed(1)}만 원</span>
        </div>
      </div>

      {/* 3. 월평균 순 잉여자금 */}
      <div className="wp-card kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">월 순 잉여 현금흐름</span>
          <div className="kpi-icon" style={{ background: 'var(--wp-blue-light)', color: 'var(--wp-navy-dark)' }}>
            <PiggyBank size={20} />
          </div>
        </div>
        <div>
          <div className="kpi-value num-font" style={{ color: totalNetCashflow >= 0 ? 'var(--wp-navy-dark)' : 'var(--color-expense)' }}>
            {(totalNetCashflow / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}
            <span style={{ fontSize: '1.05rem', fontWeight: 600, marginLeft: '0.2rem' }}>만 원</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            저축 및 투자 가능 유동성
          </div>
        </div>
        <div className="kpi-footer">
          <span className="kpi-pill" style={{ background: 'var(--wp-blue-light)', color: 'var(--wp-navy-dark)' }}>
            저축률 {savingsRate}%
          </span>
          <span>{savingsRate >= 30 ? '우수 (건전)' : '확대 필요'}</span>
        </div>
      </div>

      {/* 4. 권장 비상예비자금 */}
      <div className="wp-card kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">권장 비상예비자금 (4개월)</span>
          <div className="kpi-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            <ShieldCheck size={20} />
          </div>
        </div>
        <div>
          <div className="kpi-value num-font" style={{ color: 'var(--color-warning)' }}>
            {(recommendedEmergency / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
            <span style={{ fontSize: '1.05rem', fontWeight: 600, marginLeft: '0.2rem' }}>만 원</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            월 지출 기준 안전 버퍼
          </div>
        </div>
        <div className="kpi-footer">
          <span className="kpi-pill" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning)' }}>
            CMA / 파킹통장 권장
          </span>
          <span>유동성 확보 1순위</span>
        </div>
      </div>
    </div>
  );
}
