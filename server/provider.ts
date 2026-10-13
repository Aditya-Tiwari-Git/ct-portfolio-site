import OpenAI from 'openai';
import type { Env, Message } from './types';
export async function generateAnswer(env: Env, instructions: string, messages: Message[]) {
  if ((env.AI_PROVIDER || 'openai') !== 'openai') throw new Error('PROVIDER_NOT_CONFIGURED');
  if (!env.OPENAI_API_KEY?.trim() || !env.OPENAI_MODEL?.trim()) throw new Error('AI_NOT_CONFIGURED');
  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 20000, maxRetries: 0 });
  const response = await client.responses.create({ model: env.OPENAI_MODEL, instructions, input: messages, max_output_tokens: 700, store: false });
  const text = response.output_text?.trim();
  if (!text || response.status !== 'completed') throw new Error('EMPTY_RESPONSE');
  return text.slice(0, 5000);
}
