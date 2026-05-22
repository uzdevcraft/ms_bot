import type TelegramBot from 'node-telegram-bot-api';

export function contactRequestKeyboard(): TelegramBot.ReplyKeyboardMarkup {
  return {
    keyboard: [[{ text: 'Kontaktni yuborish', request_contact: true }]],
    resize_keyboard: true,
    one_time_keyboard: true,
  };
}

export const removeReplyKeyboard: TelegramBot.ReplyKeyboardRemove = {
  remove_keyboard: true,
};
