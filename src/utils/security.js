// Zero-Knowledge Security & Browser Session Management
const STORAGE_KEY = 'FINWISE_LOCAL_SESSION_DATA_V1';
const SESSION_TIMESTAMP_KEY = 'FINWISE_SESSION_EXPIRY';
export const SESSION_DURATION_MS = 15 * 60 * 1000; // 15분

export function getSessionData() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('[Security] Failed to read session storage', e);
    return null;
  }
}

export function saveSessionData(data) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    renewSessionTimer();
  } catch (e) {
    console.error('[Security] Failed to save session storage', e);
  }
}

export function clearSessionData() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (e) {
    console.error('[Security] Failed to wipe session data', e);
    return false;
  }
}

export function renewSessionTimer() {
  const expiryTime = Date.now() + SESSION_DURATION_MS;
  sessionStorage.setItem(SESSION_TIMESTAMP_KEY, String(expiryTime));
  return expiryTime;
}

export function getSessionRemainingSeconds() {
  const expiryStr = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);
  if (!expiryStr) {
    const freshExpiry = renewSessionTimer();
    return Math.floor((freshExpiry - Date.now()) / 1000);
  }
  const expiryTime = Number(expiryStr);
  const remaining = Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
  return remaining;
}
