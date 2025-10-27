import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Flame, Zap, Star } from "lucide-react";
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

  // Update streak on component mount
  const updateStreakMutation = useMutation({
    mutationFn: () => apiRequest<GamificationProfile>('POST', '/api/gamification/streak/update', {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/gamification/profile'] });
    }
  });

  useEffect(() => {
    // Update streak when component mounts (only once)
    if (profile) {
      updateStreakMutation.mutate();
    }
  }, [profile?.id]);

  useEffect(() => {
    // Check for level up
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
      <Card className="glass-frosted chromatic-edge" data-testid="card-gamification-loading">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-primary/20 rounded mb-2"></div>
            <div className="h-8 bg-primary/20 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate XP needed for next level
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
        />
      )}
      
      <Card className="glass-premium chromatic-edge volumetric-light" data-testid="card-gamification-hud">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Level and XP */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full glass-card chromatic-edge flex items-center justify-center">
                    <Trophy className="h-7 w-7 text-primary drop-shadow-glow" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary text-black text-xs font-bold flex items-center justify-center border-2 border-black">
                    {profile.level}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-primary/80 uppercase tracking-wide font-semibold">Level {profile.level}</div>
                  <div className="text-2xl font-bold text-white text-glow">
                    {xpInLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
                  </div>
                </div>
              </div>
              
              {/* Streak */}
              <div className="flex items-center gap-2" data-testid="streak-counter">
                <div className={`transition-transform ${profile.currentStreak > 0 ? 'animate-pulse' : ''}`}>
                  <Flame className={`h-8 w-8 ${profile.currentStreak > 0 ? 'text-orange-500' : 'text-gray-600'} drop-shadow-glow`} />
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white text-glow">{profile.currentStreak}</div>
                  <div className="text-xs text-primary/80 uppercase tracking-wide font-semibold">Day Streak</div>
                </div>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="space-y-2">
              <div className="relative h-3 bg-black/40 rounded-full overflow-hidden border border-primary/30">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary/80 via-primary to-primary/80 transition-all duration-500 ease-out"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
              
              {/* Stats Row */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1" data-testid="stat-goals-completed">
                  <Star className="h-3 w-3 text-primary" />
                  <span>{profile.totalGoalsCompleted} Goals</span>
                </div>
                <div className="flex items-center gap-1" data-testid="stat-prospects-won">
                  <Zap className="h-3 w-3 text-primary" />
                  <span>{profile.totalProspectsWon} Wins</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-primary" />
                  <span>Best: {profile.longestStreak} days</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
