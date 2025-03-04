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
  dependencies: z.array(z.string()).optional(), // Added dependencies field
});

type TaskFormValues = z.infer<typeof taskFormSchema>;

const AddTask = () => {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch weeks
  const { data: weeks = [], isLoading } = useQuery({
    queryKey: ['/api/weeks'],
  });

  // Fetch tasks for dependency selection
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (taskData: any) => {
      return apiRequest("POST", "/api/tasks", taskData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task created",
        description: "New task has been added successfully.",
        variant: "default",
      });
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
      dependencies: [], // Initialize dependencies
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
              <CardTitle>Task Details</CardTitle>
              <CardDescription>
                Fill in the information for the new task.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="space-y-6">
                    {/* ...existing form fields... */}

                    <FormField
                      control={form.control}
                      name="dependencies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dependencies</FormLabel>
                          <Select multiple onChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select dependencies" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
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

                    {/* ...rest of the form fields... */}
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
                    <Button type="submit" disabled={isSubmitting}>
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