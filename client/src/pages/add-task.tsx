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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Week } from "@shared/schema";

// Form validation schema
const taskFormSchema = z.object({
  task: z.string().min(5, { message: "Task must be at least 5 characters" }),
  owner: z.string().min(2, { message: "Owner name is required" }),
  ownerAvatar: z.string().url({ message: "Please enter a valid URL" }).optional(),
  goalCategory: z.string().min(1, { message: "Please select a goal category" }),
  categoryColor: z.string().default("blue"),
  dueDate: z.date({ required_error: "Please select a due date" }),
  status: z.enum(["done", "in-progress", "missed"], {
    required_error: "Please select a status"
  }),
  weekId: z.string({ required_error: "Please select a week" }),
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const AddTask = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch weeks
  const { data: weeks = [], isLoading } = useQuery<Week[]>({
    queryKey: ['/api/weeks'],
  });
  
  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest("POST", "/api/tasks", taskData);
    },
    onSuccess: () => {
      // Invalidate tasks cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      toast({
        title: "Task created",
        description: "New task has been added successfully.",
        variant: "default",
      });
      
      // Navigate back to dashboard
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error creating task",
        description: error.message || "There was a problem creating the task.",
        variant: "destructive",
      });
    }
  });
  
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      task: "",
      owner: "",
      ownerAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      goalCategory: "",
      categoryColor: "blue",
      status: "in-progress",
      weekId: weeks.length > 0 ? weeks[0].id.toString() : "",
    }
  });
  
  const onSubmit = async (data: TaskFormValues) => {
    setIsSubmitting(true);
    
    try {
      const formattedData = {
        ...data,
        weekId: parseInt(data.weekId),
        dueDate: format(data.dueDate, "MMMM d, yyyy")
      };
      
      await createTaskMutation.mutateAsync(formattedData);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const goalCategories = [
    { name: "Funding", color: "blue" },
    { name: "Revenue", color: "purple" },
    { name: "User Growth", color: "green" },
    { name: "School Expansion", color: "indigo" }
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Add New Task</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create a new task for the weekly execution tracker.
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Create a New Task</CardTitle>
              <CardDescription>
                Enter the details below to create a new task for your goals.
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
                          <FormLabel>What needs to be done?</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Example: Complete Q2 revenue forecast" />
                          </FormControl>
                          <FormDescription>
                            Be specific about what needs to be accomplished.
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
                            <FormLabel>Who's responsible?</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Example: Jane Smith" />
                            </FormControl>
                            <FormDescription>
                              The person who will complete this task.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="ownerAvatar"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avatar URL (Optional)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter avatar URL" />
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
                            <FormLabel>Which goal does this support?</FormLabel>
                            <Select 
                              onValueChange={(value) => {
                                field.onChange(value);
                                // Update the category color based on selected category
                                const category = goalCategories.find(cat => cat.name === value);
                                if (category) {
                                  form.setValue("categoryColor", category.color);
                                }
                              }} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a goal area" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {goalCategories.map(category => (
                                  <SelectItem key={category.name} value={category.name}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              Connect this task to one of your main goals.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="What's the current status?" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="done">✅ Completed</SelectItem>
                                <SelectItem value="in-progress">🔄 Working on it</SelectItem>
                                <SelectItem value="missed">❌ Not started</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              You can update this later as work progresses.
                            </FormDescription>
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
                            <FormLabel>When should this be completed?</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !field.value && "text-muted-foreground"
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, "PPP")
                                    ) : (
                                      <span>Select deadline date</span>
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
                            <FormDescription>
                              Choose a realistic deadline for this task.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="weekId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Which week's plan does this belong to?</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose week from calendar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {weeks.map(week => (
                                  <SelectItem key={week.id} value={week.id.toString()}>
                                    Week {week.number} ({week.dateRange})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormDescription>
                              This helps organize tasks in your weekly planning.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
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
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Task"}
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

export default AddTask;
