import React, { useState } from 'react';
import { X, Receipt, UploadCloud, CheckCircle2, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';

export default function ReceiptModal({ isOpen, onClose, onAddCashExpense, onShowNotification }) {
  const [activeTab, setActiveTab] = useState('ocr'); // 'ocr' | 'manual'
  const [isProcessing, setIsProcessing] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  // 수기 입력 폼 상태
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [time, setTime] = useState('13:30');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('식비/카페');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  // 영수증 이미지 드롭/선택 시뮬레이션
  const handleFileDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    if (files && files[0]) {
      simulateOcr(files[0].name);
    }
  };

  const simulateOcr = (fileName) => {
    setIsProcessing(true);
    setTimeout(() => {
      // 현실적인 영수증 OCR 파싱 결과 모의
      const mockResult = {
        name: '스타벅스 강남대로점',
        date: new Date().toISOString().substring(0, 10),
        time: '14:20',
        amount: 14500,
        category: '식비/카페',
        items: ['아이스 아메리카노 T (4,500원)', '바닐라 라떼 G (5,500원)', '클래식 스콘 (4,500원)'],
        tax: 1318,
        approvalCode: '93810294'
      };
      setScannedResult(mockResult);
      setName(mockResult.name);
      setAmount(mockResult.amount);
      setCategory(mockResult.category);
      setDate(mockResult.date);
      setTime(mockResult.time);
      setIsProcessing(false);
    }, 900);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedAmount = parseInt(String(amount).replace(/[^0-9]/g, ''), 10);
    if (!name || isNaN(parsedAmount) || parsedAmount <= 0) {
      alert('상호명과 올바른 결제 금액을 입력해주세요.');
      return;
    }

    const newTx = {
      id: `receipt_tx_${Date.now()}`,
      date,
      time,
      hour: parseInt(time.split(':')[0], 10) || 12,
      dayOfWeek: new Date(date).getDay() || 1,
      name,
      category,
      amount: parsedAmount,
      paymentMethod: '현금(영수증)',
      isFixedExpense: false,
      note
    };

    onAddCashExpense(newTx);
    onShowNotification(`영수증 현금 지출(${parsedAmount.toLocaleString()}원)이 성공적으로 등록되었습니다.`, 'success');
    handleClose();
  };

  const handleClose = () => {
    setScannedResult(null);
    setName('');
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(79, 156, 249, 0.15)', color: 'var(--wp-navy-dark)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Receipt size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>영수증 업로드 & 현금 지출</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                종이 영수증이나 현금 결제액을 기록하여 누락 없는 소비 패턴을 완성합니다.
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* 탭 스위치 */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem' }}>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'ocr' ? 'active' : ''}`}
            onClick={() => setActiveTab('ocr')}
            style={{ flex: 1, justifyContent: 'center', padding: '0.6rem' }}
          >
            <Sparkles size={16} />
            <span>AI 스마트 영수증 OCR 스캔</span>
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
            style={{ flex: 1, justifyContent: 'center', padding: '0.6rem' }}
          >
            <Plus size={16} />
            <span>현금 지출 직접 입력</span>
          </button>
        </div>

        {activeTab === 'ocr' && (
          <div>
            {!scannedResult ? (
              <label 
                className="dropzone"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleFileDrop}
                style={{ display: 'block', marginBottom: '1.25rem' }}
              >
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileDrop}
                />
                <UploadCloud size={40} style={{ color: 'var(--wp-blue-primary)', margin: '0 auto 0.75rem' }} />
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--wp-navy-dark)', marginBottom: '0.3rem' }}>
                  {isProcessing ? '영수증 문자를 분석하는 중...' : '영수증 사진을 드래그하거나 클릭하여 업로드'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  JPG, PNG 영수증 이미지 자동 인식 (가게명, 일시, 금액, 품목 파싱)
                </div>
              </label>
            ) : (
              <div style={{
                background: 'var(--wp-blue-tint)', border: '1px solid rgba(79, 156, 249, 0.3)',
                borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: 'var(--color-income)', fontWeight: 700, fontSize: '0.85rem' }}>
                    <CheckCircle2 size={16} />
                    영수증 인식 완료
                  </span>
                  <button 
                    type="button" 
                    onClick={() => setScannedResult(null)}
                    style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textDecoration: 'underline' }}
                  >
                    다른 사진 올리기
                  </button>
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  상호: <strong>{scannedResult.name}</strong> | 금액: <strong>{scannedResult.amount.toLocaleString()}원</strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 입력 폼 */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">결제 일자</label>
              <input 
                type="date" 
                className="form-input" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">결제 시간</label>
              <input 
                type="time" 
                className="form-input" 
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">상호명 / 결제처</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="예: 스타벅스 강남점, 전통시장 청과" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">소비 카테고리</label>
              <select 
                className="form-select" 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="식비/카페">식비/카페</option>
                <option value="주거/통신/공과금">주거/통신/공과금</option>
                <option value="쇼핑/생활">쇼핑/생활</option>
                <option value="교통/차량">교통/차량</option>
                <option value="문화/여가/취미">문화/여가/취미</option>
                <option value="의료/건강">의료/건강</option>
                <option value="기타">기타</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">금액 (원)</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="예: 15000" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">간단 메모 (선택)</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="예: 현금 지출 영수증 챙김" 
              value={note} 
              onChange={(e) => setNote(e.target.value)} 
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button type="button" className="btn-wp-outline" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }} onClick={handleClose}>
              취소
            </button>
            <button type="submit" className="btn-wp-primary">
              <span>현금 지출 등록</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
