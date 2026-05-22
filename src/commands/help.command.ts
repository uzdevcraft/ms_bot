import type TelegramBot from 'node-telegram-bot-api';
import type { CommandContext, CommandHandler } from './command.types.js';

const HELP_PATTERN = /^\/help(?:@\w+)?(?:\s|$)/i;

export function registerHelpCommand(bot: TelegramBot, ctx: CommandContext): void {
  const handler: CommandHandler = async (_c, b, msg) => {
    await b.sendMessage(
      msg.chat.id,
      [
        'Available commands:',
        '/start — connect your Telegram account to the marketplace',
        '/help — show this message',
        '/admin_ping — admin connectivity check (admins only)',
      ].join('\n'),
      { disable_web_page_preview: true },
    );
  };

  bot.onText(HELP_PATTERN, (msg) => {
    void handler(ctx, bot, msg);
  });
}
