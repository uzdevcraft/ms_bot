import type TelegramBot from 'node-telegram-bot-api';
import type { CommandContext, CommandHandler } from './command.types.js';

const ADMIN_PING_PATTERN = /^\/admin_ping(?:@\w+)?(?:\s|$)/i;

export function registerAdminPingCommand(bot: TelegramBot, ctx: CommandContext): void {
  const handler: CommandHandler = async (c, b, msg) => {
    const from = msg.from;
    if (!from || !c.admins.isAdmin(from.id)) {
      await b.sendMessage(msg.chat.id, 'Unknown command.');
      return;
    }

    await b.sendMessage(msg.chat.id, 'Admin channel OK.', { disable_web_page_preview: true });
    await c.admins.notify(`Admin ${from.id} ran /admin_ping.`);
  };

  bot.onText(ADMIN_PING_PATTERN, (msg) => {
    void handler(ctx, bot, msg);
  });
}
