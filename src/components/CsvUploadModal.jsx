import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseLedgerCsv, generateSampleCsvContent } from '../utils/csvParser';

export default function CsvUploadModal({ isOpen, onClose, onCsvImported, onShowNotification }) {
  const [file, setFile] = useState(null);
  const [parsedRows, setParsedRows] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleDownloadSample = () => {
    const csvContent = generateSampleCsvContent();
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'finwise_가계부_샘플_템플릿.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowNotification('샘플 가계부 CSV 템플릿이 다운로드되었습니다.', 'info');
  };

  const processCsvFile = (selectedFile) => {
    if (!selectedFile) return;
    setErrorMsg('');
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const rows = parseLedgerCsv(text);
        if (rows.length === 0) {
          throw new Error('유효한 거래 내역이 없습니다.');
        }
        setParsedRows(rows);
      } catch (err) {
        console.error(err);
        setErrorMsg(err.message || 'CSV 파싱에 실패했습니다.');
        setParsedRows([]);
      }
    };
    reader.readAsText(selectedFile, 'UTF-8');
  };

  const handleFileChange = (e) => {
    const selected = e.target.files && e.target.files[0];
    if (selected) processCsvFile(selected);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
      processCsvFile(e.dataTransfer.files[0]);
    }
  };

  const handleApply = () => {
    if (parsedRows.length === 0) return;
    onCsvImported(parsedRows);
    onShowNotification(`${parsedRows.length}건의 가계부 데이터가 성공적으로 반영되었습니다.`, 'success');
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setParsedRows([]);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.15)', color: 'var(--color-income)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem' }}>가계부 CSV 파일 업로드</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                기존에 기록해둔 엑셀이나 가계부 CSV 파일을 불러와 분석합니다.
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={handleClose}>
            <X size={18} />
          </button>
        </div>

        {/* 템플릿 다운로드 배너 */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'var(--wp-blue-tint)', border: '1px solid rgba(79, 156, 249, 0.25)',
          borderRadius: '12px', padding: '0.85rem 1rem', marginBottom: '1.25rem'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--wp-navy-dark)' }}>
              표준 가계부 양식이 필요하신가요?
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              날짜, 상호, 카테고리, 금액 등이 정의된 템플릿을 내려받아 작성하세요.
            </div>
          </div>
          <button 
            type="button" 
            className="btn-wp-accent" 
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
            onClick={handleDownloadSample}
          >
            <Download size={14} />
            <span>샘플 CSV 받기</span>
          </button>
        </div>

        {/* 드롭존 */}
        <label 
          className="dropzone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{ display: 'block', marginBottom: '1.25rem' }}
        >
          <input 
            type="file" 
            accept=".csv,text/csv" 
            style={{ display: 'none' }} 
            onChange={handleFileChange}
          />
          <UploadCloud size={40} style={{ color: 'var(--wp-blue-primary)', margin: '0 auto 0.75rem' }} />
          <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--wp-navy-dark)', marginBottom: '0.3rem' }}>
            {file ? file.name : '가계부 CSV 파일을 드래그하거나 클릭하여 선택'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            쉼표(,)로 구분된 CSV 파일 지원 (UTF-8 인코딩 권장)
          </div>
        </label>

        {errorMsg && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: 'var(--color-expense-bg)', color: 'var(--color-expense)',
            padding: '0.75rem', borderRadius: '8px', fontSize: '0.82rem', marginBottom: '1rem'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {parsedRows.length > 0 && (
          <div style={{
            background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)',
            borderRadius: '12px', padding: '1rem', marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-income)', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.6rem' }}>
              <CheckCircle2 size={16} />
              <span>총 {parsedRows.length}건의 거래 내역 파싱 성공</span>
            </div>
            <div style={{ maxHeight: '140px', overflowY: 'auto', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {parsedRows.slice(0, 5).map((r, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.3rem 0', borderBottom: '1px dashed var(--border-subtle)' }}>
                  <span>{r.date} | {r.name} ({r.category})</span>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{r.amount.toLocaleString()}원</span>
                </div>
              ))}
              {parsedRows.length > 5 && (
                <div style={{ textAlign: 'center', padding: '0.4rem 0', color: 'var(--text-muted)' }}>
                  ...외 {parsedRows.length - 5}건
                </div>
              )}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="btn-wp-outline" style={{ color: 'var(--text-primary)', borderColor: 'var(--border-subtle)' }} onClick={handleClose}>
            취소
          </button>
          <button 
            type="button" 
            className="btn-wp-primary" 
            disabled={parsedRows.length === 0}
            onClick={handleApply}
            style={{ opacity: parsedRows.length === 0 ? 0.6 : 1 }}
          >
            <span>분석에 데이터 반영</span>
          </button>
        </div>
      </div>
    </div>
  );
}
