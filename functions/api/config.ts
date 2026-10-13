import { json } from '../../server/http';
import { contact } from '../../src/data/contact';
import type { Handler } from '../../server/types';
// Deliberately exposes only approved public contact information, never secrets/configuration.
export const onRequestGet: Handler = ({ env }) => {
  const email = env.CONTACT_EMAIL?.trim();
  const emailSafe = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/[\r\n]/.test(email) ? email : null;
  const safePhone = (value: string | undefined, fallback: string) => value && /^\+?\d{7,15}$/.test(value) ? value : fallback;
  return json({ email: emailSafe, phones: [safePhone(env.CONTACT_PHONE_PRIMARY, contact.phoneLinks[0]), safePhone(env.CONTACT_PHONE_SECONDARY, contact.phoneLinks[1])], whatsapp: `https://wa.me/${safePhone(env.WHATSAPP_NUMBER, '918447844097').replace(/^\+/, '')}` });
};
