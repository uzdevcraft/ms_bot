import { isAxiosError } from 'axios';

/** For logs only — never includes request headers (secrets). */
export function loggableHttpError(err: unknown): Record<string, unknown> {
  if (isAxiosError(err)) {
    return {
      type: 'AxiosError',
      message: err.message,
      code: err.code,
      status: err.response?.status,
      statusText: err.response?.statusText,
      responseData: err.response?.data,
      url: err.config?.url,
      method: err.config?.method,
    };
  }
  if (err instanceof Error) {
    return { type: 'Error', name: err.name, message: err.message };
  }
  return { type: 'unknown', value: String(err) };
}
