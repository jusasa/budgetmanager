import React, { useState } from 'react';
import { Landmark, Plus, CheckCircle2, Trash2, X, RefreshCw, ShieldCheck } from 'lucide-react';

export default function ConnectedInstitutionsBar({ 
  connectedInstitutions = [], 
  onOpenSyncModal, 
  onDisconnectInstitution, 
  onShowNotification 
}) {
  const [selectedInst, setSelectedInst] = useState(null);

  if (!connectedInstitutions || connectedInstitutions.length === 0) {
    return (
      <div style={{
        background: 'var(--wp-blue-tint)',
        border: '1.5px dashed rgba(79, 156, 249, 0.4)',
        borderRadius: '16px',
        padding: '1.1rem 1.4rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'var(--wp-blue-light)', color: 'var(--wp-navy-dark)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Landmark size={18} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--wp-navy-dark)' }}>
              연동된 금융기관이 없습니다
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              국민, 신한, 카카오뱅크, 현대카드 등 주거래 금융사를 연결하여 실시간 소비 패턴을 분석하세요.
            </div>
          </div>
        </div>

        <button className="btn-wp-primary" style={{ padding: '0.55rem 1.1rem', fontSize: '0.85rem' }} onClick={onOpenSyncModal}>
          <Plus size={15} />
          <span>금융기관 연동하기</span>
        </button>
      </div>
    );
  }

  const handleDisconnect = (inst) => {
    if (window.confirm(`${inst.name}의 연동을 해제하고 브라우저 세션에서 관련 거래내역을 제거하시겠습니까?`)) {
      onDisconnectInstitution(inst.id);
      setSelectedInst(null);
      onShowNotification(`${inst.name}의 연동이 안전하게 해제되었습니다.`, 'info');
    }
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px',
      padding: '0.95rem 1.4rem',
      marginBottom: '1.75rem',
      boxShadow: 'var(--shadow-sm)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.84rem', fontWeight: 800, color: 'var(--wp-navy-dark)' }}>
          <ShieldCheck size={16} style={{ color: 'var(--color-income)' }} />
          <span>연동된 금융기관 ({connectedInstitutions.length})</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {connectedInstitutions.map((inst) => (
            <div 
              key={inst.id}
              onClick={() => setSelectedInst(inst)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                background: inst.bg || 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: inst.color || 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title="클릭하여 상세 정보 조회 및 연결 해제"
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-income)' }}></span>
              <span>{inst.name}</span>
            </div>
          ))}
        </div>
      </div>

      <button 
        className="btn-wp-outline" 
        onClick={onOpenSyncModal}
        style={{
          color: 'var(--wp-navy-dark)',
          borderColor: 'var(--border-strong)',
          padding: '0.4rem 0.85rem',
          fontSize: '0.8rem',
          borderRadius: 'var(--radius-full)'
        }}
      >
        <Plus size={14} />
        <span>기관 추가</span>
      </button>

      {/* 기관 상세 및 연결 해제 팝오버 모달 */}
      {selectedInst && (
        <div className="modal-overlay" onClick={() => setSelectedInst(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '420px', padding: '1.5rem' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: selectedInst.bg || 'var(--wp-blue-light)',
                  color: selectedInst.color || 'var(--wp-navy-dark)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800
                }}>
                  {selectedInst.name[0]}
                </div>
                <h3 style={{ fontSize: '1.15rem' }}>{selectedInst.name} 연동 정보</h3>
              </div>
              <button className="modal-close" onClick={() => setSelectedInst(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', lineHeight: '1.6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>연동 분류:</span>
                <strong style={{ color: 'var(--text-primary)' }}>{selectedInst.category || selectedInst.type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span>데이터 보관:</span>
                <span style={{ color: 'var(--color-income)', fontWeight: 600 }}>브라우저 로컬 세션 (외부 전송 없음)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span>연동 상태:</span>
                <strong style={{ color: 'var(--color-income)' }}>정상 연결됨</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem' }}>
              <button 
                type="button" 
                className="btn-panic"
                onClick={() => handleDisconnect(selectedInst)}
                style={{ fontSize: '0.82rem', padding: '0.5rem 0.9rem' }}
              >
                <Trash2 size={14} />
                <span>연결 해제 및 데이터 삭제</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
