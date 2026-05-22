import TelegramBot from 'node-telegram-bot-api';
import type { AppConfig } from '../config/env.js';
import type { Logger } from '../logging/logger.js';
import { createBackendHttpClient } from '../services/backend-http-client.js';
import { TelegramUserSyncService } from '../services/telegram-user-sync.service.js';
import { NotificationService } from '../services/notification.service.js';
import { AdminNotifierService } from '../services/admin-notifier.service.js';
import { registerCommandHandlers } from '../commands/register-commands.js';
import type { CommandContext } from '../commands/command.types.js';
import { OnboardingCoordinator } from '../onboarding/onboarding-coordinator.js';
import { registerOnboardingMessageHandlers } from '../handlers/onboarding-messages.handler.js';

export type BotApplication = {
  bot: TelegramBot;
  commandContext: CommandContext;
};

export function createBotApplication(config: AppConfig, log: Logger): BotApplication {
  const polling = config.BOT_MODE === 'polling';

  const bot = new TelegramBot(config.BOT_TOKEN, {
    polling: polling
      ? {
          interval: 300,
          autoStart: false,
        }
      : false,
  });

  const http = createBackendHttpClient(config, log);
  const userSync = new TelegramUserSyncService(http);
  const notifications = new NotificationService(bot, log);
  const admins = new AdminNotifierService(notifications, config, log);
  const onboarding = new OnboardingCoordinator();

  const commandContext: CommandContext = {
    config,
    log,
    userSync,
    notifications,
    admins,
    onboarding,
  };

  registerCommandHandlers(bot, commandContext);
  registerOnboardingMessageHandlers(bot, commandContext);

  bot.on('polling_error', (err) => {
    log.error({ err }, 'Telegram polling error');
  });

  bot.on('webhook_error', (err) => {
    log.error({ err }, 'Telegram webhook error');
  });

  bot.on('error', (err) => {
    log.error({ err }, 'Telegram client error');
  });

  return { bot, commandContext };
}
