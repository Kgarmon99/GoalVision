import React, { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ExecutionTask, Week, insertExecutionTaskSchema } from "@shared/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, Edit2Icon, UserIcon, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";

// Extend schema with validations
const editTaskSchema = insertExecutionTaskSchema.extend({
  task: z.string().min(1, "Task name is required"),
  owner: z.string().min(1, "Owner name is required"),
  goalCategory: z.string().min(1, "Goal category is required"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
});

type EditTaskFormValues = z.infer<typeof editTaskSchema>;

const TaskDetails = () => {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  
  // Fetch task details
  const { data: task, isLoading } = useQuery({
    queryKey: [`/api/tasks/${id}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0], {
        credentials: "include",
      });
      const data = await res.json();
      return data as ExecutionTask;
    },
    enabled: !!id,
  });
  
  // Fetch week information
  const { data: week } = useQuery({
    queryKey: [`/api/weeks/${task?.weekId}`],
    queryFn: async ({ queryKey }) => {
      const res = await fetch(queryKey[0], {
        credentials: "include",
      });
      const data = await res.json();
      return data as Week;
    },
    enabled: !!task?.weekId,
  });
  
  // Initialize form
  const form = useForm<EditTaskFormValues>({
    resolver: zodResolver(editTaskSchema),
    defaultValues: {
      task: task?.task || "",
      owner: task?.owner || "",
      ownerAvatar: task?.ownerAvatar || null,
      goalCategory: task?.goalCategory || "",
      categoryColor: task?.categoryColor || null,
      dueDate: task?.dueDate || "",
      status: task?.status || "Not Started",
      weekId: task?.weekId || 0,
    },
  });
  
  // Update form values when task data is loaded
  useEffect(() => {
    if (task) {
      form.reset({
        task: task.task,
        owner: task.owner,
        ownerAvatar: task.ownerAvatar,
        goalCategory: task.goalCategory,
        categoryColor: task.categoryColor,
        dueDate: task.dueDate,
        status: task.status,
        weekId: task.weekId,
      });
      
      try {
        // Try to parse the due date from the task
        const dateParts = task.dueDate.split('/');
        if (dateParts.length === 3) {
          const month = parseInt(dateParts[0], 10) - 1; // JS months are 0-indexed
          const day = parseInt(dateParts[1], 10);
          const year = parseInt(dateParts[2], 10);
          setSelectedDate(new Date(year, month, day));
        }
      } catch (e) {
        // If parsing fails, just don't set a date
        console.error("Failed to parse date:", e);
      }
    }
  }, [task, form]);
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (data: EditTaskFormValues) => {
      return apiRequest(`/api/tasks/${id}`, "PATCH", data);
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/week'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
        variant: "default",
      });
      
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: error instanceof Error ? error.message : "There was a problem updating the task.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = async (data: EditTaskFormValues) => {
    await updateTaskMutation.mutateAsync(data);
  };
  
  // Helper function to render status badge
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; bgColor: string }> = {
      "Completed": { color: "text-green-700", bgColor: "bg-green-100" },
      "In Progress": { color: "text-blue-700", bgColor: "bg-blue-100" },
      "Not Started": { color: "text-gray-700", bgColor: "bg-gray-100" },
      "Blocked": { color: "text-red-700", bgColor: "bg-red-100" },
      "Deferred": { color: "text-yellow-700", bgColor: "bg-yellow-100" },
    };
    
    const { color, bgColor } = statusMap[status] || statusMap["Not Started"];
    
    return (
      <Badge className={`${bgColor} ${color} rounded-full px-3 py-1 font-medium text-xs`}>
        {status}
      </Badge>
    );
  };
  
  // Helper function to render category badge
  const getCategoryBadge = (category: string, color: string | null) => {
    return (
      <Badge className="rounded-full px-3 py-1 font-medium text-xs" style={{ backgroundColor: color || "#4CAF50", color: "#fff" }}>
        {category}
      </Badge>
    );
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLocation("/")}
                className="mr-4"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
            </div>
            
            <div className="flex items-center">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit2Icon className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <Skeleton className="h-8 w-3/4" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-8 w-2/3" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-8 w-2/3" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-8 w-2/3" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-8 w-2/3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : task ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{task.task}</CardTitle>
                {week && (
                  <CardDescription>
                    Week {week.number} ({week.dateRange})
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Task Owner</h3>
                      <div className="flex items-center">
                        {task.ownerAvatar ? (
                          <img 
                            src={task.ownerAvatar} 
                            alt={task.owner} 
                            className="h-8 w-8 rounded-full mr-2"
                          />
                        ) : (
                          <UserIcon className="h-8 w-8 rounded-full p-1 bg-gray-100 text-gray-600 mr-2" />
                        )}
                        <span className="text-gray-900 font-medium">{task.owner}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Status</h3>
                      <div className="flex items-center">
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Goal Category</h3>
                      <div className="flex items-center">
                        {getCategoryBadge(task.goalCategory, task.categoryColor)}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Due Date</h3>
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{task.dueDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-6 justify-start">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Note:</span> This is a sample task for the 2025 Goals Tracking System.
                </div>
              </CardFooter>
            </Card>
          ) : null}
        </div>
      </main>
      
      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px] bg-gray-900 border border-green-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Task</DialogTitle>
            <DialogDescription className="text-gray-400">
              Make changes to the task details below.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="task"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-green-400">Task Name</FormLabel>
                    <FormControl>
                      <Input {...field} className="bg-gray-800 border-green-600 text-white" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-green-400">Owner</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800 border-green-600 text-white" />
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
                      <FormLabel className="text-green-400">Goal Category</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-gray-800 border-green-600 text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className="text-green-400">Due Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="pl-3 text-left font-normal bg-gray-800 border-green-600 text-white"
                            >
                              {field.value ? (
                                field.value
                              ) : (
                                <span className="text-gray-500">
                                  Select a date
                                </span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-gray-900 border border-green-600" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => {
                              setSelectedDate(date);
                              if (date) {
                                const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
                                field.onChange(formattedDate);
                              }
                            }}
                            initialFocus
                            className="bg-gray-900 text-white"
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
                      <FormLabel className="text-green-400">Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-gray-800 border-green-600 text-white">
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-gray-900 border-green-600 text-white">
                          <SelectItem value="Not Started">Not Started</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                          <SelectItem value="Blocked">Blocked</SelectItem>
                          <SelectItem value="Deferred">Deferred</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateTaskMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <Footer />
    </div>
  );
};

export default TaskDetails;