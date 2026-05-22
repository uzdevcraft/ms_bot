import type TelegramBot from 'node-telegram-bot-api';
import type { CommandContext } from './command.types.js';
import { registerStartCommand } from './start.command.js';
import { registerHelpCommand } from './help.command.js';
import { registerAdminPingCommand } from './admin.command.js';

export function registerCommandHandlers(bot: TelegramBot, ctx: CommandContext): void {
  registerStartCommand(bot, ctx);
  registerHelpCommand(bot, ctx);
  registerAdminPingCommand(bot, ctx);
}
