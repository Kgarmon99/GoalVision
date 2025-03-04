import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Goal } from "@shared/schema";
import { Link } from "wouter";
import { PlusCircle } from "lucide-react";

interface GoalProgressCardProps {
  goal: Goal;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  // Calculate percentage complete
  const percentComplete = Math.round((goal.current / goal.target) * 100);
  
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
  
  return (
    <Card className="bg-gray-900 border border-green-600">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-0">
          <div>
            <p className="text-sm font-medium text-green-400">{goal.name}</p>
            <div className="flex items-baseline gap-2">
              <p className="mt-1 text-xl sm:text-2xl font-bold text-white">
                {formatValue(goal.current, goal.unit)}
              </p>
              <p className="text-xs sm:text-sm text-green-400">
                of {formatValue(goal.target, goal.unit)}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center self-start px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-400 border border-green-500">
            {percentComplete}% complete
          </span>
        </div>
        <div className="mt-3 sm:mt-4">
          <Progress value={percentComplete} className="h-2.5 bg-gray-800" />
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-green-400">0%</span>
            <span className="text-green-400">100%</span>
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <Link href={`/add-progress?goalId=${goal.id}`}>
            <Button variant="outline" size="sm" className="text-xs border-green-500 text-green-400 hover:bg-gray-800">
              <PlusCircle className="h-3 w-3 mr-1" />
              <span className="hidden xs:inline">Update</span> Progress
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
