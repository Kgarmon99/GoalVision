import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams, useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
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
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Loader2 } from "lucide-react";
import { 
  ExecutionTask, 
  Week, 
  Goal 
} from "@shared/schema";

// Define form schema for task editing
const taskFormSchema = z.object({
  task: z.string().min(5, { message: "Task must be at least 5 characters" }),
  owner: z.string().min(2, { message: "Owner name is required" }),
  ownerAvatar: z.union([z.string().url({ message: "Please enter a valid URL" }), z.literal("")]).optional(),
  goalCategory: z.string().min(1, { message: "Please select a goal category" }),
  categoryColor: z.string().default("blue"),
  dueDate: z.date({ required_error: "Please select a due date" }),
  status: z.enum(["done", "in-progress", "missed"], {
    required_error: "Please select a status"
  }),
  weekId: z.string({ required_error: "Please select a week" }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function EditTask() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get task ID from URL
  const taskId = parseInt(params.id);
  
  // Fetch task details
  const { 
    data: task, 
    isLoading: isLoadingTask,
    isError,
    error 
  } = useQuery<ExecutionTask>({
    queryKey: ['/api/tasks', taskId],
    enabled: !isNaN(taskId),
  });
  
  // Fetch weeks
  const { data: weeks = [], isLoading: isLoadingWeeks } = useQuery<Week[]>({
    queryKey: ['/api/weeks'],
  });
  
  // Fetch goals for categories
  const { data: goals = [], isLoading: isLoadingGoals } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest("PATCH", `/api/tasks/${taskId}`, taskData);
    },
    onSuccess: () => {
      // Invalidate tasks cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
      
      toast({
        title: "Task updated",
        description: "Task has been updated successfully.",
        variant: "default",
      });
      
      // Navigate back to task details
      navigate(`/tasks/${taskId}`);
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: error.message || "There was a problem updating the task.",
        variant: "destructive",
      });
    }
  });
  
  // Form initialization
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      task: "",
      owner: "",
      ownerAvatar: "",
      goalCategory: "",
      categoryColor: "",
      status: "in-progress" as const,
      weekId: "",
    }
  });
  
  // Update form when task data is loaded
  useEffect(() => {
    if (task) {
      // Parse the date string to a Date object
      let dueDate = new Date();
      try {
        dueDate = parse(task.dueDate, "MMMM d, yyyy", new Date());
      } catch (error) {
        console.error("Error parsing date:", error);
      }
      
      // Convert null values to appropriate defaults
      const safeOwnerAvatar = task.ownerAvatar === null ? "" : task.ownerAvatar;
      const safeCategoryColor = task.categoryColor || "blue";
      const safeWeekId = task.weekId ? task.weekId.toString() : "1"; // Default to week 1 if undefined
      
      form.reset({
        task: task.task,
        owner: task.owner,
        ownerAvatar: safeOwnerAvatar,
        goalCategory: task.goalCategory,
        categoryColor: safeCategoryColor,
        status: task.status as "done" | "in-progress" | "missed",
        weekId: safeWeekId,
        dueDate: dueDate,
      });
    }
  }, [task, form]);
  
  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    
    try {
      const formattedData = {
        ...data,
        weekId: parseInt(data.weekId),
        dueDate: format(data.dueDate, "MMMM d, yyyy")
      };
      
      await updateTaskMutation.mutateAsync(formattedData);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Generate goal categories from goals data
  const goalCategories = goals.map(goal => ({
    name: goal.name,
    color: goal.color || "blue"
  }));
  
  // Show loading state
  if (isLoadingTask || isLoadingWeeks || isLoadingGoals) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-green-500" />
            <p className="text-lg text-gray-700">Loading task data...</p>
          </div>
        </main>
      </div>
    );
  }
  
  // Show error state
  if (isError || !task) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="text-sm text-red-700">
                    {error?.message || "Failed to load task data. The task might not exist."}
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" onClick={() => navigate("/")}>
                      Back to Dashboard
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate(`/tasks/${taskId}`)} 
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-green-500 neon-text">Edit Task</h1>
              <p className="mt-1 text-sm text-gray-600">
                Update the details for this task.
              </p>
            </div>
          </div>
          
          <Card>
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-green-400 neon-text-blue">Task Details</CardTitle>
              <CardDescription>
                Make changes to the task information below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="task"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Description</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter task description" />
                          </FormControl>
                          <FormDescription>
                            Provide a clear description of the task.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="owner"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Owner</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter owner name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ownerAvatar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner Avatar URL (optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="https://example.com/avatar.jpg" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="goalCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Goal Category</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                // Find the corresponding color for this category
                                const category = goalCategories.find(cat => cat.name === value);
                                if (category) {
                                  form.setValue("categoryColor", category.color);
                                }
                                field.onChange(value);
                              }}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a goal category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {goalCategories.map((category) => (
                                  <SelectItem key={category.name} value={category.name}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="done">Completed</SelectItem>
                                <SelectItem value="missed">Missed</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Due Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={`w-full pl-3 text-left font-normal ${
                                      !field.value ? "text-muted-foreground" : ""
                                    }`}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weekId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Week</FormLabel>
                            <Select 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              value={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a week" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {weeks.map((week) => (
                                  <SelectItem key={week.id} value={week.id.toString()}>
                                    Week {week.number} ({week.dateRange})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end space-x-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(`/tasks/${taskId}`)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700 glow-effect glow-green"
                    >
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}