import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, RotateCcw, Send, Sparkles, X } from 'lucide-react';
import { whatsappLink } from '../data/contact';
type ChatMessage = { role: 'user' | 'assistant'; content: string; sources?: { title: string; url: string }[] };
const prompts = ['Explore AI Solutions', 'Enterprise Software', 'ITSM Solutions', 'Build a Custom Application', 'Talk to Our Team'];
const promptQueries = ['What AI services does Consultix provide?', 'What enterprise software solutions can you develop?', 'Do you provide ITSM solutions?', 'Can you build a custom web or mobile application?', 'How can I discuss my project with your team?'];
const welcome = "Hi! I'm the Consultix AI Assistant. I can help you explore our AI, enterprise software, ITSM, application development and digital transformation capabilities. What would you like to know?";
export default function Chat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]); const [input, setInput] = useState(''); const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [handoff, setHandoff] = useState(false);
  const panel = useRef<HTMLElement>(null); const field = useRef<HTMLTextAreaElement>(null); const scroll = useRef<HTMLDivElement>(null); const controller = useRef<AbortController | null>(null); const pending = useRef(false);
  useEffect(() => { scroll.current?.scrollTo({ top: scroll.current.scrollHeight, behavior: 'smooth' }); }, [messages, busy, error, open]);
  useEffect(() => { if (!open) return; const oldOverflow = document.body.style.overflow; if (window.innerWidth < 700) document.body.style.overflow = 'hidden'; field.current?.focus();
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { onClose(); return; } if (e.key !== 'Tab') return; const items = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],textarea'); if (!items?.length) return; const first = items[0], last = items[items.length - 1]; if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } };
    document.addEventListener('keydown', handleKey); return () => { document.body.style.overflow = oldOverflow; document.removeEventListener('keydown', handleKey); };
  }, [open, onClose]);
  useEffect(() => () => controller.current?.abort(), []);
  async function send(text: string, retry = false) {
    const content = text.trim(); if (!content || content.length > 1500 || pending.current) return;
    const next = retry ? messages : [...messages, { role: 'user' as const, content }];
    pending.current = true; setMessages(next); setInput(''); setBusy(true); setError('');
    const abort = new AbortController(); controller.current = abort; const timer = setTimeout(() => abort.abort(), 25000);
    // Keep whole user/assistant pairs; user message last. Budget before transport.
    let history = next.map(({ role, content }) => ({ role, content })).slice(-11);
    while (history.length > 1 && history.reduce((sum, m) => sum + m.content.length, 0) > 16000) history = history.slice(2);
    try {
      const response = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history }), signal: abort.signal });
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('The assistant is unavailable. Please contact our team.');
      const data = await response.json(); if (!response.ok) throw new Error(data.error || 'Please try again or contact our team.');
      if (typeof data.reply !== 'string' || !data.reply.trim()) throw new Error('The assistant could not respond. Please try again.');
      const sources = Array.isArray(data.sources) ? data.sources.filter((s: { title?: unknown; url?: unknown }) => typeof s.title === 'string' && typeof s.url === 'string' && /^\/(services|solutions|industries)(\/|#|$)/.test(s.url)).slice(0, 3) : [];
      setMessages([...next, { role: 'assistant', content: data.reply, sources }]); setHandoff(Boolean(data.handoff));
    } catch (e) { if (abort.signal.aborted) setError('The assistant took too long to respond. Please try again or contact our team.'); else setError(e instanceof Error ? e.message : 'The assistant is unavailable.'); setHandoff(true); }
    finally { clearTimeout(timer); pending.current = false; setBusy(false); controller.current = null; field.current?.focus(); }
  }
  function clear() { controller.current?.abort(); setMessages([]); setInput(''); setError(''); setHandoff(false); field.current?.focus(); }
  if (!open) return null;
  return <section ref={panel} className="chat-panel" role="dialog" aria-modal="true" aria-labelledby="chat-title"><header className="chat-header"><span className="demo-avatar"><Sparkles size={20}/></span><div><h2 id="chat-title">Consultix AI Assistant</h2><small><span className="status-dot"/>{error ? 'AI Assistant · Unavailable' : 'AI Assistant · Online'}</small></div><div className="chat-controls"><button className="icon-button" onClick={clear} aria-label="Clear conversation" disabled={busy}><RotateCcw size={16}/></button><button className="icon-button" onClick={onClose} aria-label="Minimize assistant"><X size={19}/></button></div></header><div className="chat-scroll" ref={scroll}><div className="chat-welcome">{welcome}</div>{!messages.length && <div className="chat-suggestions">{prompts.map((p, i) => <button key={p} onClick={() => void send(promptQueries[i])} disabled={busy}>{p}</button>)}</div>}<div role="log" aria-live="polite" aria-relevant="additions">{messages.map((m, i) => <div className={`chat-message ${m.role}`} key={i}>{m.role === 'assistant' && <div className="chat-message-label"><Sparkles size={11}/> CONSULTIX AI</div>}{m.content}{m.sources && m.sources.length > 0 && <div className="chat-sources">{m.sources.map(s => <Link key={s.url} to={s.url} onClick={onClose}>{s.title}</Link>)}</div>}</div>)}</div>{busy && <div className="chat-typing" role="status"><span/><span/><span/> Exploring Consultix knowledge…</div>}{error && <div className="chat-error" role="alert">{error}<button onClick={() => void send(messages[messages.length - 1]?.content || input, true)}>Try again</button></div>}</div>{handoff && <div className="chat-handoff"><Link to="/contact" onClick={onClose}>Discuss With Our Team <ArrowUpRight size={13}/></Link><a href={whatsappLink('Hello Consultix Technologies, I explored your website and would like to discuss a technology requirement.')} target="_blank" rel="noopener noreferrer">Continue on WhatsApp <ArrowUpRight size={13}/></a></div>}<form className="chat-form" onSubmit={e => { e.preventDefault(); void send(input); }}><label className="sr-only" htmlFor="chat-input">Your question about Consultix</label><textarea id="chat-input" ref={field} value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about our services or your project…" maxLength={1500} disabled={busy || Boolean(error)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void send(input); } }}/><button type="submit" disabled={busy || !input.trim() || Boolean(error)} aria-label="Send message"><Send size={17}/></button></form><p className="chat-privacy">AI-generated responses may contain errors. Please avoid sharing confidential or sensitive information. <Link to="/privacy" onClick={onClose}>Privacy policy</Link></p></section>;
}
