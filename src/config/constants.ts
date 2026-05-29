/** Default HTTP listen port for local webhook mode. */
export const DEFAULT_LISTEN_PORT = 3005;

/**
 * Backend route for syncing Telegram identity. Adjust to match your API contract.
 * The bot forwards payloads only; validation and persistence live in the backend.
 */
export const BACKEND_TELEGRAM_USER_SYNC_PATH = '/api/v1/internal/users/sync';

/** Must match backend `INTERNAL_API_KEY` (sent as `x-internal-api-key`). */
export const INTERNAL_API_KEY_HEADER = 'X-Internal-Api-Key';
