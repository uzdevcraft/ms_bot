import type TelegramBot from 'node-telegram-bot-api';
import type { AppConfig } from '../config/env.js';
import type { Logger } from '../logging/logger.js';
import type { TelegramUserSyncService } from '../services/telegram-user-sync.service.js';
import type { NotificationService } from '../services/notification.service.js';
import type { AdminNotifierService } from '../services/admin-notifier.service.js';
import type { OnboardingCoordinator } from '../onboarding/onboarding-coordinator.js';

export type CommandContext = {
  config: AppConfig;
  log: Logger;
  userSync: TelegramUserSyncService;
  notifications: NotificationService;
  admins: AdminNotifierService;
  onboarding: OnboardingCoordinator;
};

export type CommandHandler = (ctx: CommandContext, bot: TelegramBot, msg: TelegramBot.Message) => Promise<void>;
