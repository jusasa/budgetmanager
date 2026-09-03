// Server-Only Local Access Guard Middleware
// 서버 컴퓨터(127.0.0.1, ::1) 이외의 외부 IP 접속을 원천 차단

const ALLOWED_LOCAL_IPS = new Set([
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
  'localhost'
]);

export function localOnlyGuard(req, res, next) {
  const remoteIp = req.socket?.remoteAddress || req.ip || '';
  const cleanIp = remoteIp.replace('::ffff:', '');

  // 로컬 루프백 주소인지 엄격 검증
  if (ALLOWED_LOCAL_IPS.has(remoteIp) || ALLOWED_LOCAL_IPS.has(cleanIp)) {
    return next();
  }

  console.warn(`[Security Alert] Unauthorized external access attempt blocked: IP ${remoteIp} -> ${req.originalUrl}`);

  return res.status(403).json({
    error: 'Forbidden',
    message: '보안 정책에 따라 디버그 및 시뮬레이션 환경은 서버 로컬 컴퓨터(localhost) 이외의 외부 네트워크 접속이 엄격히 금지되어 있습니다.',
    clientIp: remoteIp,
    timestamp: new Date().toISOString()
  });
}
