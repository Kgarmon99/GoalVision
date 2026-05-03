import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { PersonalDashboard } from '@/types/personal-dashboard';
import { loadPersonalDashboard, savePersonalDashboard } from '@/lib/personal-dashboard-storage';
import { createDashboardFromTemplate } from '@/types/personal-dashboard';

type DashboardContextValue = {
  dashboard: PersonalDashboard | null;
  setDashboard: (d: PersonalDashboard | null) => void;
  updateDashboard: (updater: (d: PersonalDashboard) => PersonalDashboard) => void;
  hasDashboard: boolean;
};

const PersonalDashboardContext = createContext<DashboardContextValue | null>(null);

export function PersonalDashboardProvider({ children }: { children: React.ReactNode }) {
  const [dashboard, setDashboardState] = useState<PersonalDashboard | null>(null);

  useEffect(() => {
    const saved = loadPersonalDashboard();
    if (saved) {
      setDashboardState(saved);
    } else {
      // Force inject the MoneyBot dashboard if none exists
      const moneyBotDash = createDashboardFromTemplate("MoneyBot GoalVision");
      setDashboardState(moneyBotDash);
      savePersonalDashboard(moneyBotDash);
    }
  }, []);

  const setDashboard = useCallback((d: PersonalDashboard | null) => {
    setDashboardState(d);
    if (d) savePersonalDashboard(d);
    else localStorage.removeItem('idash-personal-dashboard');
  }, []);

  const updateDashboard = useCallback((updater: (d: PersonalDashboard) => PersonalDashboard) => {
    setDashboardState(prev => {
      if (!prev) return null;
      const next = updater(prev);
      savePersonalDashboard(next);
      return next;
    });
  }, []);

  const value: DashboardContextValue = {
    dashboard,
    setDashboard,
    updateDashboard,
    hasDashboard: dashboard !== null,
  };

  return (
    <PersonalDashboardContext.Provider value={value}>
      {children}
    </PersonalDashboardContext.Provider>
  );
}

export function usePersonalDashboard() {
  const ctx = useContext(PersonalDashboardContext);
  if (!ctx) throw new Error('usePersonalDashboard must be used within PersonalDashboardProvider');
  return ctx;
}
