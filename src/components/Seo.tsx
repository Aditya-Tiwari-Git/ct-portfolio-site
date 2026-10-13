import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { pageFor } from '../data/routes';
import { company } from '../data/company';
export default function Seo() {
  const { pathname } = useLocation();
  useEffect(() => {
    const siteUrl = (import.meta.env.PUBLIC_SITE_URL || company.siteUrl).replace(/\/$/, '');
    const page = pageFor(pathname); document.title = `${page.title} | ${company.name}`;
    const set = (selector: string, attribute: string, value: string) => {
      let el = document.head.querySelector(selector);
      if (!el) { el = document.createElement(selector.startsWith('link') ? 'link' : 'meta'); const match = selector.match(/\[(.*?)="(.*?)"\]/); if (match) el.setAttribute(match[1], match[2]); document.head.appendChild(el); }
      el.setAttribute(attribute, value);
    };
    set('meta[name="description"]', 'content', page.description);
    set('link[rel="canonical"]', 'href', siteUrl + page.path);
    set('meta[property="og:title"]', 'content', document.title);
    set('meta[property="og:description"]', 'content', page.description);
    set('meta[property="og:url"]', 'content', siteUrl + page.path);
    set('meta[name="robots"]', 'content', page.title === 'Page Not Found' ? 'noindex,follow' : 'index,follow');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}
