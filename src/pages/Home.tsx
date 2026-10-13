import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowRight, Check, MessageCircle } from 'lucide-react';
import { company } from '../data/company';
import { solutions } from '../data/solutions';
import { industries } from '../data/industries';
import { insights } from '../data/insights';
import { Cta, Delivery, Eyebrow, ServicesGrid } from '../components/Common';
import TechnologyVisual from '../components/TechnologyVisual';
import Icon from '../components/Icon';
import { openAssistant } from '../components/Layout';

export default function Home() {
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <Eyebrow>Consultix Technologies</Eyebrow><h1>{company.headline}</h1><p>{company.description}</p>
          <div className="hero-actions"><Link to="/services" className="button">Explore Our Services <ArrowUpRight size={18}/></Link><Link to="/contact" className="button button-outline">Let’s Discuss Your Project <ArrowUpRight size={17}/></Link></div>
          <div className="hero-note">Your vision. Our engineering. Shared progress.</div>
        </div>
        <TechnologyVisual/>
      </div>
      <div className="container hero-bottom"><span>Intelligence meets impact</span><a href="#capabilities">Discover what’s possible <ArrowRight size={15}/></a><span>Noida, India · Built for business</span></div>
    </section>

    <section className="section intro-section"><div className="container intro-grid">
      <div><Eyebrow>What we do</Eyebrow><h2>Technology is the enabler.<br/>Your business is the focus.</h2><span className="mini-label intro-perspective">The Consultix perspective</span></div>
      <div><p className="large-copy">From a single workflow to a connected enterprise, we bring the right thinking and engineering to your next step.</p><p>We connect AI, automation and enterprise applications to help you move from complex challenges to practical digital solutions.</p><Link className="text-link" to="/about">Get to know Consultix <ArrowUpRight size={17}/></Link></div>
    </div></section>

    <section className="section services-section" id="capabilities"><div className="container">
      <div className="section-heading"><div><Eyebrow>Core services</Eyebrow><h2>Intelligence. Engineering.<br/>Everything connected.</h2></div><div><p>End-to-end capabilities for the way your business works—and where it goes next.</p><Link className="text-link" to="/services">Explore all services <ArrowUpRight size={17}/></Link></div></div>
      <ServicesGrid/>
    </div></section>

    <section className="section solutions-feature"><div className="container">
      <div className="section-heading"><div><Eyebrow>Solutions</Eyebrow><h2>Built around real business needs.</h2></div><div><p>Explore solution areas across intelligence, operations and digital experiences.</p><Link className="text-link" to="/solutions">View solutions portfolio <ArrowUpRight size={17}/></Link></div></div>
      <div className="featured-solutions">{solutions.slice(0, 3).map(solution => <Link to={`/solutions#${solution.slug}`} className="featured-solution" key={solution.slug}><span className="solution-symbol"><Icon name={solution.icon} size={26}/></span><div className="featured-solution-body"><span className="mini-label">{solution.category}</span><h3>{solution.title}</h3><p>{solution.description}</p><span className="text-link">Explore solution <ArrowUpRight size={17}/></span></div></Link>)}</div>
    </div></section>

    <section className="section industry-feature"><div className="container industry-feature-grid">
      <div><Eyebrow>Industries</Eyebrow><h2>Different industries.<br/>A shared ambition to move forward.</h2><p>Technology that considers your workflows, your users and your operating environment.</p><Link className="text-link" to="/industries">Explore industries <ArrowUpRight size={17}/></Link></div>
      <div className="industry-list">{industries.map(industry => <Link key={industry.slug} to={`/industries#${industry.slug}`}><span><Icon name={industry.icon} size={21}/>{industry.title}</span><ArrowUpRight size={18}/></Link>)}</div>
    </div></section>

    <section className="section why-section"><div className="container">
      <div className="section-heading"><div><Eyebrow>Why Consultix</Eyebrow><h2>Business first.<br/>Thoughtful from the start.</h2></div><p>Industry context. Technology expertise. One connected approach to your requirements.</p></div>
      <div className="principles-grid">{company.principles.map((principle, index) => <div key={principle.title}><span className="index">0{index + 1}</span><h3>{principle.title}</h3><p>{principle.text}</p></div>)}</div>
      <div className="home-perspectives"><div className="section-heading"><div><Eyebrow>Ideas for what’s next</Eyebrow><h2>A little perspective. A better next step.</h2></div><Link className="text-link" to="/insights">Explore insights <ArrowUpRight size={17}/></Link></div><div className="insights-grid">{insights.map(article => <Link className="insight-card" key={article.slug} to={`/insights/${article.slug}`}><span className="mini-label">{article.category}</span><h3>{article.title}</h3><div className="insight-meta"><span>{article.readTime}</span><ArrowUpRight size={17}/></div></Link>)}</div></div>
      <details className="assistant-information">
        <summary><MessageCircle size={18}/><span>Explore with the Consultix AI Assistant</span></summary>
        <div className="assistant-information-body">
          <div><Eyebrow>Meet your first point of contact</Eyebrow><h3>Your questions. Our knowledge. A smarter conversation.</h3><p>Meet the Consultix AI Assistant. Explore our capabilities, find a relevant solution and take the next step with our team.</p><p>Ask us about our services, solutions and technology capabilities.</p><button className="text-link" onClick={openAssistant}>Chat With Our AI Assistant <ArrowRight size={16}/></button></div>
          <div className="assistant-example"><span className="mini-label">Consultix AI Assistant · Your technology concierge · Preview</span><p className="example-question">How can you help automate our processes?</p><p>Let’s start with the process you want to improve. We can explore:</p><ul>{['Intelligent workflows & agentic AI', 'Knowledge-grounded assistants', 'Enterprise application integration'].map(text => <li key={text}><Check size={15}/>{text}</li>)}</ul><p>Which workflow creates the most manual work today?</p><button className="text-link" onClick={openAssistant}>Explore possibilities <ArrowRight size={16}/></button><span className="mini-label example-source">Grounded in Consultix knowledge</span></div>
        </div>
      </details>
    </div></section>
    <Delivery/><Cta/>
  </>;
}
