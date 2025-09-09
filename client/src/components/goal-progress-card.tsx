import { Card, CardContent } from "@/components/ui/card";
import { Goal } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { Target, Calendar, TrendingUp } from "lucide-react";

interface GoalProgressCardProps {
  goal: Goal;
  onDelete?: (id: number) => void;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const progress = Math.min(100, (goal.current / goal.target) * 100);
  
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">{goal.name}</h3>
            <div className="flex items-center text-sm text-gray-400 gap-4">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                <span>{goal.current} / {goal.target} {goal.unit}</span>
              </div>
              {goal.deadline && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{goal.deadline}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center text-right">
            <TrendingUp className={`h-5 w-5 mr-2 ${progress >= 75 ? 'text-green-500' : progress >= 50 ? 'text-yellow-500' : 'text-red-500'}`} />
            <span className="text-xl font-bold text-white">{Math.round(progress)}%</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}