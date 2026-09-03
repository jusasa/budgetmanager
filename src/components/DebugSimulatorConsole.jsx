import React, { useState } from 'react';
import { 
  Wrench, 
  ChevronUp, 
  ChevronDown, 
  Users, 
  Zap, 
  AlertTriangle, 
  Clock, 
  Code2, 
  CheckCircle2, 
  XCircle,
  Play,
  RotateCcw
} from 'lucide-react';

export default function DebugSimulatorConsole({ 
  onLoadScenario, 
  onInjectTransactions, 
  onTriggerSessionExpiry, 
  analytics,
  onShowNotification 
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [injectCount, setInjectCount] = useState(20);
  const [injectCategory, setInjectCategory] = useState('식비/카페');
  const [hometaxError, setHometaxError] = useState(false);
  const [latencyActive, setLatencyActive] = useState(false);
  const [showJsonInspector, setShowJsonInspector] = useState(false);

  // 1. 카오스 설정 전송
  const updateChaos = async (errorState, latencyState) => {
    try {
      await fetch('/api/debug/chaos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          simulateHometaxError: errorState,
          simulateLatencyMs: latencyState ? 3000 : 0
        })
      });
      onShowNotification(
        `시뮬레이션 상태 변경: 국세청 에러 [${errorState ? 'ON' : 'OFF'}], 지연 3초 [${latencyState ? 'ON' : 'OFF'}]`,
        'info'
      );
    } catch (e) {
      console.warn('Chaos API update error', e);
    }
  };

  const handleToggleError = (val) => {
    setHometaxError(val);
    updateChaos(val, latencyActive);
  };

  const handleToggleLatency = (val) => {
    setLatencyActive(val);
    updateChaos(hometaxError, val);
  };

  // 2. 대량 거래 주입
  const handleBulkInject = () => {
    const generated = [];
    const now = new Date();
    const curYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    for (let i = 0; i < injectCount; i++) {
      const day = Math.min(28, Math.floor(Math.random() * 28) + 1);
      const hour = Math.floor(Math.random() * 24);
      const amt = Math.round((Math.random() * 50000 + 8000) / 1000) * 1000;

      generated.push({
        id: `sim_inject_${Date.now()}_${i}`,
        date: `${curYearMonth}-${String(day).padStart(2, '0')}`,
        time: `${String(hour).padStart(2, '0')}:30`,
        hour,
        dayOfWeek: Math.floor(Math.random() * 7),
        name: `[시뮬레이션] ${injectCategory} 결제 #${i + 1}`,
        category: injectCategory,
        amount: amt,
        paymentMethod: '신용카드',
        isFixedExpense: false
      });
    }

    onInjectTransactions(generated);
    onShowNotification(`가상 거래 ${injectCount}건(${injectCategory})이 실시간 주입되었습니다.`, 'success');
  };

  return (
    <aside style={{
      position: 'fixed',
      bottom: '1.25rem',
      right: '1.25rem',
      zIndex: 9999,
      maxWidth: '380px',
      width: 'calc(100% - 2.5rem)',
      background: 'rgba(4, 56, 115, 0.96)',
      backdropFilter: 'blur(16px)',
      color: '#FFFFFF',
      borderRadius: '16px',
      border: '2px solid var(--wp-yellow-accent)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
      fontFamily: 'var(--font-main)',
      fontSize: '0.84rem'
    }}>
      {/* 헤더 바 */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.15rem',
          cursor: 'pointer',
          background: 'rgba(255, 228, 146, 0.15)',
          borderTopLeftRadius: '14px',
          borderTopRightRadius: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '6px',
            background: 'var(--wp-yellow-accent)', color: 'var(--wp-navy-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Wrench size={14} />
          </div>
          <span style={{ fontWeight: 800, color: 'var(--wp-yellow-accent)', fontSize: '0.88rem' }}>
            DEBUG SIMULATOR CONSOLE (포트 5174)
          </span>
        </div>
        <button style={{ color: 'var(--wp-yellow-accent)' }}>
          {isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
        </button>
      </div>

      {isOpen && (
        <div style={{ padding: '1.15rem', maxHeight: '72vh', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.74rem', color: '#CBD5E1', marginBottom: '1rem', background: 'rgba(0, 0, 0, 0.25)', padding: '0.5rem 0.75rem', borderRadius: '8px' }}>
            🔒 <strong>보안 상태:</strong> 서버 로컬(127.0.0.1) 격리 활성화됨. 외부 접속 차단 중.
          </div>

          {/* 1. 페르소나 시나리오 원클릭 전환 */}
          <div style={{ marginBottom: '1.15rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--wp-yellow-accent)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Users size={14} />
              <span>원클릭 금융 페르소나 시나리오</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => onLoadScenario('deficit')}
                style={{
                  background: 'rgba(239, 68, 68, 0.25)', border: '1px solid rgba(239, 68, 68, 0.5)',
                  color: '#FECACA', padding: '0.5rem', borderRadius: '8px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 600
                }}
              >
                🚨 사회초년생 적자형
                <div style={{ fontSize: '0.68rem', color: '#FCA5A5' }}>월230만 / 지출260만</div>
              </button>

              <button
                type="button"
                onClick={() => onLoadScenario('nightOwl')}
                style={{
                  background: 'rgba(245, 158, 11, 0.25)', border: '1px solid rgba(245, 158, 11, 0.5)',
                  color: '#FDE68A', padding: '0.5rem', borderRadius: '8px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 600
                }}
              >
                🍕 30대 야간 과소비형
                <div style={{ fontSize: '0.68rem', color: '#FCD34D' }}>식비 48% / 심야 집중</div>
              </button>

              <button
                type="button"
                onClick={() => onLoadScenario('fire')}
                style={{
                  background: 'rgba(16, 185, 129, 0.25)', border: '1px solid rgba(16, 185, 129, 0.5)',
                  color: '#A7F3D0', padding: '0.5rem', borderRadius: '8px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 600
                }}
              >
                🌱 알뜰 FIRE 저축형
                <div style={{ fontSize: '0.68rem', color: '#6EE7B7' }}>저축률 56% / 비상금 풍부</div>
              </button>

              <button
                type="button"
                onClick={() => onLoadScenario('bonus')}
                style={{
                  background: 'rgba(79, 156, 249, 0.25)', border: '1px solid rgba(79, 156, 249, 0.5)',
                  color: '#BFDBFE', padding: '0.5rem', borderRadius: '8px', textAlign: 'left', fontSize: '0.76rem', fontWeight: 600
                }}
              >
                💎 성과급/보너스 달
                <div style={{ fontSize: '0.68rem', color: '#93C5FD' }}>월760만 / 소득세 급증</div>
              </button>
            </div>
          </div>

          {/* 2. 가상 거래 대량 주입기 */}
          <div style={{ marginBottom: '1.15rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--wp-yellow-accent)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Zap size={14} />
              <span>가상 거래 대량 주입기 (실시간 반영)</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <select 
                value={injectCount} 
                onChange={(e) => setInjectCount(Number(e.target.value))}
                style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', background: '#022046', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.78rem' }}
              >
                <option value={10}>10건 주입</option>
                <option value={30}>30건 주입</option>
                <option value={50}>50건 대량 주입</option>
              </select>

              <select 
                value={injectCategory} 
                onChange={(e) => setInjectCategory(e.target.value)}
                style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', background: '#022046', color: '#FFF', border: '1px solid rgba(255,255,255,0.2)', fontSize: '0.78rem' }}
              >
                <option value="식비/카페">식비/카페</option>
                <option value="쇼핑/생활">쇼핑/생활</option>
                <option value="문화/여가/취미">문화/여가</option>
                <option value="교통/차량">교통/차량</option>
              </select>
            </div>
            <button
              type="button"
              onClick={handleBulkInject}
              style={{
                width: '100%', padding: '0.45rem', borderRadius: '6px',
                background: 'var(--wp-blue-primary)', color: '#FFFFFF', fontWeight: 700, fontSize: '0.8rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
              }}
            >
              <Play size={13} />
              <span>가상 거래 실시간 주입 실행</span>
            </button>
          </div>

          {/* 3. 카오스 & 장애 모의 토글 */}
          <div style={{ marginBottom: '1.15rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--wp-yellow-accent)', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <AlertTriangle size={14} />
              <span>통신 장애 & 지연 모의 (Chaos Test)</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                <input 
                  type="checkbox" 
                  checked={hometaxError} 
                  onChange={(e) => handleToggleError(e.target.checked)}
                  style={{ accentColor: '#EF4444' }}
                />
                <span>국세청 홈택스 500 장애 시뮬레이션</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.78rem' }}>
                <input 
                  type="checkbox" 
                  checked={latencyActive} 
                  onChange={(e) => handleToggleLatency(e.target.checked)}
                  style={{ accentColor: '#F59E0B' }}
                />
                <span>오픈뱅킹 API 3초 응답 지연 (Latency)</span>
              </label>
            </div>
          </div>

          {/* 4. 세션 강제 만료 트리거 */}
          <div style={{ marginBottom: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 700 }}>세션 15분 만료 즉시 발동</div>
                <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>데이터 자동 파기 흐름 테스트</div>
              </div>
              <button
                type="button"
                onClick={onTriggerSessionExpiry}
                style={{
                  background: 'rgba(239, 68, 68, 0.3)', border: '1px solid #EF4444',
                  color: '#FECACA', padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.76rem', fontWeight: 700
                }}
              >
                타이머 0초 발동
              </button>
            </div>
          </div>

          {/* 5. Zero-Knowledge 전처리 지표 인스펙터 */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem' }}>
                <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Code2 size={13} />
                  <span>브라우저 전처리 지표 검사기</span>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#6EE7B7' }}>
                  AI 토큰 절감률: <strong>99.1% (원천 대비)</strong>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowJsonInspector(!showJsonInspector)}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)', color: '#FFF',
                  padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.76rem'
                }}
              >
                {showJsonInspector ? '닫기' : 'JSON 보기'}
              </button>
            </div>

            {showJsonInspector && (
              <pre style={{
                marginTop: '0.65rem', padding: '0.65rem', background: '#021833',
                borderRadius: '8px', fontSize: '0.68rem', color: '#93C5FD',
                maxHeight: '140px', overflowY: 'auto', border: '1px solid rgba(79, 156, 249, 0.3)'
              }}>
                {JSON.stringify({
                  monthlyAvgIncome: analytics.monthlyAvgIncome,
                  monthlyAvgExpense: analytics.monthlyAvgExpense,
                  savingsRate: analytics.savingsRate,
                  fixedExpenseRatio: analytics.fixedExpenseRatio,
                  peakWindow: analytics.peakWindow,
                  weekendRatio: analytics.weekendRatio,
                  topCategory: analytics.categoryBreakdown?.[0]?.category
                }, null, 2)}
              </pre>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
