import { useEffect, useState } from "react";
import { useParams, useLocation, Link as WouterLink } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { TaskBreakdown } from "@/components/task-breakdown";
import { EmptyState } from "@/components/empty-state";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ListChecks, 
  PlusCircle, 
  Target, 
  TrendingUp, 
  Calendar
} from "lucide-react";
import { Goal, ExecutionTask, Week } from "@shared/schema";

export default function GoalTasks() {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<"tasks" | "milestones">("tasks");

  // Get goal ID from URL
  const goalId = parseInt(params.id);

  // Fetch the specific goal
  const {
    data: goal,
    isLoading: isLoadingGoal,
    isError: isGoalError
  } = useQuery<Goal>({
    queryKey: ['/api/goals', goalId],
    enabled: !isNaN(goalId),
  });

  // Fetch all goals (needed for the task breakdown component)
  const {
    data: allGoals = [],
    isLoading: isLoadingAllGoals
  } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });

  // Fetch tasks
  const {
    data: allTasks = [],
    isLoading: isLoadingTasks
  } = useQuery<ExecutionTask[]>({
    queryKey: ['/api/tasks'],
  });

  // Fetch weeks for reference
  const {
    data: weeks = [],
    isLoading: isLoadingWeeks
  } = useQuery<Week[]>({
    queryKey: ['/api/weeks'],
  });

  // If there's an error loading the goal or if the goal isn't found
  useEffect(() => {
    if (isGoalError) {
      toast({
        title: "Error loading goal",
        description: "Could not load the requested goal details.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isGoalError, toast, navigate]);

  // Filter tasks for this specific goal
  const goalTasks = allTasks.filter(task => task.goalCategory === goal?.name);

  // Calculate task statistics
  const taskStats = {
    total: goalTasks.length,
    completed: goalTasks.filter(t => t.status === 'done').length,
    inProgress: goalTasks.filter(t => t.status === 'in-progress').length,
    missed: goalTasks.filter(t => t.status === 'missed').length,
  };

  const completionPercentage = taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0;

  const goBackToDashboard = () => {
    navigate("/");
  };

  // If we're loading
  const isLoading = isLoadingGoal || isLoadingAllGoals || isLoadingTasks || isLoadingWeeks;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white relative">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.15),rgba(0,0,0,0)_50%)]"></div>
        <Header />
        
        <main className="flex-1 py-6 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <div className="flex items-center">
                <Button variant="ghost" onClick={goBackToDashboard} className="mr-4 text-green-400">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Skeleton className="h-8 w-64" />
              </div>
            </div>
            
            <div className="mb-8">
              <Skeleton className="h-40 w-full" />
            </div>
            
            <div className="mb-8">
              <Skeleton className="h-80 w-full" />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex flex-col bg-black text-white relative">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.15),rgba(0,0,0,0)_50%)]"></div>
        <Header />
        
        <main className="flex-1 py-6 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <EmptyState
              title="Goal Not Found"
              description="The goal you're looking for doesn't exist."
              icon="warning"
              addLink="/"
              addText="Go Back to Dashboard"
            />
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
      
      <main className="flex-1 py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button variant="ghost" onClick={goBackToDashboard} className="mr-4 text-green-400 hover:bg-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-white text-glow flex items-center">
                    <Target className="h-6 w-6 mr-2 text-green-400" />
                    {goal.name} Goal Tasks
                  </h1>
                  <p className="text-gray-400 mt-1">
                    Track and manage all tasks needed to achieve this goal
                  </p>
                </div>
              </div>
              <Button asChild size="sm" className="bg-green-600 text-white hover:bg-green-700">
                <WouterLink href="/add-task">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Task
                </WouterLink>
              </Button>
            </div>
          </div>
          
          {/* Goal Summary Card */}
          <Card className="bg-gray-900/90 border border-green-600 mb-8">
            <CardHeader>
              <CardTitle className="text-green-400">
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Goal Progress Overview
                </div>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Track your progress towards achieving this goal
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-1 md:col-span-2">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full bg-green-500 mr-2`}></div>
                        <span className="font-medium text-white">Current Progress</span>
                      </div>
                      <div className="text-right text-white">
                        <span className="text-xl font-bold text-white">{goal.current}</span>
                        <span className="text-gray-400"> / {goal.target} {goal.unit}</span>
                      </div>
                    </div>
                    <Progress 
                      value={(goal.current / goal.target) * 100} 
                      className="h-2.5" 
                      indicatorClassName="bg-green-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="bg-gray-800/60 rounded-md p-3 text-center">
                      <div className="flex items-center justify-center mb-1 text-green-400">
                        <CheckCircle2 className="h-5 w-5 mr-1" />
                      </div>
                      <div className="text-xl font-bold text-white">{taskStats.completed}</div>
                      <div className="text-xs text-gray-400">Completed Tasks</div>
                    </div>
                    
                    <div className="bg-gray-800/60 rounded-md p-3 text-center">
                      <div className="flex items-center justify-center mb-1 text-yellow-400">
                        <Clock className="h-5 w-5 mr-1" />
                      </div>
                      <div className="text-xl font-bold text-white">{taskStats.inProgress}</div>
                      <div className="text-xs text-gray-400">In Progress</div>
                    </div>
                    
                    <div className="bg-gray-800/60 rounded-md p-3 text-center">
                      <div className="flex items-center justify-center mb-1 text-blue-400">
                        <Layers className="h-5 w-5 mr-1" />
                      </div>
                      <div className="text-xl font-bold text-white">{taskStats.total}</div>
                      <div className="text-xs text-gray-400">Total Tasks</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col justify-center items-center bg-gray-800/40 rounded-lg p-6 border border-green-800/50">
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {completionPercentage}%
                  </div>
                  <div className="text-gray-300 text-center font-medium">Task Completion</div>
                  <div className="w-24 h-24 relative my-4">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        className="text-gray-700 stroke-current"
                        strokeWidth="10"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                      ></circle>
                      <circle
                        className="text-green-500 stroke-current"
                        strokeWidth="10"
                        strokeLinecap="round"
                        cx="50"
                        cy="50"
                        r="40"
                        fill="transparent"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionPercentage / 100)}`}
                        transform="rotate(-90 50 50)"
                      ></circle>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Target className="h-8 w-8 text-green-500" />
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 text-center">
                    {taskStats.completed} of {taskStats.total} tasks completed
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Task Breakdown Tabs */}
          <Tabs defaultValue="tasks" className="w-full mb-8">
            <TabsList className="w-full justify-start bg-gray-900/70 border border-green-800 rounded-lg overflow-hidden p-1 mb-6">
              <TabsTrigger 
                value="tasks" 
                onClick={() => setCurrentView("tasks")}
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400"
              >
                <ListChecks className="h-4 w-4 mr-2" />
                Weekly Tasks
              </TabsTrigger>
              <TabsTrigger 
                value="milestones" 
                onClick={() => setCurrentView("milestones")}
                className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Timeline View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tasks" className="mt-0">
              <TaskBreakdown goals={[goal]} selectedGoalId={goal.id} />
            </TabsContent>
            
            <TabsContent value="milestones" className="mt-0">
              <Card className="bg-gray-900/90 border border-green-600">
                <CardHeader>
                  <CardTitle className="text-green-400">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Goal Timeline View
                    </div>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    View your goal progress in a timeline format
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center p-10 text-center bg-gray-800/50 rounded-md">
                    <Calendar className="h-16 w-16 text-green-400 mb-4" />
                    <h3 className="text-white font-medium text-lg mb-2">Timeline View Coming Soon</h3>
                    <p className="text-gray-400 max-w-md">
                      We're working on a visual timeline to better track your goal milestones.
                      Check back soon for this feature.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-green-900/20 to-gray-900/20 border border-green-800/50 rounded-lg p-6 text-center md:text-left md:flex md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-white mb-1">Need to adjust your goal?</h3>
              <p className="text-gray-400">
                You can update your goal progress or add new tasks to stay on track
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                variant="outline" 
                className="border-green-500 text-green-400 hover:bg-gray-800 hover:border-green-400 transition-colors w-full sm:w-auto"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Update Progress
              </Button>
              <Button 
                className="bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
                asChild
              >
                <WouterLink href="/add-task">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add New Task
                </WouterLink>
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}