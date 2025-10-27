import { create } from 'zustand';

interface XpNotification {
  id: string;
  xpAmount: number;
  description: string;
  eventType: string;
}

interface XpNotificationStore {
  notifications: XpNotification[];
  addNotification: (xp: number, description: string, eventType: string) => void;
  removeNotification: (id: string) => void;
}

export const useXpNotifications = create<XpNotificationStore>((set) => ({
  notifications: [],
  addNotification: (xpAmount, description, eventType) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      notifications: [...state.notifications, { id, xpAmount, description, eventType }]
    }));
    // Auto-remove after 3 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    }, 3000);
  },
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
}));
