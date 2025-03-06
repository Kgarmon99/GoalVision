import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  MinusIcon, 
  TrendingUp, 
  DollarSign, 
  Users, 
  BarChart3,
  RefreshCw
} from "lucide-react";
import { Metric } from "@shared/schema";
import { useState } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MetricsCardProps {
  title: string;
  metrics: Metric[];
  category?: string;
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

const MetricsCard = ({ title, metrics, category }: MetricsCardProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  const handleRefreshMetrics = async () => {
    if (!category) return;
    
    setIsRefreshing(true);
    
    try {
      // Call our refresh metrics endpoint
      const response = await fetch('/api/metrics/refresh', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh metrics');
      }
      
      // Invalidate queries to refresh UI
      await queryClient.invalidateQueries({ queryKey: [`/api/metrics/category/${category}`] });
      
      // Show success message
      toast({
        title: "Metrics refreshed",
        description: `${title} metrics have been updated based on current goal data.`,
      });
    } catch (error) {
      console.error('Error refreshing metrics:', error);
      toast({
        title: "Error refreshing metrics",
        description: "There was an issue updating the metrics.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <Card className="h-full bg-gray-900 border border-green-600 glow-card">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6 flex flex-row justify-between items-center">
        <CardTitle className="text-lg font-semibold text-green-400 text-glow flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          {title}
        </CardTitle>
        
        {category && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshMetrics}
            disabled={isRefreshing}
            className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-gray-800"
            title="Refresh metrics based on current goal data"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        )}
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
