import http from 'node:http';
import type TelegramBot from 'node-telegram-bot-api';
import type { Update } from 'node-telegram-bot-api';
import type { AppConfig } from '../config/env.js';
import type { Logger } from '../logging/logger.js';
import { getListenPort, getWebhookPathname, readJsonBody } from './http-utils.js';

export type WebhookServerHandle = {
  close: () => Promise<void>;
};

/**
 * Minimal HTTP entry for Telegram updates. Terminate TLS at your edge proxy in production.
 */
export async function startTelegramWebhookServer(
  bot: TelegramBot,
  config: AppConfig,
  log: Logger,
): Promise<WebhookServerHandle> {
  const publicUrl = config.WEBHOOK_PUBLIC_URL;
  if (!publicUrl) {
    throw new Error('WEBHOOK_PUBLIC_URL is required for webhook mode');
  }

  const pathname = getWebhookPathname(publicUrl);
  const listenPort = config.PORT ?? config.WEBHOOK_PORT ?? getListenPort(publicUrl);

  await bot.setWebHook(
    publicUrl,
    config.TELEGRAM_WEBHOOK_SECRET
      ? { secret_token: config.TELEGRAM_WEBHOOK_SECRET }
      : undefined,
  );

  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);

      if (req.method === 'GET' && (url.pathname === '/health' || url.pathname === '/')) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' }).end('ok');
        return;
      }

      if (req.method !== 'POST') {
        res.writeHead(405).end();
        return;
      }

      if (url.pathname !== pathname) {
        res.writeHead(404).end();
        return;
      }

      if (config.TELEGRAM_WEBHOOK_SECRET) {
        const token = req.headers['x-telegram-bot-api-secret-token'];
        if (token !== config.TELEGRAM_WEBHOOK_SECRET) {
          res.writeHead(401).end();
          return;
        }
      }

      const body = await readJsonBody(req, res);
      if (body === null) return;

      await bot.processUpdate(body as Update);
      res.writeHead(200).end();
    } catch (err) {
      log.error({ err: err instanceof Error ? err.message : String(err) }, 'Webhook handler error');
      if (!res.headersSent) res.writeHead(500).end();
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.listen(listenPort, () => resolve());
    server.on('error', reject);
  });

  log.info({ listenPort, pathname, publicUrl }, 'Webhook server listening');

  return {
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
