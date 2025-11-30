import { useQuery, useMutation } from "@tanstack/react-query";
import { Trophy, Flame, Zap, Star, Shield, Target } from "lucide-react";
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
      <div className="tactical-card p-3 md:p-4" data-testid="card-gamification-loading">
        <div className="animate-pulse">
          <div className="h-3 md:h-4 bg-primary/10 mb-2"></div>
          <div className="h-6 md:h-8 bg-primary/10"></div>
        </div>
      </div>
    );
  }

  const currentLevelXp = (profile.level - 1) * (profile.level - 1) * 100;
  const nextLevelXp = profile.level * profile.level * 100;
  const xpInLevel = profile.xp - currentLevelXp;
  const xpNeededForLevel = nextLevelXp - currentLevelXp;
  const progressPercent = (xpInLevel / xpNeededForLevel) * 100;

  const getRankTitle = () => {
    if (profile.level < 5) return 'RECRUIT';
    if (profile.level < 10) return 'OPERATIVE';
    if (profile.level < 20) return 'SPECIALIST';
    if (profile.level < 50) return 'COMMANDER';
    return 'ELITE';
  };

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
      
      <div className="tactical-card glow-border-animated relative" data-testid="card-gamification-hud">
        <div className="mil-tag">OPR-STATUS</div>
        <div className="p-3 md:p-5 pt-6 md:pt-8">
          
          {/* Mobile Layout */}
          <div className="md:hidden">
            <div className="flex items-center gap-3 mb-4">
              {/* Rank Badge Mobile */}
              <div className="relative flex-shrink-0">
                <div className="w-14 h-14 border-2 border-primary bg-black flex items-center justify-center relative">
                  <Shield className="h-7 w-7 text-primary" style={{ filter: 'drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))' }} />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-black text-[9px] font-black px-2 py-0.5 font-mono whitespace-nowrap">
                  LVL {profile.level}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="data-label mb-0.5 text-[8px]">OPERATOR RANK</div>
                <div className="text-white font-black text-sm tracking-widest truncate" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {getRankTitle()}
                </div>
                
                {/* XP Bar Mobile */}
                <div className="mt-2">
                  <div className="progress-tactical h-3">
                    <div 
                      className="progress-tactical-fill" 
                      style={{ width: `${Math.min(100, progressPercent)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[8px] text-gray-500 font-mono">{Math.round(progressPercent)}%</span>
                    <span className="text-[8px] text-primary font-mono font-bold">{xpInLevel}/{xpNeededForLevel} XP</span>
                  </div>
                </div>
              </div>
              
              {/* Streak Mobile */}
              <div className="flex flex-col items-center border border-orange-500/30 bg-black px-3 py-2 flex-shrink-0" data-testid="streak-counter">
                <Flame 
                  className={`h-6 w-6 ${profile.currentStreak > 0 ? 'text-orange-500 animate-pulse' : 'text-gray-700'}`} 
                  style={profile.currentStreak > 0 ? { filter: 'drop-shadow(0 0 8px rgba(249, 115, 22, 0.9))' } : {}}
                />
                <div className="text-lg font-black text-white font-mono leading-none mt-1">{profile.currentStreak}</div>
                <div className="text-[7px] text-orange-500/70 font-mono uppercase">DAYS</div>
              </div>
            </div>
            
            {/* Stats Row Mobile */}
            <div className="flex items-center justify-around border-t border-primary/20 pt-3">
              <div className="text-center" data-testid="stat-goals-completed">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Target className="h-3 w-3 text-primary" />
                  <span className="font-mono text-base font-bold text-white">{profile.totalGoalsCompleted}</span>
                </div>
                <div className="data-label text-[7px]">OBJ</div>
              </div>
              <div className="w-px h-8 bg-primary/20" />
              <div className="text-center" data-testid="stat-prospects-won">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Zap className="h-3 w-3 text-primary" />
                  <span className="font-mono text-base font-bold text-white">{profile.totalProspectsWon}</span>
                </div>
                <div className="data-label text-[7px]">WINS</div>
              </div>
              <div className="w-px h-8 bg-primary/20" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Trophy className="h-3 w-3 text-amber-500" />
                  <span className="font-mono text-base font-bold text-white">{profile.longestStreak}</span>
                </div>
                <div className="data-label text-[7px]">BEST</div>
              </div>
              <div className="w-px h-8 bg-primary/20" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-0.5">
                  <Star className="h-3 w-3 text-primary" />
                  <span className="font-mono text-base font-bold text-white">{profile.xp.toLocaleString()}</span>
                </div>
                <div className="data-label text-[7px]">TOTAL XP</div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between gap-6">
            
            {/* Rank Badge */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 border-2 border-primary bg-black flex items-center justify-center relative">
                  <Shield className="h-10 w-10 text-primary" style={{ filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))' }} />
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-primary" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-primary" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-primary" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-primary" />
                </div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary text-black text-xs font-black px-3 py-1 font-mono">
                  LVL {profile.level}
                </div>
              </div>
              <div>
                <div className="data-label mb-1">OPERATOR RANK</div>
                <div className="text-white font-black text-xl tracking-widest" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {getRankTitle()}
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-1">
                  CLEARANCE: {profile.level < 10 ? 'BASIC' : profile.level < 25 ? 'ELEVATED' : 'TOP SECRET'}
                </div>
              </div>
            </div>

            {/* XP Bar */}
            <div className="flex-1 max-w-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="data-label">EXPERIENCE POINTS</span>
                <span className="font-mono text-sm text-primary font-bold">
                  {xpInLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
                </span>
              </div>
              <div className="progress-tactical h-4">
                <div 
                  className="progress-tactical-fill" 
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-500 font-mono">{Math.round(progressPercent)}% TO PROMOTION</span>
                <span className="text-[10px] text-gray-500 font-mono">TOTAL XP: {profile.xp.toLocaleString()}</span>
              </div>
            </div>

            {/* Streak Counter */}
            <div className="flex items-center gap-4 border-2 border-orange-500/30 bg-black px-5 py-3 relative" data-testid="streak-counter-desktop">
              <div className="absolute -top-2 left-3 bg-black px-2">
                <span className="text-[9px] text-orange-500 font-mono font-bold tracking-wider">STREAK</span>
              </div>
              <div className={`${profile.currentStreak > 0 ? 'animate-pulse' : ''}`}>
                <Flame 
                  className={`h-10 w-10 ${profile.currentStreak > 0 ? 'text-orange-500' : 'text-gray-700'}`} 
                  style={profile.currentStreak > 0 ? { filter: 'drop-shadow(0 0 12px rgba(249, 115, 22, 0.9))' } : {}}
                />
              </div>
              <div>
                <div className="text-3xl font-black text-white font-mono">{profile.currentStreak}</div>
                <div className="text-[10px] text-orange-500/70 font-mono uppercase">DAYS</div>
              </div>
            </div>

            {/* Combat Stats */}
            <div className="hidden xl:flex items-center gap-8 border border-primary/20 bg-black/50 px-6 py-3">
              <div className="text-center" data-testid="stat-goals-completed-desktop">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Target className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xl font-bold text-white">{profile.totalGoalsCompleted}</span>
                </div>
                <div className="data-label">OBJECTIVES</div>
              </div>
              <div className="w-px h-10 bg-primary/20" />
              <div className="text-center" data-testid="stat-prospects-won-desktop">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="font-mono text-xl font-bold text-white">{profile.totalProspectsWon}</span>
                </div>
                <div className="data-label">VICTORIES</div>
              </div>
              <div className="w-px h-10 bg-primary/20" />
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span className="font-mono text-xl font-bold text-white">{profile.longestStreak}</span>
                </div>
                <div className="data-label">RECORD</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
