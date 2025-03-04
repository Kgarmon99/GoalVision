import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/api";
import { ExecutionTask, Goal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Clock, GitMerge, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import CriticalPathAnalyzer from "@/components/critical-path-analyzer";

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
      default:
        return <Badge className="bg-gray-600">Not Started</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container py-6 px-4 mx-auto max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href="/">
              <Button variant="ghost" size="sm" className="mr-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-green-400">Goal Dependencies & Critical Path</h1>
          </div>
        </div>

        <Tabs defaultValue="dependencies" value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="bg-gray-900 border border-green-700">
            <TabsTrigger value="dependencies">Task Dependencies</TabsTrigger>
            <TabsTrigger value="critical-path">Critical Path Analysis</TabsTrigger>
          </TabsList>

          <div className="mt-6 mb-4">
            <Select value={selectedGoal} onValueChange={setSelectedGoal}>
              <SelectTrigger className="w-full md:w-1/3 bg-gray-900 border-green-700">
                <SelectValue placeholder="Filter by goal category" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-green-700">
                <SelectItem value="">All Categories</SelectItem>
                {goals.map(goal => (
                  <SelectItem key={goal.id} value={goal.name}>{goal.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="dependencies" className="mt-4">
            <Card className="bg-gray-900 border border-green-700">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <GitMerge className="h-5 w-5 mr-2 text-purple-400" />
                  Task Dependencies
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Manage dependencies between tasks to track what needs to be completed first
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Task dependencies content would go here */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTasks.map(task => (
                    <Card key={task.id} className="bg-gray-800 border border-gray-700">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-medium">{task.task}</CardTitle>
                        <div className="flex justify-between">
                          <Badge variant="outline" className="bg-gray-700 text-gray-300">
                            {task.goalCategory}
                          </Badge>
                          {getStatusBadge(task.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-400 mb-2">
                          <span className="font-medium">Owner:</span> {task.owner}
                        </div>
                        <div className="text-sm text-gray-400 mb-2">
                          <span className="font-medium">Due Date:</span> {task.dueDate}
                        </div>
                        <div className="text-sm text-gray-400 mb-4">
                          <span className="font-medium">Duration:</span> {task.duration} day(s)
                        </div>
                        {task.dependsOn && (
                          <div className="mt-2">
                            <div className="text-sm font-medium text-purple-400 mb-1">Dependencies:</div>
                            <div className="flex flex-wrap gap-2">
                              {task.dependsOn.split(',').map(depId => {
                                const depTask = tasks.find(t => t.id === parseInt(depId.trim()));
                                return depTask ? (
                                  <Badge key={depId} className="bg-purple-900 text-purple-200">
                                    {depTask.task}
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="critical-path" className="mt-4">
            <Card className="bg-gray-900 border border-green-700">
              <CardHeader>
                <CardTitle className="text-xl flex items-center">
                  <GitMerge className="h-5 w-5 mr-2 text-purple-400" />
                  Critical Path Analysis
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Identify the critical path of dependent tasks that determine your project timeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CriticalPathAnalyzer 
                  tasks={filteredTasks} 
                  onCriticalPathCalculated={handleCriticalPathCalculated} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}