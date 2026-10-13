import type { Env } from './types';
export function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...extra } });
}
export function checkRequest(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { Allow: 'POST' });
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return json({ error: 'Request not permitted.' }, 403);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return json({ error: 'Please send a JSON request.' }, 415);
  return null;
}
export async function readJson(request: Request, limit = 24000): Promise<unknown> {
  // Enforce a streaming byte limit, including chunked requests without Content-Length.
  if (Number(request.headers.get('content-length')) > limit) throw new Error('PAYLOAD_SIZE');
  const reader = request.body?.getReader(); if (!reader) throw new Error('INVALID_JSON');
  let size = 0; const chunks: Uint8Array[] = [];
  try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > limit) { await reader.cancel(); throw new Error('PAYLOAD_SIZE'); } chunks.push(value); } } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const c of chunks) { bytes.set(c, offset); offset += c.byteLength; }
  return JSON.parse(new TextDecoder().decode(bytes));
}
const localBuckets = new Map<string, { count: number; reset: number }>();
export async function rateLimit(request: Request, env: Env, kind: 'chat' | 'contact') {
  const binding = kind === 'chat' ? env.CHAT_RATE_LIMITER : env.CONTACT_RATE_LIMITER;
  const ip = request.headers.get('cf-connecting-ip') ?? 'local';
  const key = `${kind}:${ip}`;
  if (binding) {
    try { const result = await binding.limit({ key }); return result.success ? null : json({ error: 'Too many requests. Please wait a minute and try again.' }, 429, { 'Retry-After': '60' }); }
    catch { return json({ error: 'This service is temporarily unavailable. Please contact our team.' }, 503); }
  }
  // Native rate-limit bindings are optional and are not declared in the Pages config.
  // Local memory is useful for development, but is not a distributed production limiter.
  const hostname = new URL(request.url).hostname;
  if (env.ALLOW_LOCAL_RATE_LIMIT !== 'true' || !['localhost', '127.0.0.1', '[::1]'].includes(hostname)) return null;
  const now = Date.now(); for (const [id, bucket] of localBuckets) if (bucket.reset <= now) localBuckets.delete(id);
  const bucket = localBuckets.get(key) ?? { count: 0, reset: now + 60000 };
  bucket.count++; localBuckets.set(key, bucket);
  return bucket.count > (kind === 'chat' ? 12 : 3) ? json({ error: 'Too many requests. Please wait a minute and try again.' }, 429, { 'Retry-After': '60' }) : null;
}
