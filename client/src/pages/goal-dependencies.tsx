
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { GitMerge, GitBranch, Check, Clock, Calendar, Plus, RotateCcw } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ExecutionTask, Goal } from "@shared/schema";
import { CriticalPathAnalyzer } from "@/components/critical-path-analyzer";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

export default function GoalDependencies() {
  const [selectedTab, setSelectedTab] = useState("dependencies");
  const [selectedGoal, setSelectedGoal] = useState<string>("");
  const [filteredTasks, setFilteredTasks] = useState<ExecutionTask[]>([]);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Fetch tasks
  const { data: tasks = [] } = useQuery<ExecutionTask[]>({
    queryKey: ["tasks"],
    queryFn: () => apiRequest("/api/tasks"),
  });
  
  // Fetch goals
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ["goals"],
    queryFn: () => apiRequest("/api/goals"),
  });
  
  // Filter tasks when selected goal changes
  useEffect(() => {
    if (selectedGoal) {
      const filtered = tasks.filter(task => task.goalCategory === selectedGoal);
      setFilteredTasks(filtered);
    } else {
      setFilteredTasks(tasks);
    }
  }, [selectedGoal, tasks]);
  
  // Handle critical path calculation
  const handleCriticalPathCalculated = (criticalPathTasks: ExecutionTask[]) => {
    toast({
      title: "Critical path identified",
      description: `${criticalPathTasks.length} tasks are on the critical path to completion.`,
    });
  };
  
  // Format task status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return <Badge className="bg-green-600"><Check className="h-3 w-3 mr-1" />Done</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-600"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "missed":
        return <Badge className="bg-red-600"><RotateCcw className="h-3 w-3 mr-1" />Missed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Add dependency relationship between tasks
  const addDependency = async (taskId: number, dependsOnId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      
      if (!task) return;
      
      // Get current dependencies and add new one
      let currentDeps = task.dependsOn ? task.dependsOn.split(',').map(id => id.trim()) : [];
      
      if (!currentDeps.includes(dependsOnId)) {
        currentDeps.push(dependsOnId);
      }
      
      // Update task with new dependencies
      await apiRequest(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: JSON.stringify({ dependsOn: currentDeps.join(',') }),
      });
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      toast({
        title: "Dependency added",
        description: "Task dependency relationship created successfully.",
      });
    } catch (error) {
      console.error("Error adding dependency:", error);
      toast({
        title: "Error adding dependency",
        description: String(error),
        variant: "destructive",
      });
    }
  };
  
  // Reset all dependencies
  const resetDependencies = async () => {
    try {
      await Promise.all(tasks.map(task => {
        return apiRequest(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify({ dependsOn: '', isCriticalPath: false }),
        });
      }));
      
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      
      toast({
        title: "Dependencies reset",
        description: "All task dependencies have been cleared.",
      });
    } catch (error) {
      console.error("Error resetting dependencies:", error);
      toast({
        title: "Error resetting dependencies",
        description: String(error),
        variant: "destructive",
      });
    }
  };
  
  // Find dependency tasks for a given task
  const getDependencyTasks = (taskId: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.dependsOn) return [];
    
    const depIds = task.dependsOn.split(',').map(id => parseInt(id.trim()));
    return tasks.filter(t => depIds.includes(t.id));
  };
  
  // Find dependent tasks (tasks that depend on this one)
  const getDependentTasks = (taskId: number) => {
    return tasks.filter(task => {
      if (!task.dependsOn) return false;
      const deps = task.dependsOn.split(',').map(id => parseInt(id.trim()));
      return deps.includes(taskId);
    });
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto py-6 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Goal Dependencies & Critical Path</h1>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={resetDependencies}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset All Dependencies
            </Button>
            <Link to="/add-task">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Task
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filter by Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                  <SelectTrigger>
                    <SelectValue placeholder="All goals" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All goals</SelectItem>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.name}>
                        {goal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>
          
          <div className="lg:col-span-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="w-full">
                <TabsTrigger value="dependencies" className="flex-1">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Manage Dependencies
                </TabsTrigger>
                <TabsTrigger value="critical-path" className="flex-1">
                  <GitMerge className="h-4 w-4 mr-2" />
                  Critical Path Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="dependencies" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Task Dependencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {filteredTasks.map((task) => (
                        <div key={task.id} className="border border-gray-700 rounded-md p-4 space-y-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-medium">{task.task}</h3>
                              <div className="flex space-x-2 mt-1">
                                <Badge variant="outline">{task.goalCategory}</Badge>
                                {getStatusBadge(task.status)}
                                <Badge variant="outline" className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {task.dueDate}
                                </Badge>
                                <Badge variant="outline" className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {task.duration || 1} days
                                </Badge>
                                {task.isCriticalPath && (
                                  <Badge className="bg-purple-600">Critical Path</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="text-sm font-medium mb-2">This task depends on:</h4>
                              <div className="flex flex-wrap gap-2">
                                {getDependencyTasks(task.id).length > 0 ? (
                                  getDependencyTasks(task.id).map((depTask) => (
                                    <Badge key={depTask.id} variant="secondary">
                                      {depTask.task}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-500">No dependencies</span>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium mb-2">Tasks that depend on this:</h4>
                              <div className="flex flex-wrap gap-2">
                                {getDependentTasks(task.id).length > 0 ? (
                                  getDependentTasks(task.id).map((depTask) => (
                                    <Badge key={depTask.id} variant="secondary">
                                      {depTask.task}
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-sm text-gray-500">No dependent tasks</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium mb-2">Add dependency:</h4>
                            <div className="flex space-x-2">
                              <Select 
                                onValueChange={(value) => addDependency(task.id, value)}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a task this depends on" />
                                </SelectTrigger>
                                <SelectContent>
                                  {tasks
                                    .filter(t => t.id !== task.id)
                                    .map((t) => (
                                      <SelectItem key={t.id} value={t.id.toString()}>
                                        {t.task}
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="critical-path" className="mt-4">
                <CriticalPathAnalyzer 
                  tasks={filteredTasks.length > 0 ? filteredTasks : tasks} 
                  onCriticalPathCalculated={handleCriticalPathCalculated}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
