import { json, checkRequest, readJson, rateLimit } from '../../server/http';
import type { Handler } from '../../server/types';
const fields = { name: 100, email: 254, company: 160, phone: 40, service: 160, requirements: 4000, preferred: 20 };
export function validateEnquiry(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;
  const p = payload as Record<string, unknown>; const result: Record<string, string | boolean> = {};
  if (p.consent !== true || (typeof p.website === 'string' && p.website)) return null;
  for (const [name, max] of Object.entries(fields)) {
    if (typeof p[name] !== 'string' || (p[name] as string).length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(p[name] as string)) return null;
    result[name] = (p[name] as string).trim();
  }
  if (!(result.name as string) || !(result.company as string) || !(result.service as string) || (result.requirements as string).length < 10 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result.email as string) || !['Email', 'Phone', 'WhatsApp'].includes(result.preferred as string)) return null;
  if (result.preferred !== 'Email' && !/^\+?[\d ()-]{7,40}$/.test(result.phone as string)) return null;
  result.consent = true; return result;
}
export const onRequest: Handler = async ({ request, env }) => {
  const rejected = checkRequest(request); if (rejected) return rejected;
  const limited = await rateLimit(request, env, 'contact'); if (limited) return limited;
  let payload: unknown; try { payload = await readJson(request, 10000); } catch { return json({ error: 'Invalid enquiry. Please check your details.' }, 400); }
  const enquiry = validateEnquiry(payload); if (!enquiry) return json({ error: 'Please check all required fields and privacy consent.' }, 400);
  if (!env.CONTACT_WEBHOOK_URL) return json({ error: 'Online enquiry delivery is not available yet. Your enquiry has not been sent. Please use WhatsApp or call our team.', fallback: true }, 503);
  try {
    const url = new URL(env.CONTACT_WEBHOOK_URL); if (url.protocol !== 'https:') throw new Error('CONFIGURATION');
    const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(env.CONTACT_WEBHOOK_TOKEN ? { Authorization: `Bearer ${env.CONTACT_WEBHOOK_TOKEN}` } : {}) }, body: JSON.stringify({ source: 'consultix-website', ...enquiry }), signal: AbortSignal.timeout(12000), redirect: 'error' });
    if (!response.ok) throw new Error('DELIVERY_FAILED');
    return json({ success: true, message: 'Your enquiry has been sent to our team. Thank you for getting in touch.' });
  } catch { return json({ error: 'We could not deliver your enquiry. Please try again or contact our team on WhatsApp.', fallback: true }, 503); }
};
