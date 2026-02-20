import type { PersonalDashboard } from '@/types/personal-dashboard';

const STORAGE_KEY = 'idash-personal-dashboard';

export function loadPersonalDashboard(): PersonalDashboard | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersonalDashboard;
    if (!parsed.id || !parsed.name) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function savePersonalDashboard(dashboard: PersonalDashboard): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dashboard));
}

export function clearPersonalDashboard(): void {
  localStorage.removeItem(STORAGE_KEY);
}
