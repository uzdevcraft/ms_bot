import type TelegramBot from 'node-telegram-bot-api';
import type { NameParts, TelegramUserSyncPayload } from '../types/telegram-user-payload.js';

export function splitFullName(full: string): NameParts {
  const t = full.trim();
  if (!t) return { first_name: '', last_name: '' };
  const i = t.indexOf(' ');
  if (i === -1) return { first_name: t, last_name: '' };
  return { first_name: t.slice(0, i).trim(), last_name: t.slice(i + 1).trim() };
}

export function namePartsFromTelegramUser(from: TelegramBot.User): NameParts {
  return {
    first_name: from.first_name,
    last_name: from.last_name ?? '',
  };
}

export function buildUserSyncPayloadStrings(from: TelegramBot.User, names: NameParts): TelegramUserSyncPayload {
  return {
    telegram_id: String(from.id),
    first_name: names.first_name,
    last_name: names.last_name,
    username: from.username ?? '',
    language_code: from.language_code ?? '',
  };
}
