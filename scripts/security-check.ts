import fs from 'node:fs/promises';
import path from 'node:path';
import { loadEnv } from 'vite';
const env = loadEnv('production', process.cwd(), '');
const secrets = ['OPENAI_API_KEY', 'CONTACT_WEBHOOK_TOKEN', 'CONTACT_WEBHOOK_URL'].map(key => env[key]).filter(value => value && value.length > 8);
async function scan(dir: string) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name); if (entry.isDirectory()) { await scan(file); continue; }
    if (!/\.(js|html|css|json|xml|txt|svg)$/.test(entry.name)) continue;
    const text = await fs.readFile(file, 'utf8');
    if (/\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{20,}\b|VITE_OPENAI_API_KEY|OPENAI_API_KEY|CONTACT_WEBHOOK_TOKEN|CONTACT_WEBHOOK_URL/.test(text) || secrets.some(secret => text.includes(secret))) throw new Error(`Secret or server-only credential marker found in ${file}`);
  }
}
await scan('dist'); console.log('Frontend security scan passed: no secret values or server credential markers.');
