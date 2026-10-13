import fs from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { createServer, loadEnv } from 'vite';
import { pageDefinitions, pageFor } from '../src/data/routes';
import { company } from '../src/data/company';
import { contact } from '../src/data/contact';
import { services } from '../src/data/services';
const env = loadEnv('production', process.cwd(), '');
const site = (env.SITE_URL || company.siteUrl).replace(/\/$/, '');
const escape = (s: string) => s.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: App } = await server.ssrLoadModule('/src/App.tsx');
  const template = await fs.readFile('dist/index.html', 'utf8');
  const assets = await fs.readdir('dist/assets');
  const fontHints = ['600', '400'].map(weight => assets.find(file => file.startsWith(`manrope-latin-${weight}-normal`) && file.endsWith('.woff2'))).filter(Boolean).map(file => `<link rel="preload" href="/assets/${file}" as="font" type="font/woff2" crossorigin/>`).join('');
  for (const p of [...pageDefinitions, pageFor('/404')]) {
    const html = renderToString(React.createElement(StaticRouter, { location: p.path }, React.createElement(App)));
    const title = `${p.title} | ${company.name}`;
    const organization = { '@context': 'https://schema.org', '@type': 'Organization', '@id': `${site}/#organization`, name: company.name, url: site, logo: `${site}/brand/ct-logo.png`, telephone: contact.phoneLinks[0], address: { '@type': 'PostalAddress', streetAddress: 'Sector 144', addressLocality: 'Noida', addressRegion: 'Uttar Pradesh', postalCode: '201307', addressCountry: 'IN' }, ...(env.CONTACT_EMAIL ? { email: env.CONTACT_EMAIL } : {}) };
    const schema: unknown[] = [organization];
    if (p.path !== '/' && p.path !== '/404') schema.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: site }, { '@type': 'ListItem', position: 2, name: p.title, item: site + p.path }] });
    const service = services.find(s => p.path === `/services/${s.slug}`);
    if (service) schema.push({ '@context': 'https://schema.org', '@type': 'Service', name: service.title, description: service.description, provider: { '@id': `${site}/#organization` }, url: site + p.path });
    const metadata = `<link rel="canonical" href="${escape(site + p.path)}"/><meta name="robots" content="${p.path === '/404' ? 'noindex,follow' : 'index,follow'}"/><meta property="og:type" content="website"/><meta property="og:site_name" content="Consultix Technologies"/><meta property="og:title" content="${escape(title)}"/><meta property="og:description" content="${escape(p.description)}"/><meta property="og:url" content="${escape(site + p.path)}"/><meta property="og:image" content="${site}/og-image.png"/><meta property="og:image:width" content="1200"/><meta property="og:image:height" content="630"/><meta name="twitter:card" content="summary_large_image"/><script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script>`;
    const output = template.replace(/<title>.*?<\/title>/, `<title>${escape(title)}</title>`).replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(p.description)}"/>`).replace('</head>', `${fontHints}${metadata}</head>`).replace('<!--app-html-->', html);
    const file = p.path === '/' ? 'dist/index.html' : p.path === '/404' ? 'dist/404.html' : path.join('dist', p.path.slice(1), 'index.html');
    await fs.mkdir(path.dirname(file), { recursive: true }); await fs.writeFile(file, output);
  }
  await fs.writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pageDefinitions.map(p => `<url><loc>${escape(site + p.path)}</loc></url>`).join('')}</urlset>`);
  await fs.writeFile('dist/robots.txt', `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${site}/sitemap.xml\n`);
  console.log(`Pre-rendered ${pageDefinitions.length} public routes and 404; generated sitemap and schema.`);
} finally { await server.close(); }
