import { z } from 'zod';
import { DEFAULT_LISTEN_PORT } from './constants.js';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z
    .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
    .default('info'),
  BOT_TOKEN: z.string().min(1, 'BOT_TOKEN is required'),
  BACKEND_API_URL: z.string().url('BACKEND_API_URL must be a valid URL'),
  INTERNAL_API_KEY: z.preprocess(
    (v) => (typeof v === 'string' ? v.trim() : v),
    z.string().min(1, 'INTERNAL_API_KEY is required'),
  ),
  WEB_APP_URL: z.string().url('WEB_APP_URL must be a valid URL'),
  TELEGRAM_ADMIN_IDS: z
    .string()
    .optional()
    .transform((raw) => {
      if (!raw?.trim()) return [] as number[];
      return raw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => Number(s))
        .filter((n) => Number.isFinite(n));
    }),
  BOT_MODE: z.enum(['polling', 'webhook']).default('polling'),
  WEBHOOK_PUBLIC_URL: z.string().url().optional(),
  WEBHOOK_PORT: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.coerce.number().int().positive().default(DEFAULT_LISTEN_PORT),
  ),
  TELEGRAM_WEBHOOK_SECRET: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.string().min(8).optional(),
  ),
  /** Process listen port for webhook mode. Overrides URL-derived port when set. */
  PORT: z.preprocess(
    (v) => (v === '' || v === undefined ? undefined : v),
    z.coerce.number().int().positive().optional(),
  ),
});

export type AppConfig = z.infer<typeof envSchema>;

let cached: AppConfig | null = null;

export function loadEnv(overrides?: Record<string, string | undefined>): AppConfig {
  if (cached && !overrides) return cached;

  const parsed = envSchema.safeParse({ ...process.env, ...overrides });
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    throw new Error(`Invalid environment: ${JSON.stringify(msg)}`);
  }

  const config = parsed.data;

  if (config.BOT_MODE === 'webhook') {
    if (!config.WEBHOOK_PUBLIC_URL) {
      throw new Error('WEBHOOK_PUBLIC_URL is required when BOT_MODE=webhook');
    }
  }

  return config;
}

export function resetEnvCacheForTests(): void {
  cached = null;
}
