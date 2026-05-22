import type TelegramBot from 'node-telegram-bot-api';

export function openStoreKeyboard(webAppUrl: string): TelegramBot.InlineKeyboardMarkup {
  return {
    inline_keyboard: [
      [
        {
          text: 'Open Store',
          web_app: { url: webAppUrl },
        },
      ],
    ],
  };
}
