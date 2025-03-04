import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, Trash2Icon } from "lucide-react";
import { Metric } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface MetricsCardProps {
  title: string;
  metrics: Metric[];
}

const MetricsCard = ({ title, metrics }: MetricsCardProps) => {
  const { toast } = useToast();
  const [deletingMetricId, setDeletingMetricId] = useState<number | null>(null);
  
  // Delete metric mutation
  const deleteMetricMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/metrics/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/category/growth'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/category/revenue'] });
      
      toast({
        title: "Metric deleted",
        description: "Metric has been deleted successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting metric",
        description: error instanceof Error ? error.message : "There was a problem deleting the metric.",
        variant: "destructive",
      });
    }
  });
  
  const handleDeleteMetric = async (id: number) => {
    setDeletingMetricId(id);
    try {
      await deleteMetricMutation.mutateAsync(id);
    } finally {
      setDeletingMetricId(null);
    }
  };
  
  return (
    <Card className="h-full bg-gray-900 border border-green-600">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-green-400">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
            <span className="text-sm font-medium text-green-400">{metric.name}</span>
            <div className="flex items-center">
              <span className="font-semibold text-white mr-2">{metric.value}</span>
              {metric.trend !== 0 && (
                <span 
                  className={`mr-2 text-xs font-medium flex items-center ${
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
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0 text-red-400 hover:text-red-500 hover:bg-gray-800"
                  >
                    <Trash2Icon className="h-3 w-3" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border border-green-600 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Metric</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to delete the metric "{metric.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 text-white border-green-600 hover:bg-gray-700">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={() => handleDeleteMetric(metric.id)}
                      disabled={deletingMetricId === metric.id}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {deletingMetricId === metric.id ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MetricsCard;
