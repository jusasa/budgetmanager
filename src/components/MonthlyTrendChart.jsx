import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Info } from 'lucide-react';

export default function MonthlyTrendChart({ monthlyTrends = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!monthlyTrends || monthlyTrends.length === 0) {
    return null;
  }

  // 차트 스케일 계산
  const maxVal = Math.max(
    ...monthlyTrends.map((m) => Math.max(m.income, m.expense)),
    1000000
  );

  const chartHeight = 240;
  const chartWidth = 720;
  const barWidth = 14;
  const groupSpacing = chartWidth / (monthlyTrends.length || 1);

  // 최근 월과 전월 비교
  const lastMonth = monthlyTrends[monthlyTrends.length - 1];
  const prevMonth = monthlyTrends.length > 1 ? monthlyTrends[monthlyTrends.length - 2] : null;
  const expenseDiffPercent = prevMonth && prevMonth.expense > 0
    ? (((lastMonth.expense - prevMonth.expense) / prevMonth.expense) * 100).toFixed(1)
    : 0;

  return (
    <div className="wp-card" style={{ marginBottom: '2.25rem' }}>
      <div className="chart-header">
        <div className="chart-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <BarChart3 size={20} style={{ color: 'var(--wp-blue-primary)' }} />
            <h3>최근 12개월 수입 및 소비 추이 분석</h3>
          </div>
          <p className="chart-subtitle">
            월별 실질 소득과 카드·계좌 지출 흐름을 대조하여 현금흐름 잉여율을 추적합니다.
          </p>
        </div>

        {/* 범례 & 지표 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.82rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-income)' }}></span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>소득 (홈택스)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'var(--color-expense)' }}></span>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>지출 (금융데이터)</span>
          </div>
          {prevMonth && (
            <div style={{
              padding: '0.25rem 0.65rem', borderRadius: 'var(--radius-full)',
              background: Number(expenseDiffPercent) <= 0 ? 'var(--color-income-bg)' : 'var(--color-expense-bg)',
              color: Number(expenseDiffPercent) <= 0 ? 'var(--color-income)' : 'var(--color-expense)',
              fontWeight: 700, fontSize: '0.78rem'
            }}>
              전월 대비 지출 {Number(expenseDiffPercent) > 0 ? `+${expenseDiffPercent}%` : `${expenseDiffPercent}%`}
            </div>
          )}
        </div>
      </div>

      {/* SVG 반응형 차트 뷰포트 */}
      <div style={{ position: 'relative', width: '100%', overflowX: 'auto', padding: '0.5rem 0' }}>
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight + 50}`} 
          style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}
        >
          {/* 수평 보조 격자선 (3단계) */}
          {[0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = chartHeight - chartHeight * ratio;
            const labelVal = Math.round((maxVal * ratio) / 10000);
            return (
              <g key={idx}>
                <line 
                  x1="30" y1={y} x2={chartWidth - 10} y2={y} 
                  stroke="var(--border-subtle)" strokeDasharray="4 4" 
                />
                <text 
                  x="5" y={y + 4} 
                  fontSize="10" fill="var(--text-muted)" fontFamily="var(--font-display)"
                >
                  {labelVal}만
                </text>
              </g>
            );
          })}

          {/* 월별 수입/지출 바 그룹 */}
          {monthlyTrends.map((m, idx) => {
            const groupX = 40 + idx * ((chartWidth - 60) / monthlyTrends.length);
            const incomeH = (m.income / maxVal) * chartHeight;
            const expenseH = (m.expense / maxVal) * chartHeight;
            const isHovered = hoveredIdx === idx;

            return (
              <g 
                key={m.yearMonth}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* 호버 배경 하이라이트 */}
                {isHovered && (
                  <rect 
                    x={groupX - 10} y="0" 
                    width={barWidth * 2 + 28} height={chartHeight + 10} 
                    fill="var(--wp-blue-tint)" rx="6" opacity="0.6"
                  />
                )}

                {/* 수입 바 */}
                <rect 
                  x={groupX} 
                  y={chartHeight - incomeH} 
                  width={barWidth} 
                  height={Math.max(4, incomeH)} 
                  fill="var(--color-income)" 
                  rx="3" 
                  opacity={isHovered ? 1 : 0.85}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* 지출 바 */}
                <rect 
                  x={groupX + barWidth + 4} 
                  y={chartHeight - expenseH} 
                  width={barWidth} 
                  height={Math.max(4, expenseH)} 
                  fill="var(--color-expense)" 
                  rx="3" 
                  opacity={isHovered ? 1 : 0.85}
                  style={{ transition: 'all 0.2s ease' }}
                />

                {/* X축 월 레이블 */}
                <text 
                  x={groupX + barWidth + 2} 
                  y={chartHeight + 25} 
                  textAnchor="middle" 
                  fontSize="11" 
                  fontWeight={isHovered ? '700' : '500'}
                  fill={isHovered ? 'var(--wp-navy-dark)' : 'var(--text-secondary)'}
                  fontFamily="var(--font-main)"
                >
                  {m.displayMonth}
                </text>
              </g>
            );
          })}
        </svg>

        {/* 인터랙티브 툴팁 */}
        {hoveredIdx !== null && monthlyTrends[hoveredIdx] && (
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '20px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-strong)',
            borderRadius: '10px',
            padding: '0.85rem 1.1rem',
            boxShadow: 'var(--shadow-md)',
            fontSize: '0.82rem',
            pointerEvents: 'none',
            zIndex: 10
          }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--wp-navy-dark)', marginBottom: '0.4rem' }}>
              {monthlyTrends[hoveredIdx].yearMonth} 재무 내역
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.2rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>소득:</span>
              <strong style={{ color: 'var(--color-income)' }}>
                {(monthlyTrends[hoveredIdx].income).toLocaleString()}원
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.2rem', marginBottom: '0.25rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>지출:</span>
              <strong style={{ color: 'var(--color-expense)' }}>
                {(monthlyTrends[hoveredIdx].expense).toLocaleString()}원
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1.2rem', paddingTop: '0.35rem', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>잉여자금 (저축률):</span>
              <strong style={{ color: 'var(--wp-navy-dark)' }}>
                {(monthlyTrends[hoveredIdx].surplus).toLocaleString()}원 ({monthlyTrends[hoveredIdx].savingsRate}%)
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
