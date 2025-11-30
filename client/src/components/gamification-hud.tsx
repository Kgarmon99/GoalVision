import { useQuery, useMutation } from "@tanstack/react-query";
import { Trophy, Flame, Zap, Star, Shield } from "lucide-react";
import { useState, useEffect } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Confetti from "react-confetti";

interface GamificationProfile {
  id: number;
  userId: number;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  totalGoalsCompleted: number;
  totalProspectsWon: number;
  streakFreezeCount: number;
  motivationScore: number;
}

export function GamificationHUD() {
  const [showConfetti, setShowConfetti] = useState(false);
  const [previousLevel, setPreviousLevel] = useState<number | null>(null);

  const { data: profile, isLoading } = useQuery<GamificationProfile>({
    queryKey: ['/api/gamification/profile'],
  });

  const updateStreakMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/gamification/streak/update', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
    }
  });

  useEffect(() => {
    updateStreakMutation.mutate();
  }, []);

  useEffect(() => {
    if (profile && previousLevel !== null && profile.level > previousLevel) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
    if (profile) {
      setPreviousLevel(profile.level);
    }
  }, [profile?.level]);

  if (isLoading || !profile) {
    return (
      <div className="tactical-card p-4" data-testid="card-gamification-loading">
        <div className="animate-pulse">
          <div className="h-4 bg-primary/10 mb-2"></div>
          <div className="h-8 bg-primary/10"></div>
        </div>
      </div>
    );
  }

  const currentLevelXp = (profile.level - 1) * (profile.level - 1) * 100;
  const nextLevelXp = profile.level * profile.level * 100;
  const xpInLevel = profile.xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const progressPercent = (xpInLevel / xpNeededForLevel) * 100;

  return (
    <>
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
          colors={['#10b981', '#059669', '#047857', '#ffffff', '#22c55e']}
        />
      )}
      
      <div className="tactical-card glow-border-animated" data-testid="card-gamification-hud">
        <div className="p-5">
          <div className="flex items-center justify-between gap-6">
            
            {/* Level Badge */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-2 border-primary flex items-center justify-center bg-black">
                  <Shield className="h-8 w-8 text-primary" style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.6))' }} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-primary text-black text-sm font-bold flex items-center justify-center border border-black font-mono">
                  {profile.level}
                </div>
              </div>
              <div>
                <div className="data-label mb-1">OPERATOR RANK</div>
                <div className="text-white font-bold text-lg" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  LEVEL {profile.level}
                </div>
              </div>
            </div>

            {/* XP Bar */}
            <div className="flex-1 max-w-md">
              <div className="flex items-center justify-between mb-2">
                <span className="data-label">EXPERIENCE</span>
                <span className="font-mono text-sm text-primary">
                  {xpInLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
                </span>
              </div>
              <div className="progress-tactical">
                <div 
                  className="progress-tactical-fill" 
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500 font-mono">
                <span>{Math.round(progressPercent)}% TO NEXT RANK</span>
                <span>TOTAL: {profile.xp.toLocaleString()} XP</span>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-3 border border-primary/20 bg-black/50 px-4 py-3" data-testid="streak-counter">
              <div className={`${profile.currentStreak > 0 ? 'pulse-glow' : ''}`}>
                <Flame 
                  className={`h-8 w-8 ${profile.currentStreak > 0 ? 'text-orange-500' : 'text-gray-600'}`} 
                  style={profile.currentStreak > 0 ? { filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.8))' } : {}}
                />
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">{profile.currentStreak}</div>
                <div className="data-label">DAY STREAK</div>
              </div>
            </div>

            {/* Stats */}
            <div className="hidden lg:flex items-center gap-6">
              <div className="text-center" data-testid="stat-goals-completed">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star className="h-4 w-4 text-primary" />
                  <span className="font-mono text-lg text-white">{profile.totalGoalsCompleted}</span>
                </div>
                <div className="data-label">OBJECTIVES</div>
              </div>
              <div className="text-center" data-testid="stat-prospects-won">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-mono text-lg text-white">{profile.totalProspectsWon}</span>
                </div>
                <div className="data-label">VICTORIES</div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="font-mono text-lg text-white">{profile.longestStreak}</span>
                </div>
                <div className="data-label">BEST STREAK</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
