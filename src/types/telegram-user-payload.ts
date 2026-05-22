export type TelegramUserSyncPayload = {
  telegram_id: string;
  first_name: string;
  last_name: string;
  username: string;
  language_code: string;
};

export type NameParts = {
  first_name: string;
  last_name: string;
};
