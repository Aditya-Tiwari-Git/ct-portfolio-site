import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { ArrowUpRight, Menu, X, MessageCircle, ArrowRight } from 'lucide-react';
import { company } from '../data/company';
import { contact, whatsappLink } from '../data/contact';
import { services } from '../data/services';
import Seo from './Seo';
const Chat = lazy(() => import('./Chat'));
const nav = [['Home', '/'], ['About', '/about'], ['Services', '/services'], ['Solutions', '/solutions'], ['Industries', '/industries'], ['Insights', '/insights'], ['Contact', '/contact']];
export function openAssistant() { window.dispatchEvent(new CustomEvent('consultix:chat')); }
export default function Layout() {
  const [menu, setMenu] = useState(false); const [chat, setChat] = useState(false); const [loaded, setLoaded] = useState(false);
  const location = useLocation(); const menuRef = useRef<HTMLButtonElement>(null); const chatRef = useRef<HTMLButtonElement>(null);
  useEffect(() => { setMenu(false); }, [location.pathname]);
  useEffect(() => { const open = () => { setLoaded(true); setChat(true); }; window.addEventListener('consultix:chat', open); return () => window.removeEventListener('consultix:chat', open); }, []);
  useEffect(() => { if (!menu) return; const key = (e: KeyboardEvent) => { if (e.key === 'Escape') { setMenu(false); menuRef.current?.focus(); } }; window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key); }, [menu]);
  return <><Seo/><a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="container header-inner">
      <Link to="/" className="brand" aria-label="Consultix Technologies home"><img src="/brand/logo.svg" width="203" height="54" alt="Consultix Technologies"/></Link>
      <nav aria-label="Main navigation" className={menu ? 'main-nav is-open' : 'main-nav'}>{nav.map(([label, path]) => <NavLink key={path} to={path} end={path === '/'}>{label}</NavLink>)}</nav>
      <Link to="/contact" className="button button-small header-cta">Let’s Talk <ArrowUpRight size={16}/></Link>
      <button ref={menuRef} className="menu-toggle icon-button" aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
    </div></header>
    <main id="main"><Outlet/></main>
    <footer className="site-footer"><div className="container footer-grid"><div className="footer-brand"><Link to="/"><img src="/brand/logo.svg" width="210" height="55" alt="Consultix Technologies"/></Link><p>Intelligent technology.<br/>Meaningful business progress.</p><a className="text-link" href={whatsappLink()} target="_blank" rel="noopener noreferrer">Start a conversation <ArrowUpRight size={16}/></a></div><div><h3>Explore</h3>{nav.slice(1).map(([label, path]) => <Link key={path} to={path}>{label}</Link>)}</div><div><h3>Capabilities</h3>{services.map(s => <Link key={s.slug} to={`/services/${s.slug}`}>{s.shortTitle}</Link>)}</div><div><h3>Let’s connect</h3><p>{contact.address}</p>{contact.phones.map((phone, i) => <a key={phone} href={`tel:${contact.phoneLinks[i]}`}>{phone}</a>)}<a href={whatsappLink()} target="_blank" rel="noopener noreferrer">WhatsApp us <ArrowUpRight size={14}/></a></div></div><div className="container footer-bottom"><span>© {new Date().getFullYear()} {company.name}. All rights reserved.</span><div><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms of Use</Link></div><span>ENGINEERED FOR WHAT’S NEXT <ArrowRight size={13}/></span></div></footer>
    {loaded && <Suspense fallback={chat ? <div className="chat-loading" role="status">Opening Consultix AI Assistant…</div> : null}><Chat open={chat} onClose={() => { setChat(false); chatRef.current?.focus(); }}/></Suspense>}
    <button ref={chatRef} className={`chat-launcher ${chat ? 'chat-launcher-hidden' : ''}`} onClick={() => { setLoaded(true); setChat(true); }} aria-label="Chat with Consultix AI Assistant" aria-expanded={chat}><MessageCircle size={20}/><span>Chat</span></button>
  </>;
}
