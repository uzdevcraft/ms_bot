/** Default HTTP listen port for local webhook mode. */
export const DEFAULT_LISTEN_PORT = 3005;

/**
 * Backend route for syncing Telegram identity. Adjust to match your API contract.
 * The bot forwards payloads only; validation and persistence live in the backend.
 */
export const BACKEND_TELEGRAM_USER_SYNC_PATH = '/api/v1/internal/users/sync';

/** Must match backend expectation (same value as server `BOT_API_SECRET`). */
export const BOT_API_SECRET_HEADER = 'X-Bot-Secret';
