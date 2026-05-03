/** Personal dashboard: one per user, create & track goals + roadmap */

export interface DashboardMetric {
  id: string;
  label: string;
  current: number;
  target: number;
  previous: number;
  deadline: string;
  unit?: string; // e.g. '', 'K', 'M', '$'
}

export interface RoadmapPhase {
  id: string;
  quarter: string;
  theme: string;
  goal: string;
  items: string[];
}

export interface PersonalDashboard {
  id: string;
  name: string;
  createdAt: string;
  metrics: DashboardMetric[];
  roadmapPhases: RoadmapPhase[];
  /** Completed roadmap item keys: "phaseId-itemIndex" */
  roadmapCompleted: Record<string, boolean>;
  /** Custom text overrides for roadmap items */
  roadmapItemText: Record<string, string>;
  /** Deleted base item keys */
  roadmapDeleted: Record<string, boolean>;
  /** Added items per phase: phaseId -> string[] */
  roadmapAdded: Record<string, string[]>;
  /** Today's attack item */
  attackToday: { text: string; completed: boolean; date: string } | null;
  /** Tomorrow's attack item */
  attackTomorrow: { text: string; date: string } | null;
}

export const DEFAULT_METRICS_TEMPLATE: DashboardMetric[] = [
  { id: 'm1', label: 'Schools Target', current: 1, target: 100, previous: 0, deadline: '2026-12-01', unit: '' },
  { id: 'm2', label: 'CRM Leads', current: 110, target: 110, previous: 34, deadline: '2026-12-01', unit: '' },
  { id: 'm3', label: 'Students Target', current: 0.11, target: 5, previous: 0, deadline: '2026-12-01', unit: 'M' },
  { id: 'm4', label: 'ARR Revenue', current: 1.42, target: 20, previous: 0, deadline: '2026-12-01', unit: '$M' },
];

export const DEFAULT_ROADMAP_TEMPLATE: RoadmapPhase[] = [
  { id: 'q1', quarter: 'Q1', theme: 'Foundation → Proof', goal: 'Make it undeniable that it works.', items: ['Platform stability', 'Simple onboarding (< 5 mins)', 'Core engagement live', 'Initial visibility and reporting'] },
  { id: 'q2', quarter: 'Q2', theme: 'Acceleration → Lock-In', goal: 'Make users dependent on it.', items: ['Multi-site rollouts', 'Daily usage established', 'Deeper engagement', 'Clear ROI reporting'] },
  { id: 'q3', quarter: 'Q3', theme: 'Scale → Authority', goal: 'Become the obvious choice.', items: ['Wide deployment', 'Standardized implementation', 'Growth data visible', 'Case studies and proof'] },
  { id: 'q4', quarter: 'Q4', theme: 'Default Status', goal: 'Make opting out feel silly.', items: ['Renewals finalized', 'Long-term planning', 'Institutional trust', 'Year-end impact reports'] },
];

export function createEmptyDashboard(name: string): PersonalDashboard {
  const id = 'dash-' + Date.now();
  return {
    id,
    name: name || 'My Dashboard',
    createdAt: new Date().toISOString(),
    metrics: [],
    roadmapPhases: [{ id: 'q1', quarter: 'Q1', theme: 'My Phase', goal: 'Your goal', items: ['First item'] }],
    roadmapCompleted: {},
    roadmapItemText: {},
    roadmapDeleted: {},
    roadmapAdded: {},
    attackToday: null,
    attackTomorrow: null,
  };
}

export function createDashboardFromTemplate(name: string): PersonalDashboard {
  const id = 'dash-' + Date.now();
  return {
    id,
    name: name || 'My Dashboard',
    createdAt: new Date().toISOString(),
    metrics: DEFAULT_METRICS_TEMPLATE.map(m => ({ ...m, id: m.id + '-' + Date.now() })),
    roadmapPhases: DEFAULT_ROADMAP_TEMPLATE.map(p => ({ ...p, id: p.id + '-' + Date.now(), items: [...p.items] })),
    roadmapCompleted: {},
    roadmapItemText: {},
    roadmapDeleted: {},
    roadmapAdded: {},
    attackToday: null,
    attackTomorrow: null,
  };
}
