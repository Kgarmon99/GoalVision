import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, XCircle, Target, Award } from "lucide-react";
import { GoalStatus } from "@shared/schema";

interface StatusIndicatorProps {
  statuses: GoalStatus[];
}

const StatusIndicator = ({ statuses }: StatusIndicatorProps) => {
  // Count status types
  const countStatuses = () => {
    const counts = {
      onTrack: 0,
      needsAttention: 0,
      offTrack: 0
    };
    
    statuses.forEach(status => {
      if (status.status === "on-track") counts.onTrack++;
      else if (status.status === "needs-attention") counts.needsAttention++;
      else if (status.status === "off-track") counts.offTrack++;
    });
    
    return counts;
  };
  
  const statusCounts = countStatuses();
  const totalGoals = statuses.length;
  const onTrackPercentage = totalGoals > 0 ? Math.round((statusCounts.onTrack / totalGoals) * 100) : 0;
  
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

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on-track":
        return <CheckCircle className="h-4 w-4 text-green-400 mr-1" />;
      case "needs-attention":
        return <AlertTriangle className="h-4 w-4 text-yellow-400 mr-1" />;
      case "off-track":
        return <XCircle className="h-4 w-4 text-red-400 mr-1" />;
      default:
        return null;
    }
  };
  
  return (
    <Card className="h-full bg-gray-900 border border-green-600 glow-card stat-card">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-lg font-semibold text-green-400 glow-text flex items-center">
          <Target className="h-5 w-5 mr-2" />
          Goal Status
        </CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6 pb-3 sm:pb-6">
        {/* Status Summary */}
        <div className="bg-gray-800/50 rounded-lg p-3 mb-4 stats-wrapper">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-green-400 flex items-center">
              <Award className="h-4 w-4 mr-1" />
              Goal Health
            </span>
            <span className="text-sm font-bold text-white">{onTrackPercentage}% on track</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-2">
            <div 
              className="bg-green-500 h-2.5 rounded-full animated-progress-bar" 
              style={{ width: `${onTrackPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <div>
              <span className="text-green-400">{statusCounts.onTrack}</span> on track
            </div>
            <div>
              <span className="text-yellow-400">{statusCounts.needsAttention}</span> needs attention
            </div>
            <div>
              <span className="text-red-400">{statusCounts.offTrack}</span> off track
            </div>
          </div>
        </div>

        {/* Individual Goal Statuses */}
        <div className="space-y-2 stats-wrapper">
          {statuses.map((status) => (
            <div 
              key={status.id} 
              className="flex flex-col xs:flex-row xs:items-center xs:justify-between py-2 sm:py-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/40 rounded px-2 transition-all duration-200 group"
            >
              <div className="flex items-center mb-2 xs:mb-0">
                <div className="flex-shrink-0 relative">
                  <span className={`w-3 h-3 ${getDotColor(status.status)} rounded-full inline-block`}></span>
                  {status.status === "on-track" && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full opacity-70 animate-ping"></span>
                  )}
                </div>
                <div className="ml-3">
                  <span className="text-sm font-medium text-white group-hover:text-green-300 transition-colors">{status.goalName}</span>
                </div>
              </div>
              <div className="text-sm ml-6 xs:ml-0">
                <Badge 
                  variant={getBadgeVariant(status.status)}
                  className={`${
                    status.status === "on-track" 
                      ? "bg-green-900 text-green-400 border border-green-500 hover:bg-green-800 gradient-border" 
                      : status.status === "needs-attention" 
                        ? "bg-yellow-900 text-yellow-400 border border-yellow-500 hover:bg-yellow-800" 
                        : status.status === "off-track" 
                          ? "bg-red-900 text-red-400 border border-red-500 hover:bg-red-800"
                          : ""
                  } group-hover:scale-105 transition-transform`}
                >
                  <div className="flex items-center">
                    {getStatusIcon(status.status)}
                    {getStatusText(status.status)}
                  </div>
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusIndicator;
