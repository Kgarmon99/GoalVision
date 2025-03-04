import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Goal } from "@shared/schema";
import { Link } from "wouter";
import { PlusCircle, TrendingUp, ArrowUpRight } from "lucide-react";

interface GoalProgressCardProps {
  goal: Goal;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  // Calculate percentage complete
  const percentComplete = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  
  // Format values with units
  const formatValue = (value: number, unit: string | null) => {
    if (unit === "M") {
      return `$${value}M`;
    } else if (unit === "K") {
      return `$${value}K`;
    } else {
      return value.toLocaleString();
    }
  };

  // Determine the progress color class based on percentage
  const getProgressColorClass = (percent: number) => {
    if (percent >= 75) return "bg-green-500";
    if (percent >= 50) return "bg-green-600";
    if (percent >= 25) return "bg-green-700";
    return "bg-green-800";
  };
  
  return (
    <Card className="glow-card bg-gray-900 border border-green-600 hover:shadow-xl transition-all duration-300">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
          <div>
            <div className="flex items-center">
              <p className="text-sm font-medium text-green-400 glow-text">{goal.name}</p>
              <TrendingUp className="h-3 w-3 ml-1 text-green-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <p className="mt-1 text-xl sm:text-2xl font-bold text-white metric-value">
                {formatValue(goal.current, goal.unit)}
              </p>
              <p className="text-xs sm:text-sm text-green-400">
                of {formatValue(goal.target, goal.unit)}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-400 border border-green-500 gradient-border pulse-animation">
            {percentComplete}% complete
          </span>
        </div>
        <div className="mt-3 sm:mt-4 progress-glow">
          <Progress 
            value={percentComplete} 
            className={`h-2.5 bg-gray-800 animated-progress-bar`} 
            indicatorClassName={getProgressColorClass(percentComplete)}
          />
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-green-400">0%</span>
            <span className="text-green-400">100%</span>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Link href={`/add-progress?goalId=${goal.id}`}>
            <Button variant="outline" size="sm" className="text-xs border-green-500 text-green-400 hover:bg-gray-800 hover:border-green-400 group">
              <PlusCircle className="h-3 w-3 mr-1 group-hover:text-white transition-colors" />
              <span className="hidden xs:inline">Update</span> Progress
              <ArrowUpRight className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
