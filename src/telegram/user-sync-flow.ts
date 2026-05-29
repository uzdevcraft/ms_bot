import type TelegramBot from 'node-telegram-bot-api';
import type { CommandContext } from '../commands/command.types.js';
import { buildUserSyncPayloadStrings, splitFullName } from './user-payload.mapper.js';
import { openStoreKeyboard } from './web-app-keyboard.js';
import { removeReplyKeyboard } from './contact-keyboard.js';
import type { NameParts } from '../types/telegram-user-payload.js';
import { loggableHttpError } from '../utils/loggable-http-error.js';
import { formatBotErrorMessage } from '../utils/user-facing-error-code.js';

export async function postUserSync(
  ctx: CommandContext,
  bot: TelegramBot,
  chatId: number,
  from: TelegramBot.User,
  names: NameParts,
): Promise<boolean> {
  const payload = buildUserSyncPayloadStrings(from, names);

  try {
    await ctx.userSync.syncUser(payload);
  } catch (err) {
    ctx.log.error(
      { telegramId: payload.telegram_id, ...loggableHttpError(err) },
      'User sync to backend failed',
    );
    await ctx.admins.notify(`User sync failed for telegram_id=${payload.telegram_id}. Check logs.`);
    await bot.sendMessage(
      chatId,
      formatBotErrorMessage(
        'Hozircha server bilan bog‘lanib bo‘lmadi. Bir ozdan keyin qayta urinib ko‘ring.',
        err,
      ),
    );
    return false;
  }

  return true;
}

export async function sendWelcomeWithWebApp(
  bot: TelegramBot,
  chatId: number,
  webAppUrl: string,
): Promise<void> {
  await bot.sendMessage(chatId, 'Muvaffaqiyatli! Do‘konga kirish uchun tugmani bosing.', {
    reply_markup: openStoreKeyboard(webAppUrl),
  });
}

export async function completeOnboardingSync(
  ctx: CommandContext,
  bot: TelegramBot,
  msg: TelegramBot.Message,
  from: TelegramBot.User,
  fullName: string,
): Promise<void> {
  const names = splitFullName(fullName);
  const ok = await postUserSync(ctx, bot, msg.chat.id, from, names);
  if (!ok) return;

  ctx.onboarding.markRegistered(from.id);
  await bot.sendMessage(msg.chat.id, 'Rahmat! Kontakt qabul qilindi.', { reply_markup: removeReplyKeyboard });
  await sendWelcomeWithWebApp(bot, msg.chat.id, ctx.config.WEB_APP_URL);
}
