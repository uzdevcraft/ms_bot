import type TelegramBot from 'node-telegram-bot-api';
import type { Update } from 'node-telegram-bot-api';

/**
 * Adapter for hosting frameworks (Express/Fastify): pass `req.body` after JSON parsing.
 */
export function createWebhookBodyProcessor(bot: TelegramBot) {
  return async (update: Update): Promise<void> => {
    await bot.processUpdate(update);
  };
}
