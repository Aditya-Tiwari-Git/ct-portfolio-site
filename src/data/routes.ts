import { company } from './company';
import { services } from './services';
import { insights } from './insights';
export const pageDefinitions = [
  { path: '/', title: 'Technology Consulting & AI', description: company.description },
  { path: '/about', title: 'About Us', description: 'Meet Consultix Technologies, an end-to-end technology consulting and digital transformation company in Noida, India.' },
  { path: '/services', title: 'Our Services', description: 'Explore AI consulting, enterprise software, ITSM, custom applications, data analytics and digital transformation services.' },
  ...services.map(s => ({ path: `/services/${s.slug}`, title: s.title, description: s.description })),
  { path: '/solutions', title: 'Solutions & Products', description: 'Explore Consultix solution areas in AI chatbots, ERP, ITSM, learning, procurement, inventory and business intelligence.' },
  { path: '/industries', title: 'Industries', description: 'Technology solution opportunities for banking, retail, manufacturing, education, professional services and enterprise IT.' },
  { path: '/insights', title: 'Insights', description: 'Practical perspectives on AI, enterprise engineering and digital transformation from Consultix Technologies.' },
  ...insights.map(i => ({ path: `/insights/${i.slug}`, title: i.title, description: i.excerpt })),
  { path: '/contact', title: 'Contact Us', description: 'Discuss your project with Consultix Technologies. Reach our team in Sector 144, Noida by phone or WhatsApp.' },
  { path: '/privacy', title: 'Privacy Policy', description: 'How the Consultix Technologies website handles enquiries, AI conversations and visitor information.' },
  { path: '/terms', title: 'Terms of Use', description: 'Terms for using the Consultix Technologies website, published information and AI assistant.' },
];
export function pageFor(path: string) { return pageDefinitions.find(p => p.path === (path.replace(/\/$/, '') || '/')) ?? { path, title: 'Page Not Found', description: 'The requested page could not be found. Explore Consultix services or contact our team.' }; }
