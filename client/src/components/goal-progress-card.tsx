import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal, insertGoalSchema } from "@shared/schema";
import { Edit2Icon } from "lucide-react";
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

// Extend schema with validations
const editGoalSchema = insertGoalSchema.extend({
  current: z.coerce.number().min(0, "Current value must be a positive number"),
  target: z.coerce.number().min(1, "Target must be at least 1"),
});

type EditGoalFormValues = z.infer<typeof editGoalSchema>;

interface GoalProgressCardProps {
  goal: Goal;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
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
  
  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async (data: EditGoalFormValues) => {
      return apiRequest(`/api/goals/${goal.id}`, "PATCH", data);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      
      toast({
        title: "Goal updated",
        description: "Goal has been updated successfully.",
        variant: "default",
      });
      
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating goal",
        description: error instanceof Error ? error.message : "There was a problem updating the goal.",
        variant: "destructive",
      });
    }
  });
  
  // Initialize form
  const form = useForm<EditGoalFormValues>({
    resolver: zodResolver(editGoalSchema),
    defaultValues: {
      name: goal.name,
      current: goal.current,
      target: goal.target,
      unit: goal.unit,
      color: goal.color,
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: EditGoalFormValues) => {
    await updateGoalMutation.mutateAsync(data);
  };
  
  return (
    <Card className="bg-gray-900 border border-green-600">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-green-400">{goal.name}</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatValue(goal.current, goal.unit)}
            </p>
            <p className="text-sm text-green-400">
              of {formatValue(goal.target, goal.unit)} target
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-400 border border-green-500 mb-2">
              {percentComplete}% complete
            </span>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-green-400 hover:text-green-500 hover:bg-gray-800">
                  <Edit2Icon className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border border-green-600 text-white">
                <DialogHeader>
                  <DialogTitle className="text-white">Edit Goal</DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Update the progress and details of "{goal.name}".
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-400">Goal Name</FormLabel>
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="current"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-400">Current Value</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="any"
                                className="bg-gray-800 border-green-600 text-white"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="target"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-green-400">Target Value</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                type="number"
                                step="any"
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
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-green-400">Unit</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              value={field.value || ""}
                              className="bg-gray-800 border-green-600 text-white"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-500">
                            Examples: "M" for millions, "K" for thousands, "%" for percentage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={updateGoalMutation.isPending} 
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {updateGoalMutation.isPending ? "Updating..." : "Update Goal"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={percentComplete} className="h-2.5 bg-gray-800" />
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-green-400">0%</span>
            <span className="text-green-400">100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
