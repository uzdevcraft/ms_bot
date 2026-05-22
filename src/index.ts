import 'dotenv/config';
import type TelegramBot from 'node-telegram-bot-api';
import { loadEnv } from './config/env.js';
import { createLogger } from './logging/logger.js';
import { createBotApplication } from './bot/bot-factory.js';
import { startTelegramWebhookServer } from './runtime/webhook-server.js';

async function shutdown(
  signal: string,
  opts: {
    log: ReturnType<typeof createLogger>;
    bot: TelegramBot;
    mode: 'polling' | 'webhook';
    closeWebhook?: () => Promise<void>;
  },
): Promise<void> {
  const { log, bot, mode, closeWebhook } = opts;
  log.info({ signal }, 'Shutting down');

  try {
    if (mode === 'webhook') {
      await closeWebhook?.();
      await bot.deleteWebHook();
    } else {
      await bot.stopPolling();
    }
  } catch (err) {
    log.error({ err }, 'Error during shutdown');
  } finally {
    process.exit(0);
  }
}

async function main(): Promise<void> {
  const config = loadEnv();
  const log = createLogger(config);
  const { bot } = createBotApplication(config, log);

  let closeWebhook: (() => Promise<void>) | undefined;

  if (config.BOT_MODE === 'webhook') {
    const handle = await startTelegramWebhookServer(bot, config, log);
    closeWebhook = () => handle.close();
    log.info('Telegram webhook mode active');
  } else {
    await bot.startPolling();
    log.info('Telegram long polling active');
  }

  const onSignal = (signal: NodeJS.Signals) => {
    void shutdown(signal, { log, bot, mode: config.BOT_MODE, closeWebhook });
  };

  process.once('SIGINT', onSignal);
  process.once('SIGTERM', onSignal);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
