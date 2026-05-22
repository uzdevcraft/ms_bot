import type { IncomingMessage, ServerResponse } from 'node:http';
import { URL } from 'node:url';
import { DEFAULT_LISTEN_PORT } from '../config/constants.js';

const MAX_BODY_BYTES = 1024 * 1024;

export async function readJsonBody(req: IncomingMessage, res: ServerResponse): Promise<unknown | null> {
  const chunks: Buffer[] = [];
  let size = 0;

  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > MAX_BODY_BYTES) {
      res.writeHead(413).end();
      return null;
    }
    chunks.push(buf);
  }

  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};

  try {
    return JSON.parse(raw) as unknown;
  } catch {
    res.writeHead(400).end();
    return null;
  }
}

export function getWebhookPathname(webhookPublicUrl: string): string {
  const pathname = new URL(webhookPublicUrl).pathname;
  return pathname && pathname !== '/' ? pathname : '/telegram/webhook';
}

export function getListenPort(webhookPublicUrl: string, override?: number): number {
  if (override !== undefined) return override;
  const port = Number(new URL(webhookPublicUrl).port);
  return Number.isFinite(port) && port > 0 ? port : DEFAULT_LISTEN_PORT;
}
