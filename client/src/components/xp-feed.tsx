import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Trophy, Target, TrendingUp, Award } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface XpEvent {
  id: number;
  profileId: number;
  eventType: string;
  xpAmount: number;
  multiplier: number;
  goalId?: number;
  prospectId?: number;
  achievementId?: number;
  description: string;
  createdAt: string;
}

export function XpFeed() {
  const { data: events = [], isLoading } = useQuery<XpEvent[]>({
    queryKey: ['/api/gamification/xp/recent/10'],
  });

  if (isLoading) {
    return null;
  }

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'goal_completed':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'goal_progress':
        return <Target className="h-4 w-4 text-primary" />;
      case 'achievement':
        return <Award className="h-4 w-4 text-purple-500" />;
      case 'streak_bonus':
        return <Zap className="h-4 w-4 text-orange-500" />;
      case 'goal_created':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      default:
        return <Zap className="h-4 w-4 text-primary" />;
    }
  };

  return (
    <Card className="glass-premium chromatic-edge" data-testid="card-xp-feed">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-white text-glow flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary drop-shadow-glow" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          {events.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <p>No activity yet</p>
              <p className="text-sm mt-2">Complete goals to earn XP!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-start gap-3 p-3 rounded-lg glass-card hover:bg-primary/5 transition-colors entrance-animation"
                  style={{ animationDelay: `${index * 50}ms` }}
                  data-testid={`xp-event-${event.id}`}
                >
                  <div className="mt-0.5">{getEventIcon(event.eventType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium">{event.description}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-primary font-bold text-sm">+{Math.round(event.xpAmount * event.multiplier)}</span>
                    <span className="text-xs text-primary/60">XP</span>
                    {event.multiplier > 1 && (
                      <span className="text-xs text-orange-500 font-semibold ml-1">
                        ×{event.multiplier.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
