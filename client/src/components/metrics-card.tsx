import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, Edit2Icon } from "lucide-react";
import { Metric, insertMetricSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Extend schema with validations
const editMetricSchema = insertMetricSchema.extend({
  value: z.string().min(1, "Value is required"),
  previousValue: z.string().nullable().optional(),
  trend: z.coerce.number().nullable().optional(),
  trendDirection: z.enum(["up", "down", "stable"]).nullable().optional(),
});

type EditMetricFormValues = z.infer<typeof editMetricSchema>;

interface MetricsCardProps {
  title: string;
  metrics: Metric[];
}

const MetricsCard = ({ title, metrics }: MetricsCardProps) => {
  const { toast } = useToast();
  const [editingMetric, setEditingMetric] = useState<Metric | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Update metric mutation
  const updateMetricMutation = useMutation({
    mutationFn: async (data: { id: number; values: EditMetricFormValues }) => {
      return apiRequest(`/api/metrics/${data.id}`, "PATCH", data.values);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/category/growth'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/category/revenue'] });
      
      toast({
        title: "Metric updated",
        description: "Metric has been updated successfully.",
        variant: "default",
      });
      
      setIsDialogOpen(false);
      setEditingMetric(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating metric",
        description: error instanceof Error ? error.message : "There was a problem updating the metric.",
        variant: "destructive",
      });
    }
  });
  
  // Initialize form
  const form = useForm<EditMetricFormValues>({
    resolver: zodResolver(editMetricSchema),
    defaultValues: {
      name: editingMetric?.name || "",
      value: editingMetric?.value || "",
      category: editingMetric?.category || "",
      previousValue: editingMetric?.previousValue || null,
      trend: editingMetric?.trend || null,
      trendDirection: (editingMetric?.trendDirection as "up" | "down" | "stable" | null) || "stable",
    },
  });
  
  // Handle opening the edit dialog
  const handleEditClick = (metric: Metric) => {
    setEditingMetric(metric);
    form.reset({
      name: metric.name,
      value: metric.value,
      category: metric.category,
      previousValue: metric.previousValue,
      trend: metric.trend,
      trendDirection: metric.trendDirection as "up" | "down" | "stable" | null,
    });
    setIsDialogOpen(true);
  };
  
  // Handle form submission
  const onSubmit = async (data: EditMetricFormValues) => {
    if (!editingMetric) return;
    
    await updateMetricMutation.mutateAsync({
      id: editingMetric.id,
      values: data
    });
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
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 text-green-400 hover:text-green-500 hover:bg-gray-800"
                onClick={() => handleEditClick(metric)}
              >
                <Edit2Icon className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border border-green-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Metric</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update the value and trend for this metric.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-400">Metric Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800 border-green-600 text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-400">Current Value</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="bg-gray-800 border-green-600 text-white"
                      />
                    </FormControl>
                    <FormDescription className="text-gray-500">
                      Examples: "2.5M", "$500K", "25%", etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="previousValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-green-400">Previous Value</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          className="bg-gray-800 border-green-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="trend"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-green-400">Trend (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          step="any"
                          value={field.value || ""}
                          className="bg-gray-800 border-green-600 text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="trendDirection"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-400">Trend Direction</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || "stable"}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-gray-800 border-green-600 text-white">
                          <SelectValue placeholder="Select trend direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-gray-900 border-green-600 text-white">
                        <SelectItem value="up">Up</SelectItem>
                        <SelectItem value="down">Down</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateMetricMutation.isPending} 
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {updateMetricMutation.isPending ? "Updating..." : "Update Metric"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MetricsCard;
