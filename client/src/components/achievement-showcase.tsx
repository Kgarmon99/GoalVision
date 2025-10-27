import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  tier: string;
  category: string;
  requirement: number;
  xpReward: number;
  unlockMessage: string;
}

interface UserAchievement {
  id: number;
  profileId: number;
  achievementId: number;
  progress: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export function AchievementShowcase() {
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  
  const { data: achievements = [] } = useQuery<Achievement[]>({
    queryKey: ['/api/gamification/achievements'],
  });

  const { data: userAchievements = [] } = useQuery<UserAchievement[]>({
    queryKey: ['/api/gamification/achievements/user'],
  });

  const getUserProgress = (achievementId: number) => {
    return userAchievements.find(ua => ua.achievementId === achievementId);
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-700 to-amber-900';
      case 'silver': return 'from-gray-400 to-gray-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'platinum': return 'from-cyan-400 to-blue-600';
      case 'diamond': return 'from-purple-400 to-pink-600';
      default: return 'from-primary to-primary/60';
    }
  };

  const unlockedAchievements = achievements.filter(a => {
    const userProgress = getUserProgress(a.id);
    return userProgress?.unlocked;
  });

  return (
    <>
      <Card className="glass-premium chromatic-edge" data-testid="card-achievements">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white text-glow flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500 drop-shadow-glow" />
              Achievements
            </CardTitle>
            <span className="text-sm text-gray-400">
              {unlockedAchievements.length} / {achievements.length}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-3">
            {achievements.slice(0, 10).map((achievement) => {
              const userProgress = getUserProgress(achievement.id);
              const isUnlocked = userProgress?.unlocked ?? false;
              const progress = userProgress?.progress ?? 0;
              const progressPercent = (progress / achievement.requirement) * 100;

              return (
                <div
                  key={achievement.id}
                  onClick={() => setSelectedAchievement(achievement)}
                  className={`relative p-3 rounded-lg cursor-pointer transition-all hover:scale-110 ${
                    isUnlocked
                      ? `bg-gradient-to-br ${getTierColor(achievement.tier)} shadow-lg hover:shadow-xl`
                      : 'glass-card opacity-40 hover:opacity-60'
                  }`}
                  data-testid={`achievement-${achievement.id}`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">{achievement.icon}</div>
                    {!isUnlocked && (
                      <Lock className="h-3 w-3 text-gray-500 mx-auto absolute top-1 right-1" />
                    )}
                    <div className="text-xs font-semibold text-white truncate">
                      {achievement.name}
                    </div>
                    {!isUnlocked && progress > 0 && (
                      <div className="mt-1">
                        <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, progressPercent)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-300 mt-0.5">
                          {progress}/{achievement.requirement}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedAchievement} onOpenChange={() => setSelectedAchievement(null)}>
        <DialogContent className="glass-premium border-primary/40">
          {selectedAchievement && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white text-glow flex items-center gap-3">
                  <span className="text-4xl">{selectedAchievement.icon}</span>
                  {selectedAchievement.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-300">{selectedAchievement.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card p-3 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase">Tier</div>
                    <div className="text-lg font-bold text-white capitalize">{selectedAchievement.tier}</div>
                  </div>
                  <div className="glass-card p-3 rounded-lg">
                    <div className="text-xs text-gray-400 uppercase">XP Reward</div>
                    <div className="text-lg font-bold text-primary">+{selectedAchievement.xpReward} XP</div>
                  </div>
                </div>
                <div className="glass-card p-3 rounded-lg">
                  <div className="text-xs text-gray-400 uppercase mb-2">Progress</div>
                  <Progress
                    value={((getUserProgress(selectedAchievement.id)?.progress ?? 0) / selectedAchievement.requirement) * 100}
                    className="h-3"
                  />
                  <div className="text-sm text-gray-300 mt-2">
                    {getUserProgress(selectedAchievement.id)?.progress ?? 0} / {selectedAchievement.requirement}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
