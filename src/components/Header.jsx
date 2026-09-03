import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, RefreshCw, Trash2, Sun, Moon, Sparkles, TrendingUp } from 'lucide-react';
import { getSessionRemainingSeconds, renewSessionTimer } from '../utils/security';

export default function Header({ onClearAllData, theme, onToggleTheme, onShowNotification }) {
  const [remainingSec, setRemainingSec] = useState(getSessionRemainingSeconds());

  useEffect(() => {
    const interval = setInterval(() => {
      const sec = getSessionRemainingSeconds();
      setRemainingSec(sec);
      if (sec <= 0) {
        onShowNotification('보안을 위해 세션이 만료되었습니다. 데이터가 초기화되었습니다.', 'warning');
        onClearAllData();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onClearAllData, onShowNotification]);

  const handleRenew = () => {
    renewSessionTimer();
    setRemainingSec(getSessionRemainingSeconds());
    onShowNotification('보안 세션이 15분 연장되었습니다.', 'success');
  };

  const handlePanicClear = () => {
    if (window.confirm('브라우저 세션에 보관된 모든 금융 데이터와 내역을 즉시 완전히 파기하시겠습니까?')) {
      onClearAllData();
      onShowNotification('모든 로컬 금융 데이터가 영구 파기되었습니다.', 'info');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <header className="header-container">
      <div className="brand-section">
        <div className="brand-icon">
          <TrendingUp size={24} />
        </div>
        <div>
          <div className="brand-title">
            <span>FinWise 자산패턴 랩</span>
            <span className="brand-badge">MVP</span>
          </div>
          <div className="brand-subtitle">
            최근 1년 수입·소비 패턴 분석 및 통계청 벤치마크 자산관리
          </div>
        </div>
      </div>

      <div className="controls-section">
        {/* 보안 감사 인디케이터 */}
        <div className="privacy-badge" title="모든 원천 금융 데이터는 브라우저 내부 세션에만 존재하며 외부 서버로 저장되지 않습니다.">
          <span className="dot"></span>
          <ShieldCheck size={14} />
          <span>로컬 세션 격리 (Zero-Knowledge)</span>
        </div>

        {/* 실시간 세션 타이머 */}
        <div className="timer-box">
          <Clock size={14} />
          <span>세션:</span>
          <span className="timer-count">{formatTime(remainingSec)}</span>
          <button className="btn-extend" onClick={handleRenew} title="세션 15분 연장">
            연장
          </button>
        </div>

        {/* 데이터 즉시 파기 (Panic Button) */}
        <button 
          className="btn-panic" 
          onClick={handlePanicClear}
          title="브라우저 세션 내 모든 데이터 즉시 파기"
        >
          <Trash2 size={14} />
          <span>데이터 파기</span>
        </button>

        {/* 테마 토글 */}
        <button 
          className="theme-toggle" 
          onClick={onToggleTheme} 
          title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>
      </div>
    </header>
  );
}
