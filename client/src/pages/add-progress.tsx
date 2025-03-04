import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
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
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, CheckCircle } from "lucide-react";
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

// Helper functions
const formatValue = (value: number, unit: string | null) => {
  if (unit === "M") {
    return `$${value}M`;
  } else if (unit === "K") {
    return `$${value}K`;
  } else {
    return value.toLocaleString();
  }
};

const AddProgress = () => {
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  
  // Parse query parameters for pre-selected goal
  const params = new URLSearchParams(window.location.search);
  const preselectedGoalId = params.get('goalId');
  
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
      
      setUpdateSuccess(true);
      
      toast({
        title: "Progress updated",
        description: "Goal progress has been updated successfully.",
        variant: "default",
      });
      
      // We'll navigate after showing success state
      setTimeout(() => {
        navigate("/");
      }, 2000);
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
  
  // Pre-select goal if goalId is provided in URL
  useEffect(() => {
    if (!isInitialized && !isLoading && goals.length > 0 && preselectedGoalId) {
      const goalExists = goals.some(goal => goal.id.toString() === preselectedGoalId);
      
      if (goalExists) {
        form.setValue('goalId', preselectedGoalId);
        const selectedGoal = goals.find(goal => goal.id.toString() === preselectedGoalId);
        if (selectedGoal) {
          // Pre-fill with current value for easy incremental updates
          form.setValue('newValue', selectedGoal.current.toString());
        }
      }
      
      setIsInitialized(true);
    }
  }, [isLoading, goals, preselectedGoalId, form, isInitialized]);
  
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
  
  // Calculate progress percentage if a goal is selected
  const progressPercentage = selectedGoal 
    ? Math.min(100, Math.round((selectedGoal.current / selectedGoal.target) * 100))
    : 0;
  
  // Check if new value is higher than current value (for UI indication)
  const newValue = parseFloat(form.watch("newValue") || "0");
  const isIncreased = selectedGoal && !isNaN(newValue) && newValue > selectedGoal.current;
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center">
            <Link href="/">
              <Button variant="outline" size="sm" className="mr-4 border-green-600 text-green-400">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-white">Update Goal Progress</h1>
              <p className="mt-1 text-sm text-green-400">
                Track your journey towards achieving your 2025 goals
              </p>
            </div>
          </div>
          
          {updateSuccess ? (
            <Card className="bg-gray-900 border border-green-600">
              <CardContent className="pt-6 flex flex-col items-center text-center p-8">
                <CheckCircle className="h-16 w-16 text-green-400 mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Progress Updated Successfully!</h2>
                <p className="text-gray-400 mb-6">Your goal progress has been updated and is now reflected in your dashboard.</p>
                <Link href="/">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Return to Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-gray-900 border border-green-600">
              <CardHeader>
                <CardTitle className="text-white">Progress Update Form</CardTitle>
                <CardDescription className="text-gray-400">
                  Update your progress towards reaching your 2025 goals
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
                            <FormLabel className="text-white">Select Goal</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Reset the new value field when changing goals
                                const goal = goals.find(g => g.id.toString() === value);
                                if (goal) {
                                  form.setValue('newValue', goal.current.toString());
                                }
                              }}
                              value={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                  <SelectValue placeholder="Select a goal to update" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                                {goals.map(goal => (
                                  <SelectItem key={goal.id} value={goal.id.toString()}>
                                    {goal.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription className="text-gray-400">
                              Choose the goal you want to update progress for
                            </FormDescription>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                      
                      {selectedGoal && (
                        <div className="p-4 bg-gray-800 rounded-md border border-gray-700">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <p className="text-sm font-medium text-green-400">Current Progress</p>
                              <div className="mt-1 flex items-baseline">
                                <p className="text-lg font-semibold text-white">
                                  {formatValue(selectedGoal.current, selectedGoal.unit)}
                                </p>
                                <p className="ml-2 text-sm text-gray-400">
                                  of {formatValue(selectedGoal.target, selectedGoal.unit)} target
                                </p>
                              </div>
                            </div>
                            <div className="bg-gray-900 px-3 py-1 rounded-full text-sm font-medium text-green-400 border border-green-600">
                              {progressPercentage}% complete
                            </div>
                          </div>
                          <Progress 
                            value={progressPercentage} 
                            className="h-2.5 bg-gray-900" 
                          />
                        </div>
                      )}
                      
                      <FormField
                        control={form.control}
                        name="newValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">New Progress Value</FormLabel>
                            <div className="relative">
                              <FormControl>
                                <Input 
                                  {...field} 
                                  type="text" 
                                  placeholder={selectedGoal ? `Enter new value (current: ${selectedGoal.current})` : "Enter new value"}
                                  className="bg-gray-800 border-gray-700 text-white pr-10"
                                />
                              </FormControl>
                              {isIncreased && (
                                <TrendingUp className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                              )}
                            </div>
                            <FormDescription className="text-gray-400">
                              {selectedGoal 
                                ? `Update the progress value${selectedGoal.unit ? ` (Unit: ${selectedGoal.unit})` : ''}`
                                : "Enter the new progress value"
                              }
                            </FormDescription>
                            <FormMessage className="text-red-400" />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="mt-8 flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/")}
                        className="border-green-600 text-green-400 hover:bg-gray-800"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={isSubmitting || isLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {isSubmitting ? "Updating..." : "Update Progress"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AddProgress;
