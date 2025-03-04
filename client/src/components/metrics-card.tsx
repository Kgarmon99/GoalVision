import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3
} from "lucide-react";
import { Metric } from "@shared/schema";

interface MetricsCardProps {
  title: string;
  metrics: Metric[];
}

// Get appropriate icon for metric type
const getMetricIcon = (metricName: string) => {
  const name = metricName.toLowerCase();
  if (name.includes('revenue') || name.includes('mrr') || name.includes('arr') || name.includes('cost')) {
    return <DollarSign className="h-4 w-4 text-green-400" />;
  } else if (name.includes('user') || name.includes('customer') || name.includes('churn') || name.includes('retention')) {
    return <Users className="h-4 w-4 text-green-400" />;
  } else if (name.includes('growth') || name.includes('increase')) {
    return <TrendingUp className="h-4 w-4 text-green-400" />;
  } else {
    return <BarChart3 className="h-4 w-4 text-green-400" />;
  }
};

const MetricsCard = ({ title, metrics }: MetricsCardProps) => {
  return (
    <Card className="h-full bg-gray-900 border border-green-600 glow-card">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-lg font-semibold text-green-400 text-glow flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
        {metrics.map((metric) => (
          <div 
            key={metric.id} 
            className="flex flex-col xs:flex-row xs:justify-between xs:items-center py-2 border-b border-gray-800 last:border-0 hover:bg-gray-800/40 rounded-md px-2 transition-colors duration-200"
          >
            <div className="flex items-center mb-1 xs:mb-0">
              {getMetricIcon(metric.name)}
              <span className="text-sm font-medium text-green-400 ml-2">{metric.name}</span>
            </div>
            <div className="flex items-center">
              <span className="font-semibold text-white">{metric.value}</span>
              {metric.trend !== 0 && (
                <span 
                  className={`ml-2 text-xs font-medium flex items-center ${
                    metric.trendDirection === "up" 
                      ? metric.name === "Churn Rate" ? "text-yellow-400" : "text-green-400 text-glow" 
                      : metric.trendDirection === "down" 
                        ? metric.name === "Churn Rate" ? "text-green-400 text-glow" : "text-yellow-400"
                        : "text-gray-400"
                  }`}
                >
                  {metric.trendDirection === "up" ? (
                    <ArrowUpIcon className="h-3 w-3 mr-0.5 pulse-glow" />
                  ) : metric.trendDirection === "down" ? (
                    <ArrowDownIcon className="h-3 w-3 mr-0.5 pulse-glow" />
                  ) : (
                    <MinusIcon className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(metric.trend || 0)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
