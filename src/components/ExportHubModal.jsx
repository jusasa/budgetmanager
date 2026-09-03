import React, { useState } from 'react';
import { X, Download, FileText, Image as ImageIcon, FileSpreadsheet, Printer, Copy, Check } from 'lucide-react';
import { exportAnalysisToCsv } from '../utils/csvParser';

export default function ExportHubModal({ isOpen, onClose, analytics, transactions = [], onShowNotification }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // 1. PDF 인쇄 (브라우저 Print -> PDF 저장)
  const handlePrintPdf = () => {
    onClose();
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // 2. CSV 내보내기
  const handleDownloadCsv = () => {
    const csvContent = exportAnalysisToCsv(
      analytics.monthlyTrends,
      analytics.categoryBreakdown,
      transactions
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `finwise_소비패턴_자산분석_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowNotification('전체 분석 데이터가 CSV 파일로 다운로드되었습니다.', 'success');
  };

  // 3. Canvas 기반 요약 이미지(PNG) 생성 및 다운로드
  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    // 배경 그리기
    const grad = ctx.createLinearGradient(0, 0, 1200, 630);
    grad.addColorStop(0, '#043873');
    grad.addColorStop(1, '#021833');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1200, 630);

    // 브랜드 로고 & 타이틀
    ctx.fillStyle = '#FFE492';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('FINWISE ASSET LAB', 80, 80);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 44px sans-serif';
    ctx.fillText('소비 패턴 및 자산관리 종합 진단 리포트', 80, 140);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '20px sans-serif';
    ctx.fillText(`분석 기준일: ${new Date().toLocaleDateString('ko-KR')} | 보안: 로컬 세션 격리`, 80, 180);

    // 4대 카드 박스 그리기
    const cards = [
      { label: '월평균 총소득', value: `${(analytics.monthlyAvgIncome / 10000).toFixed(0)}만 원`, color: '#10B981' },
      { label: '월평균 소비지출', value: `${(analytics.monthlyAvgExpense / 10000).toFixed(0)}만 원`, color: '#EF4444' },
      { label: '월 순 잉여금', value: `${(analytics.totalNetCashflow / 10000).toFixed(0)}만 원`, color: '#4F9CF9' },
      { label: '저축 및 투자율', value: `${analytics.savingsRate}%`, color: '#FFE492' }
    ];

    cards.forEach((c, idx) => {
      const x = 80 + idx * 265;
      const y = 230;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x, y, 245, 160);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.strokeRect(x, y, 245, 160);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '18px sans-serif';
      ctx.fillText(c.label, x + 20, y + 45);

      ctx.fillStyle = c.color;
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText(c.value, x + 20, y + 105);
    });

    // 하단 주요 인사이트
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(`• 최대 소비 카테고리: ${analytics.categoryBreakdown[0]?.category || '식비'} (${analytics.categoryBreakdown[0]?.percent || 0}%)`, 80, 460);
    ctx.fillText(`• 피크 소비 시간대: ${analytics.peakWindow} | 주말 지출 비중 ${analytics.weekendRatio}%`, 80, 500);
    ctx.fillText(`• 권장 비상예비자금: ${(analytics.monthlyAvgExpense * 4 / 10000).toFixed(0)}만 원 (4개월 분)`, 80, 540);

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `finwise_자산관리_요약_${new Date().toISOString().substring(0, 10)}.png`;
    link.click();
    onShowNotification('요약 이미지(PNG)가 다운로드되었습니다.', 'success');
  };

  // 4. PPT / 문서용 텍스트 복사
  const handleCopySummaryText = () => {
    const text = `[FinWise 소비 패턴 및 자산관리 요약 리포트]
• 월평균 소득: ${(analytics.monthlyAvgIncome / 10000).toFixed(0)}만 원
• 월평균 지출: ${(analytics.monthlyAvgExpense / 10000).toFixed(0)}만 원 (고정비 ${analytics.fixedExpenseRatio}%)
• 월 순 잉여금: ${(analytics.totalNetCashflow / 10000).toFixed(0)}만 원
• 저축 및 투자율: ${analytics.savingsRate}%
• 1순위 지출: ${analytics.categoryBreakdown[0]?.category} (${analytics.categoryBreakdown[0]?.percent}%)
• 주요 소비 시간대: ${analytics.peakWindow}
• 비상금 권장액: ${(analytics.monthlyAvgExpense * 4 / 10000).toFixed(0)}만 원`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowNotification('PPT 및 보고서용 요약 텍스트가 클립보드에 복사되었습니다.', 'info');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'var(--wp-blue-light)', color: 'var(--wp-navy-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Download size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>분석 결과 다중 포맷 내보내기</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                PDF 인쇄, CSV 데이터셋, 카드 이미지 등 원하는 포맷을 선택하세요.
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* 내보내기 옵션 카드 그리드 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* PDF 인쇄 */}
          <div 
            onClick={handlePrintPdf}
            style={{
              background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: '12px', padding: '1.2rem', cursor: 'pointer',
              transition: 'all 0.2s ease', textAlign: 'center'
            }}
            className="interactive"
          >
            <Printer size={32} style={{ color: 'var(--wp-blue-primary)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--wp-navy-dark)' }}>PDF 리포트 저장</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              인쇄 최적화 스타일로 PDF 저장
            </div>
          </div>

          {/* CSV 다운로드 */}
          <div 
            onClick={handleDownloadCsv}
            style={{
              background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: '12px', padding: '1.2rem', cursor: 'pointer',
              transition: 'all 0.2s ease', textAlign: 'center'
            }}
            className="interactive"
          >
            <FileSpreadsheet size={32} style={{ color: 'var(--color-income)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--wp-navy-dark)' }}>CSV 원본 데이터</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              엑셀 호환 UTF-8 BOM 내보내기
            </div>
          </div>

          {/* 이미지 (PNG) */}
          <div 
            onClick={handleDownloadPng}
            style={{
              background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: '12px', padding: '1.2rem', cursor: 'pointer',
              transition: 'all 0.2s ease', textAlign: 'center'
            }}
            className="interactive"
          >
            <ImageIcon size={32} style={{ color: 'var(--wp-yellow-accent)', margin: '0 auto 0.5rem' }} />
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--wp-navy-dark)' }}>요약 카드 (PNG)</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              SNS 및 발표용 고해상도 그래픽
            </div>
          </div>

          {/* PPT 클립보드 복사 */}
          <div 
            onClick={handleCopySummaryText}
            style={{
              background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
              borderRadius: '12px', padding: '1.2rem', cursor: 'pointer',
              transition: 'all 0.2s ease', textAlign: 'center'
            }}
            className="interactive"
          >
            {copied ? <Check size={32} style={{ color: 'var(--color-income)', margin: '0 auto 0.5rem' }} /> : <Copy size={32} style={{ color: 'var(--wp-blue-hover)', margin: '0 auto 0.5rem' }} />}
            <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--wp-navy-dark)' }}>
              {copied ? '복사 완료!' : 'PPT 요약 텍스트'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              발표 슬라이드용 클립보드 복사
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-wp-outline" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
