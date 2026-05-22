import type { AppConfig } from '../config/env.js';
import type { NotificationService } from './notification.service.js';
import type { Logger } from '../logging/logger.js';

/**
 * Fan-out to configured admin Telegram IDs for operational visibility.
 */
export class AdminNotifierService {
  constructor(
    private readonly notifications: NotificationService,
    private readonly config: AppConfig,
    private readonly log: Logger,
  ) {}

  get hasAdmins(): boolean {
    return this.config.TELEGRAM_ADMIN_IDS.length > 0;
  }

  isAdmin(telegramUserId: number): boolean {
    return this.config.TELEGRAM_ADMIN_IDS.includes(telegramUserId);
  }

  async notify(text: string): Promise<void> {
    if (!this.hasAdmins) {
      this.log.debug('Admin notify skipped: TELEGRAM_ADMIN_IDS not configured');
      return;
    }

    await Promise.allSettled(
      this.config.TELEGRAM_ADMIN_IDS.map((id) => this.notifications.sendText(id, text)),
    );
  }
}
