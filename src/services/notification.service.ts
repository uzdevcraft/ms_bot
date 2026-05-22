import type TelegramBot from 'node-telegram-bot-api';
import type { Logger } from '../logging/logger.js';

export type SendTextOptions = Parameters<TelegramBot['sendMessage']>[2];

/**
 * Outbound user notifications. Callers supply copy only; delivery mechanics live here.
 */
export class NotificationService {
  constructor(
    private readonly bot: TelegramBot,
    private readonly log: Logger,
  ) {}

  async sendText(telegramId: number, text: string, options?: SendTextOptions): Promise<void> {
    try {
      await this.bot.sendMessage(telegramId, text, {
        disable_web_page_preview: true,
        ...options,
      });
    } catch (err) {
      this.log.error({ err, telegramId }, 'Failed to send notification');
      throw err;
    }
  }
}
