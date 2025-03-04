import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { ExecutionTask, Goal, Week } from "@shared/schema"; 
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Flag,
  ListChecks,
  PlusCircle,
  Target,
  Rocket,
  AlertCircle,
  ArrowRight
} from "lucide-react";

interface TaskBreakdownProps {
  goals: Goal[];
  selectedGoalId?: number;
}

type GroupedTask = {
  [key: string]: ExecutionTask[];
};

export function TaskBreakdown({ goals, selectedGoalId }: TaskBreakdownProps) {
  const [activeGoalId, setActiveGoalId] = useState<number | undefined>(selectedGoalId);
  
  // If no goal is selected and we have goals, select the first one
  useEffect(() => {
    if (!activeGoalId && goals.length > 0) {
      setActiveGoalId(goals[0].id);
    }
  }, [goals, activeGoalId]);

  // Fetch all tasks
  const { data: allTasks = [], isLoading: isLoadingTasks } = useQuery<ExecutionTask[]>({
    queryKey: ['/api/tasks'],
  });

  // Fetch all weeks for reference
  const { data: weeks = [], isLoading: isLoadingWeeks } = useQuery<Week[]>({
    queryKey: ['/api/weeks'],
  });

  // Group tasks by goal category to match with the goals
  const tasksByCategory: GroupedTask = {};
  allTasks.forEach(task => {
    if (!tasksByCategory[task.goalCategory]) {
      tasksByCategory[task.goalCategory] = [];
    }
    tasksByCategory[task.goalCategory].push(task);
  });

  // Find the currently active goal
  const activeGoal = goals.find(goal => goal.id === activeGoalId);
  
  // Filter tasks for the active goal
  const activeGoalTasks = activeGoal 
    ? tasksByCategory[activeGoal.name] || [] 
    : [];
  
  // Sort tasks by status (in-progress first, then done, then missed)
  const sortedTasks = [...activeGoalTasks].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      'in-progress': 0,
      'done': 1,
      'missed': 2
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Group tasks by week for the active goal
  const tasksByWeek: {[weekId: number]: ExecutionTask[]} = {};
  
  sortedTasks.forEach(task => {
    if (!tasksByWeek[task.weekId]) {
      tasksByWeek[task.weekId] = [];
    }
    tasksByWeek[task.weekId].push(task);
  });

  // Calculate completion stats for the active goal
  const completionStats = {
    total: sortedTasks.length,
    completed: sortedTasks.filter(t => t.status === 'done').length,
    inProgress: sortedTasks.filter(t => t.status === 'in-progress').length,
    missed: sortedTasks.filter(t => t.status === 'missed').length
  };

  const completionPercentage = completionStats.total > 0 
    ? Math.round((completionStats.completed / completionStats.total) * 100)
    : 0;

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

  if (isLoadingTasks || isLoadingWeeks) {
    return (
      <Card className="bg-gray-900/90 border border-green-600">
        <CardHeader>
          <CardTitle className="text-green-400">
            <div className="flex items-center">
              <ListChecks className="mr-2 h-5 w-5" />
              Task Breakdown
            </div>
          </CardTitle>
          <CardDescription className="text-gray-400">Loading tasks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-800 rounded w-3/4"></div>
            <div className="h-4 bg-gray-800 rounded w-1/2"></div>
            <div className="h-4 bg-gray-800 rounded w-5/6"></div>
            <div className="h-4 bg-gray-800 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/90 border border-green-600">
      <CardHeader>
        <CardTitle className="text-green-400">
          <div className="flex items-center">
            <ListChecks className="mr-2 h-5 w-5" />
            Task Breakdown
          </div>
        </CardTitle>
        <CardDescription className="text-gray-400">
          Track tasks and milestones needed to complete your goals
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue={activeGoalId?.toString() || ""} onValueChange={(value) => setActiveGoalId(Number(value))}>
          <div className="px-6 pt-2">
            <TabsList className="w-full bg-gray-800 border border-green-800 rounded-lg overflow-hidden p-1">
              {goals.map(goal => (
                <TabsTrigger 
                  key={goal.id} 
                  value={goal.id.toString()}
                  className="data-[state=active]:bg-gray-700 data-[state=active]:text-green-400"
                >
                  <Target className="h-4 w-4 mr-2" />
                  {goal.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {goals.map(goal => (
            <TabsContent key={goal.id} value={goal.id.toString()} className="pt-0 pb-0">
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {goal.name} Goal Completion
                    </h3>
                    <div className="text-right">
                      <span className="text-green-400 font-bold text-xl">{completionPercentage}%</span>
                    </div>
                  </div>
                  <Progress 
                    value={completionPercentage} 
                    className="h-2" 
                    indicatorClassName="bg-green-500"
                  />
                  
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-800/80 rounded p-2">
                      <div className="text-green-400 text-lg font-bold">
                        {completionStats.completed}
                      </div>
                      <div className="text-xs text-gray-400">Completed</div>
                    </div>
                    <div className="bg-gray-800/80 rounded p-2">
                      <div className="text-yellow-400 text-lg font-bold">
                        {completionStats.inProgress}
                      </div>
                      <div className="text-xs text-gray-400">In Progress</div>
                    </div>
                    <div className="bg-gray-800/80 rounded p-2">
                      <div className="text-red-400 text-lg font-bold">
                        {completionStats.missed}
                      </div>
                      <div className="text-xs text-gray-400">Missed</div>
                    </div>
                  </div>
                </div>
                
                {Object.keys(tasksByWeek).length > 0 ? (
                  <Accordion type="single" collapsible className="border-gray-800">
                    {Object.entries(tasksByWeek).map(([weekId, tasks]) => {
                      const week = weeks.find(w => w.id === parseInt(weekId));
                      return (
                        <AccordionItem key={weekId} value={weekId} className="border-b border-gray-700">
                          <AccordionTrigger className="text-white hover:text-green-400 hover:no-underline py-4">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-green-400" />
                              <span>Week {week?.number}: {week?.dateRange}</span>
                              <Badge className="ml-2 bg-gray-700 text-white">
                                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                              </Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-3 pt-1 pb-3">
                              {tasks.map(task => (
                                <div key={task.id} className="bg-gray-800/50 rounded-md p-3 hover:bg-gray-800 transition-colors">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="text-white font-medium">{task.task}</div>
                                    {getStatusBadge(task.status)}
                                  </div>
                                  
                                  <div className="flex items-center justify-between text-sm text-gray-400 mb-1">
                                    <div className="flex items-center">
                                      <Flag className="h-3 w-3 mr-1 text-green-400" /> 
                                      <span>Due: {task.dueDate}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="h-5 w-5 rounded-full bg-green-900 mr-1 flex items-center justify-center text-xs font-medium text-white border border-green-500">
                                        {task.owner && task.owner.charAt(0) || "U"}
                                      </div>
                                      <span>{task.owner || "Unassigned"}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end mt-2">
                                    <Button variant="link" asChild size="sm" className="text-green-400 hover:text-green-300 p-0 h-6">
                                      <Link href={`/tasks/${task.id}`}>
                                        View Details
                                        <ArrowRight className="ml-1 h-3 w-3" />
                                      </Link>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      );
                    })}
                  </Accordion>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-800/50 rounded-md">
                    <Rocket className="h-10 w-10 text-green-400 mb-3" />
                    <h3 className="text-white font-medium text-lg mb-1">No tasks yet</h3>
                    <p className="text-gray-400 mb-4">Create tasks to track your progress for this goal</p>
                    <Button asChild className="bg-green-600 hover:bg-green-700">
                      <Link href="/add-task">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add First Task
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      
      <CardFooter className="border-t border-green-800 bg-gray-800/50 p-4">
        <div className="w-full flex justify-between items-center">
          <span className="text-sm text-gray-400">
            Track and monitor all tasks needed to achieve your goals
          </span>
          <Button asChild variant="outline" size="sm" className="border-green-500 text-green-400 bg-gray-900 hover:bg-gray-800">
            <Link href="/add-task">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Link>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}