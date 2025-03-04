
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  GitBranch, 
  GitMerge, 
  ArrowRight, 
  Clock, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle 
} from "lucide-react";
import { ExecutionTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CriticalPathAnalyzerProps {
  tasks: ExecutionTask[];
  onCriticalPathCalculated?: (criticalPathTasks: ExecutionTask[]) => void;
}

export function CriticalPathAnalyzer({ tasks, onCriticalPathCalculated }: CriticalPathAnalyzerProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");
  const [taskGraph, setTaskGraph] = useState<Map<number, number[]>>(new Map());
  const [criticalPath, setCriticalPath] = useState<number[]>([]);
  const [calculating, setCalculating] = useState(false);
  const [earliestFinish, setEarliestFinish] = useState<Map<number, number>>(new Map());
  const { toast } = useToast();

  // Build dependency graph when tasks change
  useEffect(() => {
    buildTaskGraph();
  }, [tasks]);

  // Build graph of task dependencies
  const buildTaskGraph = () => {
    const graph = new Map<number, number[]>();
    
    // Initialize graph with empty dependencies for each task
    tasks.forEach(task => {
      graph.set(task.id, []);
    });
    
    // Add dependencies to graph
    tasks.forEach(task => {
      if (task.dependsOn) {
        const dependencies = task.dependsOn.split(',').map(id => parseInt(id.trim()));
        dependencies.forEach(depId => {
          const dependents = graph.get(depId) || [];
          if (!dependents.includes(task.id)) {
            dependents.push(task.id);
            graph.set(depId, dependents);
          }
        });
      }
    });
    
    setTaskGraph(graph);
  };

  // Calculate critical path from start task to all reachable tasks
  const calculateCriticalPath = async () => {
    if (!selectedTaskId) {
      toast({
        title: "No starting task selected",
        description: "Please select a task to calculate the critical path from.",
        variant: "destructive"
      });
      return;
    }
    
    setCalculating(true);
    
    try {
      const startTaskId = parseInt(selectedTaskId);
      const distances = new Map<number, number>();
      const previous = new Map<number, number>();
      const durations = new Map<number, number>();
      const earliestFinish = new Map<number, number>();
      
      // Initialize maps
      tasks.forEach(task => {
        distances.set(task.id, 0);
        durations.set(task.id, task.duration || 1);
      });
      
      // Topological sort (simplified for our directed acyclic graph)
      const visited = new Set<number>();
      const topoSort: number[] = [];
      
      const dfs = (nodeId: number) => {
        if (visited.has(nodeId)) return;
        visited.add(nodeId);
        
        const neighbors = taskGraph.get(nodeId) || [];
        for (const neighbor of neighbors) {
          dfs(neighbor);
        }
        
        topoSort.unshift(nodeId);
      };
      
      dfs(startTaskId);
      
      // Initialize start node
      distances.set(startTaskId, durations.get(startTaskId) || 1);
      earliestFinish.set(startTaskId, durations.get(startTaskId) || 1);
      
      // Process nodes in topological order
      for (const node of topoSort) {
        const neighbors = taskGraph.get(node) || [];
        const currentDist = distances.get(node) || 0;
        
        for (const neighbor of neighbors) {
          const neighborDuration = durations.get(neighbor) || 1;
          const newDist = currentDist + neighborDuration;
          
          if (newDist > (distances.get(neighbor) || 0)) {
            distances.set(neighbor, newDist);
            previous.set(neighbor, node);
            earliestFinish.set(neighbor, newDist);
          }
        }
      }
      
      // Find the node with the maximum distance (critical path end)
      let maxDist = 0;
      let endNode = startTaskId;
      
      tasks.forEach(task => {
        const dist = distances.get(task.id) || 0;
        if (dist > maxDist) {
          maxDist = dist;
          endNode = task.id;
        }
      });
      
      // Reconstruct the critical path
      const path: number[] = [];
      let current = endNode;
      
      while (current !== undefined) {
        path.unshift(current);
        current = previous.get(current) as number;
      }
      
      setCriticalPath(path);
      setEarliestFinish(earliestFinish);
      
      // Update tasks with critical path information
      await updateCriticalPathTasks(path);
      
      if (onCriticalPathCalculated) {
        const criticalPathTasks = tasks.filter(task => path.includes(task.id));
        onCriticalPathCalculated(criticalPathTasks);
      }
      
      toast({
        title: "Critical path calculated",
        description: `Found ${path.length} tasks in the critical path.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error calculating critical path:", error);
      toast({
        title: "Error calculating critical path",
        description: String(error),
        variant: "destructive"
      });
    } finally {
      setCalculating(false);
    }
  };
  
  // Update tasks to mark those on critical path
  const updateCriticalPathTasks = async (criticalPathIds: number[]) => {
    try {
      // First, clear all critical path flags
      await Promise.all(tasks.map(task => {
        return apiRequest(`/api/tasks/${task.id}`, {
          method: "PATCH",
          body: JSON.stringify({ isCriticalPath: false })
        });
      }));
      
      // Then, set critical path flags for tasks on the path
      await Promise.all(criticalPathIds.map(taskId => {
        return apiRequest(`/api/tasks/${taskId}`, {
          method: "PATCH",
          body: JSON.stringify({ isCriticalPath: true })
        });
      }));
    } catch (error) {
      console.error("Error updating critical path tasks:", error);
    }
  };
  
  // Get a task by ID
  const getTask = (id: number) => {
    return tasks.find(task => task.id === id);
  };
  
  // Get estimated completion time
  const getCompletionTime = () => {
    let maxTime = 0;
    criticalPath.forEach(taskId => {
      maxTime = Math.max(maxTime, earliestFinish.get(taskId) || 0);
    });
    return maxTime;
  };
  
  return (
    <Card className="bg-gray-900 border border-purple-600 glow-card">
      <CardHeader className="pb-2 px-6 pt-6">
        <CardTitle className="text-lg font-semibold text-purple-400 text-glow flex items-center">
          <GitMerge className="h-5 w-5 mr-2" />
          Critical Path Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col space-y-2">
            <label className="text-sm text-gray-400">Select starting task:</label>
            <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {tasks.map((task) => (
                  <SelectItem key={task.id} value={String(task.id)}>
                    {task.task}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-900/50"
              onClick={calculateCriticalPath}
              disabled={calculating || !selectedTaskId}
            >
              {calculating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <GitBranch className="h-4 w-4 mr-2" />
                  Calculate Critical Path
                </>
              )}
            </Button>
          </div>
          
          {criticalPath.length > 0 && (
            <>
              <Separator className="bg-gray-700 my-2" />
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-purple-400">Critical Path</h3>
                  <Badge variant="outline" className="border-purple-500 text-purple-300">
                    <Clock className="h-3 w-3 mr-1" />
                    Estimated: {getCompletionTime()} days
                  </Badge>
                </div>
                
                <div className="p-3 bg-gray-800 rounded-md">
                  <div className="flex flex-col space-y-2">
                    {criticalPath.map((taskId, index) => {
                      const task = getTask(taskId);
                      return task ? (
                        <div key={taskId} className="flex items-center">
                          <Badge className={task.status === "done" ? "bg-green-600" : "bg-blue-600"}>
                            {task.status === "done" ? (
                              <CheckCircle className="h-3 w-3 mr-1" />
                            ) : (
                              <Clock className="h-3 w-3 mr-1" />
                            )}
                            {task.duration || 1} days
                          </Badge>
                          <span className="mx-2 text-gray-400">{task.task}</span>
                          {index < criticalPath.length - 1 && (
                            <ArrowRight className="h-4 w-4 text-gray-500" />
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
                
                <div className="flex items-center text-xs text-yellow-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  <span>Any delay in these tasks will affect your overall timeline</span>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
