import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from "lucide-react";
import { Metric } from "@shared/schema";

interface MetricsCardProps {
  title: string;
  metrics: Metric[];
}

const MetricsCard = ({ title, metrics }: MetricsCardProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-gray-900">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
            <span className="text-sm font-medium text-gray-500">{metric.name}</span>
            <div className="flex items-center">
              <span className="font-semibold text-gray-900">{metric.value}</span>
              {metric.trend !== 0 && (
                <span 
                  className={`ml-2 text-xs font-medium flex items-center ${
                    metric.trendDirection === "up" 
                      ? "text-green-600" 
                      : metric.trendDirection === "down" 
                        ? metric.name === "Churn Rate" ? "text-green-600" : "text-yellow-600"
                        : "text-gray-600"
                  }`}
                >
                  {metric.trendDirection === "up" ? (
                    <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                  ) : metric.trendDirection === "down" ? (
                    <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                  ) : (
                    <MinusIcon className="h-3 w-3 mr-0.5" />
                  )}
                  {Math.abs(metric.trend)}%
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
