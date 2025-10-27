import { apiRequest, queryClient } from "./queryClient";
import { useXpNotifications } from "@/hooks/use-xp-notifications";

interface XpEvent {
  eventType: string;
  xpAmount: number;
  multiplier?: number;
  goalId?: number;
  prospectId?: number;
  achievementId?: number;
  description: string;
}

export async function awardXp(event: XpEvent) {
  try {
    await apiRequest('POST', '/api/gamification/xp', event);
    
    // Show notification
    useXpNotifications.getState().addNotification(
      event.xpAmount * (event.multiplier || 1),
      event.description,
      event.eventType
    );
    
    // Invalidate gamification queries to trigger UI update
    queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
    queryClient.invalidateQueries({ queryKey: ['/api/gamification/xp/recent'] });
    return true;
  } catch (error) {
    console.error('Failed to award XP:', error);
    return false;
  }
}

export function calculateGoalXp(current: number, target: number): number {
  // Guard against division by zero
  if (target <= 0) return 10;
  
  const progress = (current / target) * 100;
  
  // Base XP based on completion level
  if (progress >= 100) return 500; // Goal completed
  if (progress >= 75) return 200;  // 75% milestone
  if (progress >= 50) return 100;  // 50% milestone
  if (progress >= 25) return 50;   // 25% milestone
  
  return 10; // Small update
}

export function calculateProspectXp(value: number, probability: number): number {
  // XP based on deal value and probability
  const baseXp = Math.min(1000, Math.floor(value / 1000));
  const probabilityMultiplier = probability / 100;
  return Math.floor(baseXp * probabilityMultiplier);
}

export function getStreakMultiplier(streak: number): number {
  if (streak >= 30) return 3.0;  // 3x at 30 days
  if (streak >= 14) return 2.5;  // 2.5x at 2 weeks
  if (streak >= 7) return 2.0;   // 2x at 1 week
  if (streak >= 3) return 1.5;   // 1.5x at 3 days
  return 1.0;
}
