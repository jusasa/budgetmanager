// Shared Institutions Master Data (Client-safe, no Node.js dependencies)
export const INSTITUTIONS = [
  // 공공기관
  { id: 'hometax', name: '국세청 홈택스', type: 'tax', color: '#043873', bg: '#EBF4FE', category: '소득금액증명/연말정산' },

  // 은행
  { id: 'kb_bank', name: 'KB국민은행', type: 'bank', color: '#66594C', bg: '#FFF8E6', category: '입출금/예적금' },
  { id: 'shinhan_bank', name: '신한은행', type: 'bank', color: '#0046FF', bg: '#EBF0FF', category: '입출금/예적금' },
  { id: 'kakao_bank', name: '카카오뱅크', type: 'bank', color: '#3B1E1E', bg: '#FFFDE6', category: '입출금/모임통장' },
  { id: 'toss_bank', name: '토스뱅크', type: 'bank', color: '#0064FF', bg: '#EAF1FF', category: '수시입출금/비상금' },
  { id: 'woori_bank', name: '우리은행', type: 'bank', color: '#0067AC', bg: '#E8F3FA', category: '입출금/청약' },
  { id: 'hana_bank', name: '하나은행', type: 'bank', color: '#008485', bg: '#E6F5F5', category: '입출금/급여계좌' },
  { id: 'nh_bank', name: 'NH농협은행', type: 'bank', color: '#009E38', bg: '#E8F8EE', category: '입출금/예적금' },
  { id: 'ibk_bank', name: 'IBK기업은행', type: 'bank', color: '#004B9B', bg: '#EBF2FA', category: '입출금' },

  // 카드사
  { id: 'shinhan_card', name: '신한카드', type: 'card', color: '#0046FF', bg: '#EBF0FF', category: '신용/체크 승인' },
  { id: 'hyundai_card', name: '현대카드', type: 'card', color: '#1E1E1E', bg: '#F2F2F2', category: '신용카드 승인' },
  { id: 'samsung_card', name: '삼성카드', type: 'card', color: '#0C4DA2', bg: '#EAF1FA', category: '신용카드 승인' },
  { id: 'kb_card', name: 'KB국민카드', type: 'card', color: '#705B48', bg: '#F4F1EE', category: '신용/체크 승인' },
  { id: 'lotte_card', name: '롯데카드', type: 'card', color: '#ED1C24', bg: '#FDE8E9', category: '신용카드 승인' },
  { id: 'hana_card', name: '하나카드', type: 'card', color: '#008485', bg: '#E6F5F5', category: '신용/체크 승인' },
  { id: 'bc_card', name: 'BC카드', type: 'card', color: '#E51937', bg: '#FDE8EB', category: '체크/신용 승인' }
];
