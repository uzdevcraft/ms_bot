import { isAxiosError } from 'axios';

function sanitizeCode(raw: string): string {
  const trimmed = raw.trim().slice(0, 64);
  const sanitized = trimmed.replace(/[^a-zA-Z0-9_-]/g, '_');
  return sanitized || 'UNKNOWN';
}

function backendErrorCode(data: unknown): string | undefined {
  if (!data || typeof data !== 'object') return undefined;

  const record = data as Record<string, unknown>;
  for (const key of ['code', 'error_code', 'errorCode'] as const) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return sanitizeCode(value);
  }

  const nested = record.error;
  if (nested && typeof nested === 'object') {
    const nestedCode = (nested as Record<string, unknown>).code;
    if (typeof nestedCode === 'string' && nestedCode.trim()) return sanitizeCode(nestedCode);
  }

  return undefined;
}

/** Short code safe to show users for support/debug (no secrets or full response bodies). */
export function userFacingErrorCode(err: unknown): string {
  if (isAxiosError(err)) {
    const fromBody = backendErrorCode(err.response?.data);
    if (fromBody) return fromBody;
    if (err.response?.status) return `HTTP_${err.response.status}`;
    if (err.code) return sanitizeCode(err.code);
    return 'HTTP_ERROR';
  }

  if (err instanceof Error) {
    if (err.name) return sanitizeCode(err.name);
    return 'ERROR';
  }

  return 'UNKNOWN';
}

export function formatBotErrorMessage(userMessage: string, err: unknown): string {
  return `${userMessage}\n\n(Xato kodi: ${userFacingErrorCode(err)})`;
}
