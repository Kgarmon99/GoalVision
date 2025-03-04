import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import { Metric } from "@shared/schema";

interface MetricsCardProps {
  title: string;
  metrics: Metric[];
}

const MetricsCard = ({ title, metrics }: MetricsCardProps) => {
  return (
    <Card className="h-full bg-gray-900 border border-green-600">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-lg font-semibold text-green-400">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 pb-3 sm:pb-6">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex flex-col xs:flex-row xs:justify-between xs:items-center py-2 border-b border-gray-800 last:border-0">
            <span className="text-sm font-medium text-green-400 mb-1 xs:mb-0">{metric.name}</span>
            <div className="flex items-center">
              <span className="font-semibold text-white">{metric.value}</span>
              {metric.trend !== 0 && (
                <span 
                  className={`ml-2 text-xs font-medium flex items-center ${
                    metric.trendDirection === "up" 
                      ? "text-green-400" 
                      : metric.trendDirection === "down" 
                        ? metric.name === "Churn Rate" ? "text-green-400" : "text-yellow-400"
                        : "text-gray-400"
                  }`}
                >
                  {metric.trendDirection === "up" ? (
                    <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                  ) : metric.trendDirection === "down" ? (
                    <ArrowDownIcon className="h-3 w-3 mr-0.5" />
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
