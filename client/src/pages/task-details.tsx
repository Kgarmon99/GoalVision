import { useState } from "react";
import { useLocation, useParams, Link as WouterLink } from "wouter";
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
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { ExecutionTask, Week, Goal } from "@shared/schema";
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
  PlusCircle
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
      return apiRequest("DELETE", `/api/tasks/${id}`, undefined);
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
        description: error.message || "There was a problem deleting the task.",
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
      return apiRequest("PATCH", `/api/tasks/${id}`, {status: newStatus});
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
        description: error.message || "There was a problem updating the task status.",
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
  
  // Dummy subtasks for demonstration
  const subtasks = [
    { id: 1, title: "Research potential investors", completed: true },
    { id: 2, title: "Create investor pitch deck", completed: true },
    { id: 3, title: "Schedule meetings with top 3 prospects", completed: false },
    { id: 4, title: "Prepare financial projections", completed: false }
  ];
  
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
                <DialogContent className="bg-gray-900 border border-green-600">
                  <DialogHeader>
                    <DialogTitle className="text-white">Edit Task</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      This feature is not available in the current version.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">Close</Button>
                    </DialogClose>
                  </DialogFooter>
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
                                {task.owner.charAt(0)}
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
                        <h3 className="text-sm font-medium text-gray-400 mb-3 flex items-center">
                          <ListChecks className="mr-2 h-4 w-4 text-green-400" />
                          Subtasks
                        </h3>
                        <div className="space-y-2">
                          {subtasks.map(subtask => (
                            <div 
                              key={subtask.id} 
                              className={`flex items-start p-3 rounded-md ${
                                subtask.completed ? 'bg-green-900/20 border border-green-800/50' : 'bg-gray-800/50 border border-gray-700/50'
                              }`}
                            >
                              <div className="flex-shrink-0 mt-0.5">
                                {subtask.completed ? (
                                  <CheckSquare className="h-5 w-5 text-green-400" />
                                ) : (
                                  <Square className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className={`text-sm ${subtask.completed ? 'text-green-400' : 'text-white'}`}>
                                  {subtask.title}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
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

