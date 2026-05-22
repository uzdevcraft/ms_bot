import type TelegramBot from 'node-telegram-bot-api';
import type { CommandContext } from '../commands/command.types.js';
import { contactRequestKeyboard } from '../telegram/contact-keyboard.js';
import { namePartsFromTelegramUser } from '../telegram/user-payload.mapper.js';
import {
  completeOnboardingSync,
  postUserSync,
  sendWelcomeWithWebApp,
} from '../telegram/user-sync-flow.js';

export function registerOnboardingMessageHandlers(bot: TelegramBot, ctx: CommandContext): void {
  bot.on('message', (msg) => {
    void handleOnboardingMessage(bot, ctx, msg);
  });
}

async function handleOnboardingMessage(
  bot: TelegramBot,
  ctx: CommandContext,
  msg: TelegramBot.Message,
): Promise<void> {
  if (msg.chat.type !== 'private') return;

  const from = msg.from;
  if (!from) return;

  if (ctx.onboarding.isRegistered(from.id)) return;

  const pending = ctx.onboarding.getPending(from.id);
  if (!pending) return;

  if (msg.text?.startsWith('/')) return;

  if (pending.phase === 'name') {
    if (msg.contact) {
      await bot.sendMessage(
        msg.chat.id,
        "Avval to'liq ismingiz va familiyangizni matn bilan yozing.",
      );
      return;
    }

    if (!msg.text) {
      await bot.sendMessage(msg.chat.id, "Iltimos, to'liq ismingiz va familiyangizni yozing.");
      return;
    }

    const trimmed = msg.text.trim();
    if (!trimmed) {
      await bot.sendMessage(msg.chat.id, "Bo'sh xabar. Iltimos, to'liq ismingizni yozing.");
      return;
    }

    ctx.onboarding.setFullName(from.id, trimmed);
    await bot.sendMessage(
      msg.chat.id,
      'Endi telefon raqamingizni yuboring — quyidagi «Kontaktni yuborish» tugmasini bosing.',
      { reply_markup: contactRequestKeyboard() },
    );
    return;
  }

  if (pending.phase === 'contact') {
    const contact = msg.contact;
    if (contact && contact.user_id === from.id) {
      await completeOnboardingSync(ctx, bot, msg, from, pending.fullName);
      return;
    }

    if (msg.text) {
      await bot.sendMessage(msg.chat.id, 'Iltimos, kontaktni faqat tugma orqali yuboring.');
    }
  }
}

export async function handleRegisteredStart(
  bot: TelegramBot,
  ctx: CommandContext,
  msg: TelegramBot.Message,
  from: TelegramBot.User,
): Promise<void> {
  const names = namePartsFromTelegramUser(from);
  const ok = await postUserSync(ctx, bot, msg.chat.id, from, names);
  if (!ok) return;
  await sendWelcomeWithWebApp(bot, msg.chat.id, ctx.config.WEB_APP_URL);
}
