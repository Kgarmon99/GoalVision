
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/api";
import { InsertExecutionTask, Goal } from "@shared/schema";
import { 
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage 
} from "@/components/ui/form";
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { 
  Popover, PopoverContent, PopoverTrigger 
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { 
  Rocket, CalendarIcon, Plus, Check, ArrowLeft, StopCircle, Clock, 
  Hourglass, GitMerge
} from "lucide-react";

// We extend the ExecutionTask schema to make some fields optional for the form
const taskFormSchema = z.object({
  task: z.string().min(3, "Task description is required"),
  owner: z.string().min(2, "Owner name is required"),
  ownerAvatar: z.string().optional(),
  goalCategory: z.string().min(1, "Goal category is required"),
  categoryColor: z.string().optional(),
  dueDate: z.date(),
  status: z.string().default("in-progress"),
  weekId: z.number(),
  dependsOn: z.string().optional(),
  duration: z.number().min(1, "Duration must be at least 1 day"),
  isCriticalPath: z.boolean().default(false)
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

export default function AddTask() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const queryClient = useQueryClient();
  
  // Fetch goals for category selection
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Fetch tasks for dependencies selection
  const { data: tasks = [] } = useQuery<any[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Fetch weeks for week selection
  const { data: weeks = [] } = useQuery<any[]>({
    queryKey: ['/api/weeks'],
  });
  
  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (values: TaskFormValues) => {
      // Format the date as a string
      const formattedValues = {
        ...values,
        dueDate: format(values.dueDate, "MM/dd/yyyy"),
        dependsOn: values.dependsOn || "",
      };
      
      return apiRequest("POST", "/api/tasks", formattedValues);
    },
    onSuccess: () => {
      // Invalidate tasks cache
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      setIsSuccess(true);
      
      toast({
        title: "Task added successfully",
        description: "Your new execution task has been added to the tracker.",
        variant: "default",
      });
      
      // Navigate back to dashboard after some time
      setTimeout(() => {
        navigate("/");
      }, 1500);
    },
    onError: (error) => {
      toast({
        title: "Error adding task",
        description: error.message || "There was a problem adding the task.",
        variant: "destructive",
      });
    }
  });
  
  // Define form
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      task: "",
      owner: "",
      ownerAvatar: "",
      goalCategory: "",
      categoryColor: "blue",
      status: "in-progress",
      weekId: weeks[0]?.id || 1,
      dependsOn: "",
      duration: 1,
      isCriticalPath: false
    }
  });
  
  // Watch changes to goalCategory to update color
  const selectedCategory = form.watch("goalCategory");
  const selectedGoal = goals.find(g => g.name === selectedCategory);
  
  // Update color when category changes
  useEffect(() => {
    if (selectedGoal) {
      form.setValue("categoryColor", selectedGoal.color);
    }
  }, [selectedCategory, form, selectedGoal]);
  
  // Handle form submission
  const onSubmit = async (values: TaskFormValues) => {
    setIsSubmitting(true);
    
    try {
      await addTaskMutation.mutateAsync(values);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container py-6 px-4 mx-auto max-w-4xl">
        <div className="flex items-center mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mr-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-green-400">Add Execution Task</h1>
        </div>
        
        {isSuccess ? (
          <Card className="bg-gray-900 border border-green-600">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-600 mx-auto flex items-center justify-center mb-4">
                <Check className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Task Added Successfully!</h2>
              <p className="text-gray-400 mb-6">Your task has been added to the execution tracker.</p>
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
              <CardTitle className="flex items-center">
                <Rocket className="h-5 w-5 mr-2 text-green-400" />
                Create New Execution Task
              </CardTitle>
              <CardDescription className="text-gray-400">
                Add a new task to track execution of your 2025 goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="task"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Task Description</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="What needs to be done?" 
                              className="bg-gray-800 border-gray-700"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="owner"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Task Owner</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Who is responsible?" 
                              className="bg-gray-800 border-gray-700"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="goalCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Goal Category</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select a goal category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {goals.map(goal => (
                                <SelectItem key={goal.id} value={goal.name}>
                                  {goal.name}
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
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-white">Due Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "bg-gray-800 border-gray-700 text-left font-normal",
                                    !field.value && "text-gray-500"
                                  )}
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
                            <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select task status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="not-started">
                                <div className="flex items-center">
                                  <StopCircle className="h-3.5 w-3.5 mr-2 text-gray-400" />
                                  Not Started
                                </div>
                              </SelectItem>
                              <SelectItem value="in-progress">
                                <div className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-2 text-blue-400" />
                                  In Progress
                                </div>
                              </SelectItem>
                              <SelectItem value="done">
                                <div className="flex items-center">
                                  <Check className="h-3.5 w-3.5 mr-2 text-green-400" />
                                  Done
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="weekId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Week</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(parseInt(value))} 
                            defaultValue={field.value.toString()}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select a week" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              {weeks.map(week => (
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
                    
                    <FormField
                      control={form.control}
                      name="dependsOn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center">
                            <GitMerge className="h-3.5 w-3.5 mr-1 text-purple-400" />
                            Dependencies
                          </FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Task dependencies (optional)" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="">No dependencies</SelectItem>
                              {tasks.map(task => (
                                <SelectItem key={task.id} value={task.id.toString()}>
                                  {task.task}
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
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white flex items-center">
                            <Hourglass className="h-3.5 w-3.5 mr-1 text-yellow-400" />
                            Duration (days)
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              min="1"
                              placeholder="1"
                              className="bg-gray-800 border-gray-700"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="isCriticalPath"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-700 p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-white flex items-center">
                            <GitMerge className="h-3.5 w-3.5 mr-1 text-purple-400" />
                            Mark as critical path task
                          </FormLabel>
                          <p className="text-sm text-gray-400">
                            This task is crucial for the timeline of the project
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-4">
                    <Link href="/">
                      <Button type="button" variant="outline" className="border-gray-700">
                        Cancel
                      </Button>
                    </Link>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Hourglass className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Task
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
