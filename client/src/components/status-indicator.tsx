import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoalStatus } from "@shared/schema";

interface StatusIndicatorProps {
  statuses: GoalStatus[];
}

const StatusIndicator = ({ statuses }: StatusIndicatorProps) => {
  // Function to determine dot color based on status
  const getDotColor = (status: string): string => {
    switch (status) {
      case "on-track":
        return "bg-green-500";
      case "needs-attention":
        return "bg-yellow-500";
      case "off-track":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  
  // Function to get badge styling based on status
  const getBadgeVariant = (status: string): "default" | "destructive" | "secondary" | "outline" => {
    switch (status) {
      case "on-track":
        return "secondary";
      case "needs-attention":
        return "outline";
      case "off-track":
        return "destructive";
      default:
        return "default";
    }
  };
  
  // Function to get display text for status
  const getStatusText = (status: string): string => {
    switch (status) {
      case "on-track":
        return "On Track";
      case "needs-attention":
        return "Needs Attention";
      case "off-track":
        return "Off Track";
      default:
        return "Unknown";
    }
  };
  
  return (
    <Card className="h-full bg-gray-900 border border-green-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-green-400">Goal Status</CardTitle>
      </CardHeader>
      <CardContent>
        {statuses.map((status) => (
          <div key={status.id} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className={`w-3 h-3 ${getDotColor(status.status)} rounded-full inline-block`}></span>
              </div>
              <div className="ml-3">
                <span className="text-sm font-medium text-white">{status.goalName}</span>
              </div>
            </div>
            <div className="text-sm">
              <Badge 
                variant={getBadgeVariant(status.status)}
                className={`${
                  status.status === "on-track" 
                    ? "bg-green-900 text-green-400 border border-green-500 hover:bg-green-800" 
                    : status.status === "needs-attention" 
                      ? "bg-yellow-900 text-yellow-400 border border-yellow-500 hover:bg-yellow-800" 
                      : status.status === "off-track" 
                        ? "bg-red-900 text-red-400 border border-red-500 hover:bg-red-800"
                        : ""
                }`}
              >
                {getStatusText(status.status)}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default StatusIndicator;
