import React from 'react';
import { PieChart, Layers, ArrowRight } from 'lucide-react';

export default function CategoryBreakdown({ categoryBreakdown = [] }) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) return null;

  // 전체 지출 합계
  const totalExpense = categoryBreakdown.reduce((sum, c) => sum + c.totalAmount, 0);

  // SVG 도넛 차트 계산
  let cumulativePercent = 0;
  const radius = 80;
  const strokeWidth = 28;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="wp-card">
      <div className="chart-header">
        <div className="chart-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <PieChart size={20} style={{ color: 'var(--wp-blue-primary)' }} />
            <h3>업종 및 카테고리별 소비 비중</h3>
          </div>
          <p className="chart-subtitle">
            어디에 가장 많은 지출이 일어나는지 직관적인 비중으로 파악합니다.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', flexWrap: 'wrap', padding: '1rem 0' }}>
        {/* SVG 도넛 */}
        <div style={{ position: 'relative', width: '210px', height: '210px', flexShrink: 0 }}>
          <svg viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
            {categoryBreakdown.map((cat, i) => {
              const dashLength = (cat.percent / 100) * circumference;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += cat.percent;

              return (
                <circle
                  key={cat.category}
                  cx="110"
                  cy="110"
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashLength} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transition: 'stroke-dasharray 0.3s ease' }}
                />
              );
            })}
          </svg>
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            textAlign: 'center', pointerEvents: 'none'
          }}>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>총 지출</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-navy)', lineHeight: 1.2 }}>
              {(totalExpense / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}만
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>원</div>
          </div>
        </div>

        {/* 카테고리 랭킹 리스트 */}
        <div style={{ flex: 1, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {categoryBreakdown.map((cat, idx) => (
            <div key={cat.category}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem', fontSize: '0.86rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: cat.color }}></span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{cat.category}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({cat.count}건)</span>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-navy)' }}>
                  {(cat.totalAmount / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만 원
                  <span style={{ fontSize: '0.78rem', color: 'var(--wp-blue-hover)', marginLeft: '0.35rem' }}>({cat.percent}%)</span>
                </div>
              </div>
              {/* 진행률 바 */}
              <div style={{ height: '6px', width: '100%', background: 'var(--bg-surface-elevated)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${cat.percent}%`, background: cat.color, borderRadius: '3px' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
