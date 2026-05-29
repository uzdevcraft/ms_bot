import axios, { type AxiosInstance } from 'axios';
import axiosRetry from 'axios-retry';
import type { AppConfig } from '../config/env.js';
import { INTERNAL_API_KEY_HEADER } from '../config/constants.js';
import type { Logger } from '../logging/logger.js';

export function createBackendHttpClient(config: AppConfig, log: Logger): AxiosInstance {
  const client = axios.create({
    baseURL: config.BACKEND_API_URL.replace(/\/$/, ''),
    timeout: 15_000,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      [INTERNAL_API_KEY_HEADER]: config.INTERNAL_API_KEY,
    },
    validateStatus: (status) => status >= 200 && status < 300,
  });

  axiosRetry(client, {
    retries: 3,
    retryDelay: axiosRetry.exponentialDelay,
    retryCondition: (error) => {
      if (axiosRetry.isNetworkError(error) || error.code === 'ECONNABORTED') return true;
      const status = error.response?.status;
      if (status === 408 || status === 429) return true;
      // 500 is usually an application bug; retrying duplicates load. Prefer 502/503/504 for transient outages.
      if (status === 502 || status === 503 || status === 504) return true;
      return false;
    },
    onRetry: (retryCount, error, requestConfig) => {
      log.warn(
        {
          retryCount,
          url: requestConfig.url,
          method: requestConfig.method,
          code: error.code,
          status: error.response?.status,
        },
        'Retrying backend request',
      );
    },
  });

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      const status = error.response?.status;
      const data = error.response?.data;
      log.error(
        {
          err: error.message,
          code: error.code,
          status,
          data: typeof data === 'object' ? data : String(data),
          url: error.config?.url,
          method: error.config?.method,
        },
        'Backend request failed',
      );
      return Promise.reject(error);
    },
  );

  return client;
}
