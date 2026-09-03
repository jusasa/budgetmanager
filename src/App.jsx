import React, { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import OverviewSummary from './components/OverviewSummary';
import MonthlyTrendChart from './components/MonthlyTrendChart';
import CategoryBreakdown from './components/CategoryBreakdown';
import TimePatternChart from './components/TimePatternChart';
import BenchmarkComparison from './components/BenchmarkComparison';
import AssetAdvicePlan from './components/AssetAdvicePlan';
import DataSyncModal from './components/DataSyncModal';
import ReceiptModal from './components/ReceiptModal';
import CsvUploadModal from './components/CsvUploadModal';
import ExportHubModal from './components/ExportHubModal';
import DebugSimulatorConsole from './components/DebugSimulatorConsole';
import ConnectedInstitutionsBar from './components/ConnectedInstitutionsBar';

import { analyzeFinancialDataset } from './utils/analytics';
import { getSessionData, saveSessionData, clearSessionData } from './utils/security';
import { getDefaultSampleData } from './utils/mockData';
import { getScenarioDataset } from './utils/scenarioPresets';

import { 
  Landmark, 
  Receipt, 
  FileSpreadsheet, 
  Download, 
  Sparkles, 
  ShieldCheck, 
  BarChart3, 
  PieChart, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Database
} from 'lucide-react';

export default function App() {
  // Theme state: default 'light' per Whitepace SaaS reference, toggleable to 'dark'
  const [theme, setTheme] = useState('light');

  // Core Financial Data State (Local Session)
  const [financialData, setFinancialData] = useState(() => {
    const saved = getSessionData();
    if (saved) return saved;
    // 기본으로 풍부한 샘플 데이터를 로드하여 접속 즉시 차트와 분석을 바로 볼 수 있도록 지원
    return getDefaultSampleData();
  });

  // Modal open states
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Active Tab: 'overview' | 'breakdown' | 'advice' | 'transactions'
  const [activeTab, setActiveTab] = useState('overview');

  // 디버그 포트(5174) 또는 쿼리 파라미터(?debug=true) 감지
  const isDebugMode = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return window.location.port === '5174' || window.location.search.includes('debug=true');
  }, []);

  // Toast Notification
  const [toast, setToast] = useState(null);

  // Apply Theme Attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Save changes to session storage
  useEffect(() => {
    if (financialData) {
      saveSessionData(financialData);
    }
  }, [financialData]);

  const showNotification = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // 브라우저 엔진 내 실시간 지표 전처리 (AI 토큰 및 서버 부하 절감)
  const analytics = useMemo(() => {
    if (!financialData) return { hasData: false };
    return analyzeFinancialDataset(financialData.monthlyIncome, financialData.transactions);
  }, [financialData]);

  // 1. 국세청 & 금융기관 연동 완료 핸들러
  const handleSyncComplete = (newData) => {
    setFinancialData(newData);
  };

  // 2. 현금 영수증 추가 핸들러
  const handleAddCashExpense = (newTx) => {
    setFinancialData((prev) => {
      const existingTx = prev?.transactions || [];
      return {
        ...prev,
        transactions: [newTx, ...existingTx]
      };
    });
  };

  // 3. 가계부 CSV 데이터 가져오기 핸들러
  const handleCsvImported = (newRows) => {
    setFinancialData((prev) => {
      const existingTx = prev?.transactions || [];
      return {
        ...prev,
        transactions: [...newRows, ...existingTx]
      };
    });
  };

  // 4. 데이터 초기화 (Panic Button)
  const handleClearAllData = () => {
    clearSessionData();
    setFinancialData({
      meta: { dataSource: [], period: '' },
      hometax: null,
      monthlyIncome: [],
      transactions: []
    });
  };

  // 5. 샘플 데이터 다시 채우기
  const handleLoadSample = () => {
    const sample = getDefaultSampleData();
    setFinancialData(sample);
    showNotification('12개월 기준 풍부한 한국형 표준 샘플 데이터가 로드되었습니다.', 'success');
  };

  // 6. [디버그 시뮬레이션] 페르소나 시나리오 로드
  const handleLoadScenario = (type) => {
    const scenarioDataset = getScenarioDataset(type);
    setFinancialData(scenarioDataset);
    showNotification(`[시뮬레이터] ${type.toUpperCase()} 시나리오 데이터셋이 로드되었습니다.`, 'success');
  };

  // 7. [디버그 시뮬레이션] 가상 거래 실시간 대량 주입
  const handleInjectTransactions = (injectedTxs) => {
    setFinancialData((prev) => ({
      ...prev,
      transactions: [...injectedTxs, ...(prev?.transactions || [])]
    }));
  };

  // 8. [디버그 시뮬레이션] 세션 강제 만료 트리거
  const handleTriggerSessionExpiry = () => {
    showNotification('🚨 [시뮬레이션] 15분 보안 세션이 즉시 만료되었습니다. 데이터 파기를 진행합니다.', 'warning');
    handleClearAllData();
  };

  // 9. 금융기관 연결 해제
  const handleDisconnectInstitution = (instId) => {
    setFinancialData((prev) => {
      const remainingInsts = (prev?.connectedInstitutions || []).filter((i) => i.id !== instId);
      const remainingTxs = (prev?.transactions || []).filter((t) => t.institutionId !== instId);
      return {
        ...prev,
        connectedInstitutions: remainingInsts,
        transactions: remainingTxs
      };
    });
  };

  return (
    <div className="app-container">
      {/* 고정 상단 헤더 & 보안 컨트롤 */}
      <Header 
        onClearAllData={handleClearAllData}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onShowNotification={showNotification}
      />

      {/* Whitepace SaaS 레퍼런스 스타일 Hero 배너 */}
      <section className="whitepace-hero">
        <div className="hero-tag">
          <Sparkles size={14} />
          <span>Next-Gen Smart Wealth Intelligence</span>
        </div>
        <h1 className="hero-title">
          수입과 소비 패턴을 분석하여<br />
          <span>가장 현명한 자산관리</span>를 완성하세요
        </h1>
        <p className="hero-desc">
          국세청 소득금액증명과 금융기관의 거래 데이터를 안전하게 연동하고,
          통계청 가계 벤치마크와 대조하여 나만의 최적 저축·지출 플랜을 도출합니다.
        </p>

        <div className="hero-actions">
          <button className="btn-wp-primary" onClick={() => setIsSyncOpen(true)}>
            <Landmark size={18} />
            <span>국세청 & 금융데이터 1-클릭 연동</span>
            <ArrowRight size={16} />
          </button>
          <button className="btn-wp-accent" onClick={() => setIsReceiptOpen(true)}>
            <Receipt size={18} />
            <span>영수증(현금) OCR 등록</span>
          </button>
          <button className="btn-wp-outline" onClick={() => setIsCsvOpen(true)}>
            <FileSpreadsheet size={18} />
            <span>가계부 CSV 업로드</span>
          </button>
        </div>

        <div className="hero-trust-row">
          <div className="hero-trust-item">
            <ShieldCheck size={16} style={{ color: 'var(--color-income)' }} />
            <span>Zero-Knowledge 로컬 세션 격리 (외부 유출 방지)</span>
          </div>
          <div className="hero-trust-item">
            <Sparkles size={16} style={{ color: 'var(--wp-blue-primary)' }} />
            <span>브라우저 엔진 내 실시간 지표 전처리</span>
          </div>
          <div className="hero-trust-item">
            <Database size={16} style={{ color: 'var(--wp-yellow-accent)' }} />
            <span>통계청 공공 가계 마이크로데이터 벤치마크</span>
          </div>
        </div>
      </section>

      {/* 연동된 금융기관 관리 바 */}
      <ConnectedInstitutionsBar
        connectedInstitutions={financialData?.connectedInstitutions || []}
        onOpenSyncModal={() => setIsSyncOpen(true)}
        onDisconnectInstitution={handleDisconnectInstitution}
        onShowNotification={showNotification}
      />

      {/* 퀵 툴바 & 데이터 조작 */}
      <div className="action-toolbar">
        <div className="button-group">
          <button className="btn-secondary" onClick={handleLoadSample}>
            <Database size={15} />
            <span>샘플 데이터로 즉시 체험</span>
          </button>
          <button className="btn-secondary" onClick={() => setIsExportOpen(true)}>
            <Download size={15} />
            <span>분석 리포트 내보내기 (PDF/CSV/이미지)</span>
          </button>
        </div>

        <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
          {financialData?.transactions?.length > 0 ? (
            <span>총 <strong style={{ color: 'var(--wp-navy-dark)' }}>{financialData.transactions.length}건</strong>의 거래 내역 집계 중</span>
          ) : (
            <span style={{ color: 'var(--color-warning)' }}>등록된 거래 내역이 없습니다. 연동이나 파일을 업로드해주세요.</span>
          )}
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <nav className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          <span>종합 자산 진단</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'breakdown' ? 'active' : ''}`}
          onClick={() => setActiveTab('breakdown')}
        >
          <PieChart size={16} />
          <span>소비 패턴 정밀 분석 (업종·시간대)</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'advice' ? 'active' : ''}`}
          onClick={() => setActiveTab('advice')}
        >
          <Sparkles size={16} />
          <span>스마트 자산관리 솔루션</span>
        </button>
        <button 
          className={`tab-btn ${activeTab === 'transactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('transactions')}
        >
          <Layers size={16} />
          <span>거래 내역 상세 ({financialData?.transactions?.length || 0})</span>
        </button>
      </nav>

      {/* 탭 콘텐츠 영역 */}
      {activeTab === 'overview' && (
        <main>
          {/* 1. 상단 KPI 카드 그리드 */}
          <OverviewSummary 
            analytics={analytics} 
            hometaxMeta={financialData?.hometax}
          />

          {/* 2. 12개월 추이 차트 */}
          <MonthlyTrendChart 
            monthlyTrends={analytics.monthlyTrends} 
          />

          {/* 3. 통계청 공공데이터 비교 */}
          <BenchmarkComparison 
            analytics={analytics} 
            onShowNotification={showNotification}
          />
        </main>
      )}

      {activeTab === 'breakdown' && (
        <main>
          <div className="charts-grid-2col">
            {/* 업종별 소비 비중 도넛 차트 */}
            <CategoryBreakdown 
              categoryBreakdown={analytics.categoryBreakdown} 
            />
            {/* 소비 시간대 & 요일별 패턴 */}
            <TimePatternChart 
              hourlyPattern={analytics.hourlyPattern}
              timeBlocks={analytics.timeBlocks}
              dayOfWeekPattern={analytics.dayOfWeekPattern}
              peakWindow={analytics.peakWindow}
              weekendRatio={analytics.weekendRatio}
            />
          </div>
        </main>
      )}

      {activeTab === 'advice' && (
        <main>
          <AssetAdvicePlan 
            analytics={analytics} 
            onShowNotification={showNotification}
          />
        </main>
      )}

      {activeTab === 'transactions' && (
        <main>
          <div className="wp-card">
            <div className="chart-header">
              <div className="chart-title-group">
                <h3>수집된 거래 및 소비 내역</h3>
                <p className="chart-subtitle">
                  국세청, 금융기관 연동 및 영수증 현금 지출 내역 전체 목록입니다.
                </p>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                    <th style={{ padding: '0.75rem 0.5rem' }}>일자</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>시간</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>결제처/상호명</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>카테고리</th>
                    <th style={{ padding: '0.75rem 0.5rem' }}>결제수단</th>
                    <th style={{ padding: '0.75rem 0.5rem', textAlign: 'right' }}>금액</th>
                  </tr>
                </thead>
                <tbody>
                  {(financialData?.transactions || []).slice(0, 50).map((tx, idx) => (
                    <tr key={tx.id || idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.65rem 0.5rem', fontFamily: 'var(--font-mono)' }}>{tx.date}</td>
                      <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-muted)' }}>{tx.time || '12:00'}</td>
                      <td style={{ padding: '0.65rem 0.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{tx.name}</td>
                      <td style={{ padding: '0.65rem 0.5rem' }}>
                        <span style={{
                          padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)',
                          background: 'var(--wp-blue-light)', color: 'var(--wp-navy-dark)',
                          fontSize: '0.75rem', fontWeight: 600
                        }}>
                          {tx.category}
                        </span>
                      </td>
                      <td style={{ padding: '0.65rem 0.5rem', color: 'var(--text-secondary)' }}>{tx.paymentMethod || '카드'}</td>
                      <td style={{ padding: '0.65rem 0.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--color-expense)' }}>
                        -{(tx.amount || 0).toLocaleString()}원
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(financialData?.transactions?.length || 0) > 50 && (
                <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  현재 상위 50건만 표시 중입니다. 전체 내역은 [리포트 내보내기 → CSV]로 내려받으실 수 있습니다.
                </div>
              )}
            </div>
          </div>
        </main>
      )}

      {/* 모달 팝업들 */}
      <DataSyncModal 
        isOpen={isSyncOpen}
        onClose={() => setIsSyncOpen(false)}
        onSyncComplete={handleSyncComplete}
        onShowNotification={showNotification}
      />

      <ReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        onAddCashExpense={handleAddCashExpense}
        onShowNotification={showNotification}
      />

      <CsvUploadModal 
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
        onCsvImported={handleCsvImported}
        onShowNotification={showNotification}
      />

      <ExportHubModal 
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        analytics={analytics}
        transactions={financialData?.transactions || []}
        onShowNotification={showNotification}
      />

      {/* Toast 알림 */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000,
          background: 'var(--wp-navy-dark)', color: '#FFFFFF',
          padding: '0.85rem 1.4rem', borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(4, 56, 115, 0.4)',
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          fontSize: '0.88rem', fontWeight: 600,
          animation: 'fadeIn 0.25s ease-out',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          {toast.type === 'success' && <CheckCircle2 size={18} style={{ color: 'var(--color-income)' }} />}
          {toast.type === 'warning' && <AlertCircle size={18} style={{ color: 'var(--color-warning)' }} />}
          {toast.type === 'info' && <Sparkles size={18} style={{ color: 'var(--wp-yellow-accent)' }} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* 디버그 포트(5174) 전용 시뮬레이터 콘솔 */}
      {isDebugMode && (
        <DebugSimulatorConsole
          onLoadScenario={handleLoadScenario}
          onInjectTransactions={handleInjectTransactions}
          onTriggerSessionExpiry={handleTriggerSessionExpiry}
          analytics={analytics}
          onShowNotification={showNotification}
        />
      )}
    </div>
  );
}
