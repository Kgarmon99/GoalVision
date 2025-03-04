import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@shared/schema";

interface GoalProgressCardProps {
  goal: Goal;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  // Calculate percentage complete
  const percentComplete = Math.round((goal.current / goal.target) * 100);
  
  // Format values with units
  const formatValue = (value: number, unit: string) => {
    if (unit === "M") {
      return `$${value}M`;
    } else if (unit === "K") {
      return `$${value}K`;
    } else {
      return value.toLocaleString();
    }
  };
  
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{goal.name}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {formatValue(goal.current, goal.unit)}
            </p>
            <p className="text-sm text-gray-500">
              of {formatValue(goal.target, goal.unit)} target
            </p>
          </div>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {percentComplete}% complete
          </span>
        </div>
        <div className="mt-4">
          <Progress value={percentComplete} className="h-2.5" />
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-500">0%</span>
            <span className="text-gray-500">100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
