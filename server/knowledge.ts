import { company, approach } from '../src/data/company';
import { contact } from '../src/data/contact';
import { services } from '../src/data/services';
import { solutions } from '../src/data/solutions';
import { industries } from '../src/data/industries';
import type { Env } from './types';
export const sections = [
  ...services.map(s => ({ title: s.title, url: `/services/${s.slug}`, keywords: s.keywords, text: `${s.intro} Capabilities: ${s.capabilities.join('; ')}. Discovery questions: ${s.questions.join(' ')}` })),
  ...solutions.map(s => ({ title: s.title, url: `/solutions#${s.slug}`, keywords: [s.slug, ...s.title.toLowerCase().split(/\W+/)].filter(Boolean), text: `${s.description} Solution areas: ${s.features.join('; ')}. This is a solution offering/concept; packaged product availability, scope and timelines are not confirmed.` })),
  ...industries.map(i => ({ title: i.title, url: `/industries#${i.slug}`, keywords: [i.slug, ...i.title.toLowerCase().split(/\W+/)].filter(Boolean), text: `${i.description} Potential solution opportunities: ${i.useCases.join('; ')}. No customer deployments or industry certifications are claimed.` })),
];
const aliases: Record<string, string> = { bots: 'bot', chatbots: 'chatbot', applications: 'application', services: 'service', banks: 'banking', bank: 'banking', dashboards: 'dashboard', technologies: 'technology', reports: 'report', automate: 'automation', automated: 'automation', accounting: 'finance', resource: 'erp' };
export function retrieve(query: string, previousUserMessages: string[] = []) {
  const words = (query + ' ' + previousUserMessages.slice(-2).join(' ')).toLowerCase().match(/[a-z0-9]+/g) ?? [];
  const tokens = new Set(words.map(w => aliases[w] ?? w));
  const ranked = sections.map(s => ({ ...s, score: s.keywords.reduce((sum, keyword) => sum + (tokens.has(aliases[keyword] ?? keyword) ? 2 : 0), 0) }));
  const relevant = ranked.filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);
  if (/\b(service|capabilit|offer|provide)\w*\b/i.test(query) && relevant.length < 2) return services.map(s => ({ title: s.title, url: `/services/${s.slug}`, text: `${s.description} ${s.capabilities.join('; ')}` }));
  return relevant.map(({ title, url, text }) => ({ title, url, text }));
}
export function baseKnowledge(env: Env) {
  const primary = env.CONTACT_PHONE_PRIMARY || contact.phoneLinks[0]; const secondary = env.CONTACT_PHONE_SECONDARY || contact.phoneLinks[1];
  return { company: company.name, positioning: company.positioning, description: company.description, location: contact.address, phones: [primary, secondary], whatsapp: `https://wa.me/${env.WHATSAPP_NUMBER || '918447844097'}`, email: env.CONTACT_EMAIL || 'Not confirmed. Do not invent an email address.', serviceAreas: services.map(s => `${s.title}: ${s.description}`), deliveryApproach: approach.map(a => `${a.title}: ${a.text}`), technologyContext: 'Catalogue planning options mention Flutter, React Native, Node.js, PostgreSQL, Power BI and AWS/Azure. These are candidate technologies; project stack, partnerships and certified expertise are not confirmed.', limitations: 'No approved customers, case studies, certifications, partnerships, employee counts, years of experience, prices, timelines or performance statistics. Catalogue concepts are not confirmed completed products.' };
}
