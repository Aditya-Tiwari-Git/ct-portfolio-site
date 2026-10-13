export interface Env {
  OPENAI_API_KEY?: string; OPENAI_MODEL?: string; AI_PROVIDER?: string; SITE_URL?: string;
  CONTACT_EMAIL?: string; CONTACT_PHONE_PRIMARY?: string; CONTACT_PHONE_SECONDARY?: string; WHATSAPP_NUMBER?: string;
  CONTACT_WEBHOOK_URL?: string; CONTACT_WEBHOOK_TOKEN?: string; ALLOW_LOCAL_RATE_LIMIT?: string;
  CHAT_RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
  CONTACT_RATE_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}
export type Message = { role: 'user' | 'assistant'; content: string };
// Minimal Pages handler contract; globals resolve against Workers types in the server check.
export type Handler = (context: { request: Request; env: Env }) => Response | Promise<Response>;
