import type TelegramBot from "node-telegram-bot-api";
import type {
  CommandContext,
  CommandHandler,
} from "./command.types.js";
import { handleRegisteredStart } from "../handlers/onboarding-messages.handler.js";

const START_PATTERN = /^\/start(?:@\w+)?(?:\s|$)/i;

export function registerStartCommand(
  bot: TelegramBot,
  ctx: CommandContext,
): void {
  const handler: CommandHandler = async (c, b, msg) => {
    const from = msg.from;
    if (!from) {
      c.log.warn({ chatId: msg.chat.id }, "/start without msg.from");
      return;
    }

    if (c.onboarding.isRegistered(from.id)) {
      await handleRegisteredStart(b, c, msg, from);
      return;
    }

    c.onboarding.begin(from.id);
    await b.sendMessage(
      msg.chat.id,
      "Siz hali autentifikatsiya qilinmagansiz. Davom etish uchun to'liq ismingiz va familiyangizni yozing (masalan: Ali Valiyev).",
      { reply_markup: { remove_keyboard: true } },
    );
  };

  bot.onText(START_PATTERN, (msg) => {
    void handler(ctx, bot, msg);
  });
}
