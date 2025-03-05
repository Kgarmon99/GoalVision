import { useState, useEffect } from "react";
import { useLocation, useParams, Link as WouterLink } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExecutionTask, Week, Goal, Subtask } from "@shared/schema";
import { 
  Calendar, 
  User, 
  Target,
  CalendarDays, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ArrowLeft, 
  Edit2, 
  Trash2,
  ArrowRight, 
  ListChecks,
  FileText,
  CheckSquare,
  Square,
  Flag,
  Link,
  PlusCircle,
  X
} from "lucide-react";

export default function TaskDetails() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Get task ID from URL
  const taskId = parseInt(params.id);
  
  // Fetch task details
  const { 
    data: task, 
    isLoading,
    isError,
    error 
  } = useQuery<ExecutionTask>({
    queryKey: ['/api/tasks', taskId],
    enabled: !isNaN(taskId),
  });
  
  // Fetch week info
  const { 
    data: week,
    isLoading: isLoadingWeek 
  } = useQuery<Week>({
    queryKey: ['/api/weeks', task?.weekId],
    enabled: !!task?.weekId,
  });
  
  // Fetch goals info to find the related goal
  const {
    data: goals = [],
    isLoading: isLoadingGoals
  } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
    enabled: !!task
  });
  
  // Find the goal this task belongs to
  const relatedGoal = task ? goals.find(goal => goal.name === task.goalCategory) : undefined;
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
      
      return true;
    },
    onSuccess: () => {
      // Invalidate tasks cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      
      toast({
        title: "Task deleted",
        description: "Task has been deleted successfully.",
        variant: "default",
      });
      
      // Navigate back to dashboard
      navigate("/");
    },
    onError: (error) => {
      toast({
        title: "Error deleting task",
        description: error instanceof Error ? error.message : "There was a problem deleting the task.",
        variant: "destructive",
      });
    }
  });
  
  const handleDeleteTask = async () => {
    if (!task || !taskId) return;
    
    setIsDeleting(true);
    try {
      await deleteTaskMutation.mutateAsync(taskId);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Toggle task status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({id, newStatus}: {id: number, newStatus: string}) => {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({status: newStatus}),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task status: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate tasks cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
      
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: error instanceof Error ? error.message : "There was a problem updating the task status.",
        variant: "destructive",
      });
    }
  });
  
  const handleToggleStatus = async () => {
    if (!task || !taskId) return;
    
    // Toggle between "done" and "in-progress"
    const newStatus = task.status === "done" ? "in-progress" : "done";
    
    try {
      await toggleStatusMutation.mutateAsync({id: taskId, newStatus});
    } catch (error) {
      console.error("Error toggling task status:", error);
    }
  };
  
  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return (
          <Badge variant="outline" className="bg-green-900 text-green-400 border-green-500 hover:bg-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Done
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-yellow-900 text-yellow-400 border-yellow-500 hover:bg-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "missed":
        return (
          <Badge variant="outline" className="bg-red-900 text-red-400 border-red-500 hover:bg-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Missed
          </Badge>
        );
      default:
        return <Badge className="bg-gray-800 text-gray-300 border-gray-600">{status}</Badge>;
    }
  };
  
  // Function to get category badge styling
  const getCategoryBadge = (category: string | null | undefined, color: string | null | undefined = "") => {
    if (!category) return null;
    
    const colorMap: Record<string, string> = {
      "blue": "bg-blue-900 text-blue-400 border-blue-500",
      "indigo": "bg-indigo-900 text-indigo-400 border-indigo-500",
      "purple": "bg-purple-900 text-purple-400 border-purple-500",
      "green": "bg-green-900 text-green-400 border-green-500",
      "red": "bg-red-900 text-red-400 border-red-500",
      "yellow": "bg-yellow-900 text-yellow-400 border-yellow-500"
    };
    
    const badgeColor = color && colorMap[color] ? colorMap[color] : "bg-gray-800 text-gray-300 border-gray-600";
    
    return (
      <Badge variant="outline" className={badgeColor}>
        <Target className="h-3 w-3 mr-1" />
        {category}
      </Badge>
    );
  };
  
  // Form schemas for editing tasks and subtasks
  const editTaskFormSchema = z.object({
    task: z.string().min(3, "Task description must be at least 3 characters"),
    owner: z.string().min(1, "Owner is required"),
    ownerAvatar: z.string().optional(),
    goalCategory: z.string().min(1, "Goal category is required"),
    categoryColor: z.string().optional(),
    dueDate: z.string().min(1, "Due date is required"),
    status: z.string().min(1, "Status is required"),
    weekId: z.number().int().positive()
  });

  const addSubtaskFormSchema = z.object({
    description: z.string().min(3, "Description must be at least 3 characters"),
    priority: z.string().default("medium")
  });

  // Fetch actual subtasks from API
  const {
    data: subtasks = [],
    isLoading: isLoadingSubtasks,
    refetch: refetchSubtasks
  } = useQuery<Subtask[]>({
    queryKey: ['/api/tasks', taskId, 'subtasks'],
    queryFn: async () => {
      if (!taskId) return [];
      try {
        const response = await fetch(`/api/tasks/${taskId}/subtasks`);
        if (!response.ok) {
          throw new Error(`Failed to fetch subtasks: ${response.statusText}`);
        }
        return response.json();
      } catch (error) {
        console.error("Error fetching subtasks:", error);
        return [];
      }
    },
    enabled: !!taskId
  });
  
  // Add subtask mutation
  const addSubtaskMutation = useMutation({
    mutationFn: async (subtaskData: { parentTaskId: number, description: string, priority: string }) => {
      const response = await fetch("/api/subtasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subtaskData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add subtask: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refetch subtasks to update the list
      refetchSubtasks();
      
      toast({
        title: "Subtask added",
        description: "Subtask has been added successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error adding subtask",
        description: error.message || "There was a problem adding the subtask.",
        variant: "destructive",
      });
    }
  });
  
  // Toggle subtask completion mutation
  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number, completed: boolean }) => {
      const response = await fetch(`/api/subtasks/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ completed }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update subtask: ${response.statusText}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Refetch subtasks to update the list
      refetchSubtasks();
    },
    onError: (error) => {
      toast({
        title: "Error updating subtask",
        description: error.message || "There was a problem updating the subtask.",
        variant: "destructive",
      });
    }
  });
  
  // Delete subtask mutation
  const deleteSubtaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/subtasks/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete subtask: ${response.statusText}`);
      }
      
      return true;
    },
    onSuccess: () => {
      // Refetch subtasks to update the list
      refetchSubtasks();
      
      toast({
        title: "Subtask deleted",
        description: "Subtask has been deleted successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting subtask",
        description: error.message || "There was a problem deleting the subtask.",
        variant: "destructive",
      });
    }
  });
  
  // Dummy notes for demonstration
  const notes = [
    { id: 1, text: "Include latest user growth metrics in the pitch", date: "March 2, 2025" },
    { id: 2, text: "Follow up with Sarah about potential introductions", date: "March 4, 2025" }
  ];
  
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white relative">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.15),rgba(0,0,0,0)_50%)]"></div>
        <Header />
        
        <main className="flex-1 py-8 relative z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-gray-900 border border-green-600">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">Error Loading Task</h2>
                  <p className="text-gray-400 mb-4">
                    {error instanceof Error ? error.message : "There was a problem loading the task details."}
                  </p>
                  <Button onClick={() => navigate("/")} className="bg-green-600 hover:bg-green-700 text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
  
  // Edit Task Form Component
  interface EditTaskFormProps {
    task: ExecutionTask;
    goals: Goal[];
    weeks: Week[];
    onSuccess: () => void;
  }

  function EditTaskForm({ task, goals, weeks, onSuccess }: EditTaskFormProps) {
    const { toast } = useToast();
    
    // Edit task mutation
    const editTaskMutation = useMutation({
      mutationFn: async (data: z.infer<typeof editTaskFormSchema>) => {
        const response = await fetch(`/api/tasks/${task.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update task: ${response.statusText}`);
        }
        
        return response.json();
      },
      onSuccess: () => {
        toast({
          title: "Task updated",
          description: "Task has been updated successfully.",
          variant: "default",
        });
        onSuccess();
        // Close the dialog programmatically by simulating ESC key press
        try {
          const escEvent = new KeyboardEvent('keydown', {
            key: 'Escape',
            code: 'Escape',
            keyCode: 27,
            which: 27,
            bubbles: true,
            cancelable: true
          });
          document.dispatchEvent(escEvent);
        } catch (err) {
          console.error("Failed to close dialog:", err);
        }
      },
      onError: (error) => {
        toast({
          title: "Error updating task",
          description: error.message || "There was a problem updating the task.",
          variant: "destructive",
        });
      }
    });

    const form = useForm<z.infer<typeof editTaskFormSchema>>({
      resolver: zodResolver(editTaskFormSchema),
      defaultValues: {
        task: task.task,
        owner: task.owner,
        ownerAvatar: task.ownerAvatar || "",
        goalCategory: task.goalCategory,
        categoryColor: task.categoryColor || "",
        dueDate: task.dueDate,
        status: task.status,
        weekId: task.weekId
      }
    });

    function onSubmit(data: z.infer<typeof editTaskFormSchema>) {
      editTaskMutation.mutate(data);
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="task"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Task Description</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter task description" 
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="owner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Task Owner</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter owner name" 
                      className="bg-gray-800 border-gray-700 text-white"
                    />
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
                  <FormLabel className="text-white">Owner Avatar URL</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter avatar URL (optional)" 
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select a goal category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
              name="categoryColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Category Color</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value || "blue"}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="red">Red</SelectItem>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="indigo">Indigo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Due Date</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="Enter due date (e.g., March 15, 2025)" 
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </FormControl>
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
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                      <SelectItem value="missed">Missed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="weekId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Week</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))} 
                  defaultValue={field.value ? field.value.toString() : ""}
                >
                  <FormControl>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select week" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
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
          
          <div className="flex justify-end pt-4">
            <DialogClose asChild>
              <Button variant="outline" className="mr-2 bg-gray-800 text-white border-gray-700">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={editTaskMutation.isPending}
            >
              {editTaskMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  // Add Subtask Form Component
  interface AddSubtaskFormProps {
    parentTaskId: number;
    onSuccess?: () => void;
  }

  function AddSubtaskForm({ parentTaskId, onSuccess }: AddSubtaskFormProps) {
    const form = useForm<z.infer<typeof addSubtaskFormSchema>>({
      resolver: zodResolver(addSubtaskFormSchema),
      defaultValues: {
        description: "",
        priority: "medium"
      }
    });

    function onSubmit(data: z.infer<typeof addSubtaskFormSchema>) {
      addSubtaskMutation.mutate({
        parentTaskId,
        description: data.description,
        priority: data.priority
      });
      if (onSuccess) {
        onSuccess();
      }
    }

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Description</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    placeholder="Enter subtask description" 
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">Priority</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="high">High Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="low">Low Priority</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex justify-end pt-4">
            <DialogClose asChild>
              <Button variant="outline" className="mr-2 bg-gray-800 text-white border-gray-700">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              type="submit" 
              className="bg-green-600 hover:bg-green-700 text-white"
              disabled={addSubtaskMutation.isPending}
            >
              {addSubtaskMutation.isPending ? "Adding..." : "Add Subtask"}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.15),rgba(0,0,0,0)_50%)]"></div>
      <Header />
      
      <main className="flex-1 py-8 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate("/")} className="mr-2 text-green-400 hover:bg-gray-900">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-white">Task Details</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                className="border-green-500 text-green-400 hover:bg-gray-800"
                onClick={handleToggleStatus}
              >
                {task?.status === "done" ? (
                  <>
                    <Clock className="h-4 w-4 mr-2" />
                    Mark In Progress
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-green-500 text-green-400 hover:bg-gray-800">
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border border-green-600 max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-white">Edit Task</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Update the task details below.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {task && (
                    <EditTaskForm 
                      task={task} 
                      goals={goals}
                      weeks={week ? [week] : []}
                      onSuccess={() => {
                        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
                        queryClient.invalidateQueries({ queryKey: ['/api/tasks', taskId] });
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border border-red-600">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Task</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-400">
                      Are you sure you want to delete this task? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-gray-800 text-white hover:bg-gray-700">Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleDeleteTask} 
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          {isLoading || isLoadingWeek || isLoadingGoals ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="bg-gray-900 border border-green-600">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <Skeleton className="h-8 w-3/4 bg-gray-800" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-1/3 bg-gray-800" />
                          <Skeleton className="h-8 w-2/3 bg-gray-800" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-1/3 bg-gray-800" />
                          <Skeleton className="h-8 w-2/3 bg-gray-800" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-1/3 bg-gray-800" />
                          <Skeleton className="h-8 w-2/3 bg-gray-800" />
                        </div>
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-1/3 bg-gray-800" />
                          <Skeleton className="h-8 w-2/3 bg-gray-800" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div>
                <Card className="bg-gray-900 border border-green-600">
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-1/2 bg-gray-800 mb-4" />
                    <Skeleton className="h-24 w-full bg-gray-800 mb-4" />
                    <Skeleton className="h-6 w-1/2 bg-gray-800 mb-4" />
                    <Skeleton className="h-24 w-full bg-gray-800" />
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : task ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Task Info Card */}
              <div className="lg:col-span-2">
                <Card className="bg-gray-900 border border-green-600 mb-6">
                  <CardHeader className="border-b border-green-800 bg-gray-800/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl text-white">{task.task}</CardTitle>
                        {week && (
                          <CardDescription className="text-green-400">
                            Week {week.number} ({week.dateRange})
                          </CardDescription>
                        )}
                      </div>
                      <div className="mt-1">
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Task Owner</h3>
                          <div className="flex items-center">
                            {task.ownerAvatar ? (
                              <img 
                                src={task.ownerAvatar} 
                                alt={task.owner} 
                                className="h-8 w-8 rounded-full mr-2 border border-green-500"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-green-900 flex items-center justify-center text-white mr-2 border border-green-500">
                                {task.owner && task.owner.charAt(0) || "U"}
                              </div>
                            )}
                            <span className="text-white font-medium">{task.owner}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Goal Category</h3>
                          <div className="flex items-center">
                            {relatedGoal ? (
                              <Button 
                                variant="link" 
                                asChild 
                                className="p-0 h-auto text-green-400 hover:text-green-300"
                              >
                                <WouterLink href={`/goal-tasks/${relatedGoal.id}`}>
                                  {getCategoryBadge(task.goalCategory, task.categoryColor)}
                                  <ArrowRight className="h-3.5 w-3.5 ml-2" />
                                </WouterLink>
                              </Button>
                            ) : (
                              getCategoryBadge(task.goalCategory, task.categoryColor)
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-1">Due Date</h3>
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-green-400 mr-2" />
                            <span className="text-white">{task.dueDate}</span>
                          </div>
                        </div>
                        
                        {relatedGoal && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-400 mb-1">Contributes to Goal</h3>
                            <div className="flex items-center">
                              <Target className="h-4 w-4 text-green-400 mr-2" />
                              <span className="text-white">{relatedGoal.name}: {relatedGoal.current} / {relatedGoal.target} {relatedGoal.unit}</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Task Subtasks */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-medium text-gray-400 flex items-center">
                            <ListChecks className="mr-2 h-4 w-4 text-green-400" />
                            Subtasks
                          </h3>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-8 border-green-500 text-green-400 hover:bg-gray-800">
                                <PlusCircle className="h-3.5 w-3.5 mr-1.5" />
                                Add Subtask
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border border-green-600">
                              <DialogHeader>
                                <DialogTitle className="text-white">Add Subtask</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Add a new subtask to break down this task.
                                </DialogDescription>
                              </DialogHeader>
                              <AddSubtaskForm 
                                parentTaskId={taskId} 
                                onSuccess={() => {
                                  // Close dialog after successful submission
                                  document.querySelector('[data-dialog-close]')?.click();
                                }}
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                        
                        {isLoadingSubtasks ? (
                          <div className="space-y-2">
                            <Skeleton className="h-10 w-full bg-gray-800" />
                            <Skeleton className="h-10 w-full bg-gray-800" />
                            <Skeleton className="h-10 w-full bg-gray-800" />
                          </div>
                        ) : subtasks.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-6 bg-gray-800/30 rounded-md border border-gray-700/50">
                            <ListChecks className="h-8 w-8 text-gray-500 mb-2" />
                            <p className="text-sm text-gray-400 mb-1">No subtasks yet</p>
                            <p className="text-xs text-gray-500 mb-3 px-6 text-center">Break down this task into smaller steps for better tracking.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {subtasks.map(subtask => (
                              <div 
                                key={subtask.id} 
                                className={`flex items-start justify-between p-3 rounded-md ${
                                  subtask.completed ? 'bg-green-900/20 border border-green-800/50' : 'bg-gray-800/50 border border-gray-700/50'
                                }`}
                              >
                                <div className="flex items-start">
                                  <button 
                                    className="flex-shrink-0 mt-0.5 focus:outline-none" 
                                    onClick={() => toggleSubtaskMutation.mutate({ 
                                      id: subtask.id, 
                                      completed: !subtask.completed 
                                    })}
                                    disabled={toggleSubtaskMutation.isPending}
                                  >
                                    {subtask.completed ? (
                                      <CheckSquare className="h-5 w-5 text-green-400" />
                                    ) : (
                                      <Square className="h-5 w-5 text-gray-400 hover:text-gray-300" />
                                    )}
                                  </button>
                                  <div className="ml-3">
                                    <p className={`text-sm ${subtask.completed ? 'text-green-400' : 'text-white'}`}>
                                      {subtask.description}
                                    </p>
                                    <div className="flex items-center mt-1">
                                      {subtask.priority === "high" && (
                                        <Badge variant="outline" className="bg-red-900/30 text-red-400 border-red-500 text-xs">
                                          <Flag className="h-3 w-3 mr-1" />
                                          High Priority
                                        </Badge>
                                      )}
                                      {subtask.priority === "medium" && (
                                        <Badge variant="outline" className="bg-yellow-900/30 text-yellow-400 border-yellow-500 text-xs">
                                          <Flag className="h-3 w-3 mr-1" />
                                          Medium Priority
                                        </Badge>
                                      )}
                                      {subtask.priority === "low" && (
                                        <Badge variant="outline" className="bg-blue-900/30 text-blue-400 border-blue-500 text-xs">
                                          <Flag className="h-3 w-3 mr-1" />
                                          Low Priority
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-7 w-7 rounded-full hover:bg-red-900/20 hover:text-red-400"
                                  onClick={() => deleteSubtaskMutation.mutate(subtask.id)}
                                  disabled={deleteSubtaskMutation.isPending}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t border-green-800 bg-gray-800/50 pt-4 justify-start">
                    <div className="text-sm text-gray-400">
                      <span className="font-medium text-green-400">Tip:</span> Break down complex tasks into smaller subtasks to make them more manageable.
                    </div>
                  </CardFooter>
                </Card>
                
                {/* Notes and Comments */}
                <Card className="bg-gray-900 border border-green-600">
                  <CardHeader className="border-b border-green-800 bg-gray-800/50">
                    <CardTitle className="text-white flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-green-400" />
                      Notes & Comments
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Add notes and comments to track important details about this task
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {notes.map(note => (
                        <div key={note.id} className="bg-gray-800/50 rounded-md p-3 border border-gray-700">
                          <div className="text-sm text-white mb-2">{note.text}</div>
                          <div className="text-xs text-gray-400">{note.date}</div>
                        </div>
                      ))}
                      
                      <div className="mt-4 pt-4 border-t border-gray-800">
                        <Button className="w-full bg-gray-800 text-green-400 hover:bg-gray-700">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Add Note
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Sidebar Cards */}
              <div className="space-y-6">
                {/* Goal Progress Card */}
                {relatedGoal && (
                  <Card className="bg-gray-900 border border-green-600">
                    <CardHeader className="border-b border-green-800 bg-gray-800/50">
                      <CardTitle className="text-white flex items-center">
                        <Target className="mr-2 h-5 w-5 text-green-400" />
                        Goal Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-400">{relatedGoal.name}</span>
                            <span className="text-white font-medium">
                              {relatedGoal.current} / {relatedGoal.target} {relatedGoal.unit}
                            </span>
                          </div>
                          <Progress 
                            value={(relatedGoal.current / relatedGoal.target) * 100} 
                            className="h-2" 
                            indicatorClassName="bg-green-500"
                          />
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full mt-2 border-green-500 text-green-400 hover:bg-gray-800"
                          asChild
                        >
                          <WouterLink href={`/goal-tasks/${relatedGoal.id}`}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            View All Goal Tasks
                          </WouterLink>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Related Tasks */}
                <Card className="bg-gray-900 border border-green-600">
                  <CardHeader className="border-b border-green-800 bg-gray-800/50">
                    <CardTitle className="text-white flex items-center">
                      <Link className="mr-2 h-5 w-5 text-green-400" />
                      Related Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="bg-gray-800/50 rounded-md p-3 border border-gray-700 hover:bg-gray-800 transition-colors">
                        <div className="text-sm text-white mb-1">Review financial projections</div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="bg-yellow-900 text-yellow-400 border-yellow-500">
                            <Clock className="h-3 w-3 mr-1" />
                            In Progress
                          </Badge>
                          <span className="text-xs text-gray-400">Due: March 15, 2025</span>
                        </div>
                      </div>
                      
                      <div className="bg-gray-800/50 rounded-md p-3 border border-gray-700 hover:bg-gray-800 transition-colors">
                        <div className="text-sm text-white mb-1">Schedule investor meetings</div>
                        <div className="flex justify-between items-center">
                          <Badge variant="outline" className="bg-green-900 text-green-400 border-green-500">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Done
                          </Badge>
                          <span className="text-xs text-gray-400">Due: March 1, 2025</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full mt-2 border-green-500 text-green-400 hover:bg-gray-800"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Link Task
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Task Timeline */}
                <Card className="bg-gray-900 border border-green-600">
                  <CardHeader className="border-b border-green-800 bg-gray-800/50">
                    <CardTitle className="text-white flex items-center">
                      <Flag className="mr-2 h-5 w-5 text-green-400" />
                      Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="relative pl-6 pb-6 border-l border-green-800">
                        <div className="absolute -left-1.5 top-0">
                          <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">March 1, 2025</div>
                        <div className="text-sm text-white">Task created</div>
                      </div>
                      
                      <div className="relative pl-6 pb-6 border-l border-green-800">
                        <div className="absolute -left-1.5 top-0">
                          <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">March 2, 2025</div>
                        <div className="text-sm text-white">Status changed to In Progress</div>
                      </div>
                      
                      <div className="relative pl-6">
                        <div className="absolute -left-1.5 top-0">
                          <div className="h-3 w-3 bg-blue-500 rounded-full"></div>
                        </div>
                        <div className="text-xs text-gray-400 mb-1">March 15, 2025</div>
                        <div className="text-sm text-white">Due date</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

