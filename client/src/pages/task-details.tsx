import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
import { ExecutionTask, Week } from "@shared/schema";
import { CalendarIcon, UserIcon, TargetIcon, CalendarDaysIcon, CheckIcon, AlertCircleIcon, ClockIcon, ArrowLeftIcon, Edit2Icon, Trash2Icon } from "lucide-react";

const TaskDetails = () => {
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
  
  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/tasks/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      // Invalidate tasks cache to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/week'] });
      
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
    if (!task) return;
    
    setIsDeleting(true);
    try {
      await deleteTaskMutation.mutateAsync(task.id);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckIcon className="h-3 w-3 mr-1" />
            Done
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            <ClockIcon className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case "missed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            <AlertCircleIcon className="h-3 w-3 mr-1" />
            Missed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Function to get category badge styling
  const getCategoryBadge = (category: string, color: string) => {
    const colorMap: Record<string, string> = {
      "blue": "bg-blue-100 text-blue-800",
      "indigo": "bg-indigo-100 text-indigo-800",
      "purple": "bg-purple-100 text-purple-800",
      "green": "bg-green-100 text-green-800",
      "red": "bg-red-100 text-red-800",
      "yellow": "bg-yellow-100 text-yellow-800"
    };
    
    const badgeColor = colorMap[color] || "bg-gray-100 text-gray-800";
    
    return (
      <Badge variant="outline" className={badgeColor}>
        <TargetIcon className="h-3 w-3 mr-1" />
        {category}
      </Badge>
    );
  };
  
  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 py-8">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12">
                  <AlertCircleIcon className="h-12 w-12 text-red-500 mb-4" />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Task</h2>
                  <p className="text-gray-600 mb-4">
                    {error instanceof Error ? error.message : "There was a problem loading the task details."}
                  </p>
                  <Button onClick={() => navigate("/")}>
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
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
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Button variant="ghost" onClick={() => navigate("/")} className="mr-2">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Task Details</h1>
            </div>
            
            <div className="flex items-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="mr-2">
                    <Edit2Icon className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                      This feature is not available in the current version.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button>Close</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2Icon className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Task</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this task? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteTask} disabled={isDeleting}>
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
      
      <Footer />
    </div>
  );
};

export default TaskDetails;
