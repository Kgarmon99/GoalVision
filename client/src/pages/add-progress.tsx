import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Goal } from "@shared/schema";

// Form validation schema
const progressFormSchema = z.object({
  goalId: z.string({
    required_error: "Please select a goal"
  }),
  newValue: z.string()
    .min(1, { message: "Please enter a value" })
    .refine(val => !isNaN(parseFloat(val)), {
      message: "Please enter a valid number"
    })
});

type ProgressFormValues = z.infer<typeof progressFormSchema>;

const AddProgress = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch goals
  const { data: goals = [], isLoading } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, newValue }: { goalId: number, newValue: number }) => {
      return apiRequest("PATCH", `/api/goals/${goalId}`, { current: newValue });
    },
    onSuccess: () => {
      // Invalidate goals cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      
      toast({
        title: "Progress updated",
        description: "Goal progress has been updated successfully.",
        variant: "default",
      });
      
      // Navigate back to dashboard
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error updating progress",
        description: error.message || "There was a problem updating the goal progress.",
        variant: "destructive",
      });
    }
  });
  
  const form = useForm<ProgressFormValues>({
    resolver: zodResolver(progressFormSchema),
    defaultValues: {
      goalId: "",
      newValue: ""
    }
  });
  
  const onSubmit = async (data: ProgressFormValues) => {
    setIsSubmitting(true);
    
    try {
      await updateGoalMutation.mutateAsync({
        goalId: parseInt(data.goalId),
        newValue: parseFloat(data.newValue)
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Get selected goal details for showing current progress
  const selectedGoalId = form.watch("goalId");
  const selectedGoal = goals.find(goal => goal.id.toString() === selectedGoalId);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Update Goal Progress</h1>
            <p className="mt-1 text-sm text-gray-600">
              Use this form to update the current progress of a goal.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Progress Update Form</CardTitle>
              <CardDescription>
                Select a goal and enter the new progress value.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="goalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Goal</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                            disabled={isLoading}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a goal to update" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {goals.map(goal => (
                                <SelectItem key={goal.id} value={goal.id.toString()}>
                                  {goal.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Choose the goal you want to update progress for.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {selectedGoal && (
                      <div className="p-4 bg-gray-50 rounded-md">
                        <p className="text-sm font-medium text-gray-500">Current Progress</p>
                        <div className="mt-1 flex items-baseline">
                          <p className="text-lg font-semibold text-gray-900">
                            {selectedGoal.current}{selectedGoal.unit ? ` ${selectedGoal.unit}` : ''}
                          </p>
                          <p className="ml-2 text-sm text-gray-500">
                            of {selectedGoal.target}{selectedGoal.unit ? ` ${selectedGoal.unit}` : ''} target
                          </p>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-primary h-2.5 rounded-full" 
                            style={{ 
                              width: `${Math.min(100, Math.round((selectedGoal.current / selectedGoal.target) * 100))}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    <FormField
                      control={form.control}
                      name="newValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Progress Value</FormLabel>
                          <FormControl>
                            <Input 
                              {...field} 
                              type="text" 
                              placeholder={selectedGoal ? `Enter new value (current: ${selectedGoal.current})` : "Enter new value"}
                            />
                          </FormControl>
                          <FormDescription>
                            Enter the new progress value. This will replace the current value.
                            {selectedGoal?.unit && ` Unit: ${selectedGoal.unit}`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate("/")}
                      className="mr-2"
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting ? "Updating..." : "Update Progress"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddProgress;
