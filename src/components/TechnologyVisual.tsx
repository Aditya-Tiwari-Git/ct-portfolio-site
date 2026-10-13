import { company } from '../data/company';

/** A flat overview gives each capability equal emphasis. */
export default function TechnologyVisual() {
  const capabilities = ['Artificial Intelligence', 'Enterprise Software', 'Data & Insights', 'Intelligent Automation'];
  return <aside className="capability-overview" aria-label="Consultix technology capabilities">
    <p className="mini-label">End-to-end technology consulting</p>
    <div className="capability-overview-list">{capabilities.map((capability, index) => <div key={capability}><span className="index">0{index + 1}</span><span>{capability}</span></div>)}</div>
    <p className="capability-overview-note">{company.positioning}</p>
  </aside>;
}
