import React from 'react';
import { Clock, Sun, Moon, Coffee, ShoppingBag } from 'lucide-react';

export default function TimePatternChart({ hourlyPattern = [], timeBlocks = [], dayOfWeekPattern = [], peakWindow = '', weekendRatio = 0 }) {
  // 24시간 중 최대 지출 시간 금액
  const maxHourAmount = Math.max(...hourlyPattern.map((h) => h.amount), 1);

  return (
    <div className="wp-card">
      <div className="chart-header">
        <div className="chart-title-group">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <Clock size={20} style={{ color: 'var(--wp-blue-primary)' }} />
            <h3>소비 시간대 및 요일별 지출 패턴</h3>
          </div>
          <p className="chart-subtitle">
            언제 결제가 집중되는지(점심, 퇴근 후, 심야) 시간대별 라이프스타일을 진단합니다.
          </p>
        </div>

        <div style={{
          padding: '0.35rem 0.8rem', borderRadius: 'var(--radius-full)',
          background: 'var(--wp-blue-light)', color: 'var(--wp-navy-dark)',
          fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem'
        }}>
          <span>최대 소비 구간:</span>
          <strong style={{ color: 'var(--wp-blue-hover)' }}>{peakWindow}</strong>
        </div>
      </div>

      {/* 1. 시간대 블록 카드 4분할 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {timeBlocks.map((block) => (
          <div key={block.label} style={{
            background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: '10px', padding: '0.75rem 0.85rem'
          }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
              {block.label}
            </div>
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-navy)' }}>
              {(block.amount / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 })}만 원
            </div>
          </div>
        ))}
      </div>

      {/* 2. 24시간 미니 히스토그램 */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.6rem' }}>
          24시간 소비 타임라인 (0시 ~ 23시)
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '65px', padding: '0 4px', background: 'var(--wp-blue-tint)', borderRadius: '8px' }}>
          {hourlyPattern.map((h) => {
            const heightPercent = Math.max(6, Math.round((h.amount / maxHourAmount) * 100));
            const isPeak = (h.hour >= 18 && h.hour <= 21) || (h.hour >= 12 && h.hour <= 13);
            return (
              <div 
                key={h.hour}
                title={`${h.hour}시 지출: ${(h.amount).toLocaleString()}원`}
                style={{
                  flex: 1,
                  height: `${heightPercent}%`,
                  background: isPeak ? 'var(--wp-blue-primary)' : 'rgba(79, 156, 249, 0.4)',
                  borderRadius: '2px 2px 0 0',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease'
                }}
              />
            );
          })}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          <span>0시 (새벽)</span>
          <span>12시 (점심)</span>
          <span>19시 (퇴근/저녁)</span>
          <span>23시 (심야)</span>
        </div>
      </div>

      {/* 3. 요일별 분포 & 주말 소비 비중 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', flexWrap: 'wrap', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {dayOfWeekPattern.map((d) => (
            <div key={d.name} style={{
              textAlign: 'center', padding: '0.4rem 0.55rem', borderRadius: '8px',
              background: d.isWeekend ? 'var(--wp-yellow-accent)' : 'var(--bg-surface-elevated)',
              color: d.isWeekend ? 'var(--wp-navy-dark)' : 'var(--text-primary)',
              fontSize: '0.78rem', fontWeight: 700
            }}>
              <div>{d.name}</div>
              <div style={{ fontSize: '0.68rem', fontWeight: 500, marginTop: '2px' }}>
                {(d.amount / 10000).toFixed(0)}만
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>주말(토/일) 지출 비중</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--wp-navy-dark)' }}>
            {weekendRatio}%
            <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '0.3rem' }}>
              (주중 {100 - weekendRatio}%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
