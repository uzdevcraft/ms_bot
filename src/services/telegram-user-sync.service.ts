import type { AxiosInstance } from 'axios';
import { BACKEND_TELEGRAM_USER_SYNC_PATH } from '../config/constants.js';
import type { TelegramUserSyncPayload } from '../types/telegram-user-payload.js';

/**
 * Thin transport: POST Telegram identity to backend. Response body is opaque to the bot.
 */
export class TelegramUserSyncService {
  constructor(private readonly http: AxiosInstance) {}

  async syncUser(payload: TelegramUserSyncPayload): Promise<unknown> {
    const { data } = await this.http.post<unknown>(BACKEND_TELEGRAM_USER_SYNC_PATH, payload);
    return data;
  }
}
