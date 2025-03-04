
import { useState, useEffect } from "react";
import { ExecutionTask } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, GitMerge, Calendar, Clock } from "lucide-react";

interface CriticalPathAnalyzerProps {
  tasks: ExecutionTask[];
  onCriticalPathCalculated: (criticalPathTasks: ExecutionTask[]) => void;
}

// Helper classes for the critical path algorithm
class TaskNode {
  id: number;
  task: string;
  duration: number;
  dependsOn: number[];
  earliestStart: number;
  earliestFinish: number;
  latestStart: number;
  latestFinish: number;
  slack: number;
  isCritical: boolean;
  
  constructor(task: ExecutionTask) {
    this.id = task.id;
    this.task = task.task;
    this.duration = task.duration;
    this.dependsOn = task.dependsOn ? task.dependsOn.split(',').map(id => parseInt(id.trim())) : [];
    this.earliestStart = 0;
    this.earliestFinish = 0;
    this.latestStart = 0;
    this.latestFinish = 0;
    this.slack = 0;
    this.isCritical = false;
  }
}

const CriticalPathAnalyzer: React.FC<CriticalPathAnalyzerProps> = ({ tasks, onCriticalPathCalculated }) => {
  const [criticalPath, setCriticalPath] = useState<TaskNode[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasDependencyIssue, setHasDependencyIssue] = useState(false);
  const [projectDuration, setProjectDuration] = useState(0);
  
  const calculateCriticalPath = () => {
    setIsCalculating(true);
    setTimeout(() => {
      try {
        // Convert tasks to task nodes
        const taskNodes = tasks.map(task => new TaskNode(task));
        
        // Check for circular dependencies
        const checkCircularDependencies = (nodeId: number, visited: Set<number>, path: Set<number>): boolean => {
          visited.add(nodeId);
          path.add(nodeId);
          
          const node = taskNodes.find(n => n.id === nodeId);
          if (node) {
            for (const depId of node.dependsOn) {
              if (!visited.has(depId)) {
                if (checkCircularDependencies(depId, visited, path)) {
                  return true;
                }
              } else if (path.has(depId)) {
                return true;
              }
            }
          }
          
          path.delete(nodeId);
          return false;
        };
        
        let hasCircular = false;
        const visited = new Set<number>();
        for (const node of taskNodes) {
          if (!visited.has(node.id)) {
            if (checkCircularDependencies(node.id, new Set(), new Set())) {
              hasCircular = true;
              break;
            }
          }
        }
        
        if (hasCircular) {
          setHasDependencyIssue(true);
          setIsCalculating(false);
          return;
        }
        
        // Forward pass - calculate earliest start and finish times
        let maxFinish = 0;
        const calculateEarliestTimes = (nodeId: number, earliestStart: number): void => {
          const node = taskNodes.find(n => n.id === nodeId);
          if (!node) return;
          
          node.earliestStart = Math.max(node.earliestStart, earliestStart);
          node.earliestFinish = node.earliestStart + node.duration;
          
          maxFinish = Math.max(maxFinish, node.earliestFinish);
          
          // Process dependent tasks
          const dependentTasks = taskNodes.filter(n => n.dependsOn.includes(nodeId));
          for (const depTask of dependentTasks) {
            calculateEarliestTimes(depTask.id, node.earliestFinish);
          }
        };
        
        // Start with tasks that have no dependencies
        const startTasks = taskNodes.filter(node => node.dependsOn.length === 0);
        for (const startTask of startTasks) {
          calculateEarliestTimes(startTask.id, 0);
        }
        
        // Backward pass - calculate latest start and finish times
        const calculateLatestTimes = (nodeId: number, latestFinish: number): void => {
          const node = taskNodes.find(n => n.id === nodeId);
          if (!node) return;
          
          node.latestFinish = Math.min(latestFinish, node.latestFinish === 0 ? latestFinish : node.latestFinish);
          node.latestStart = node.latestFinish - node.duration;
          node.slack = node.latestStart - node.earliestStart;
          node.isCritical = node.slack === 0;
          
          // Process dependencies
          for (const depId of node.dependsOn) {
            const depNode = taskNodes.find(n => n.id === depId);
            if (depNode) {
              calculateLatestTimes(depId, node.latestStart);
            }
          }
        };
        
        // Initialize latest finish times
        for (const node of taskNodes) {
          node.latestFinish = maxFinish;
        }
        
        // Find end tasks (those that no other task depends on)
        const allDependencies = new Set(taskNodes.flatMap(node => node.dependsOn));
        const endTasks = taskNodes.filter(node => !allDependencies.has(node.id));
        
        for (const endTask of endTasks) {
          calculateLatestTimes(endTask.id, maxFinish);
        }
        
        // Identify critical path
        const criticalPathNodes = taskNodes.filter(node => node.isCritical);
        
        // Sort by earliest start to get the sequence
        criticalPathNodes.sort((a, b) => a.earliestStart - b.earliestStart);
        
        setCriticalPath(criticalPathNodes);
        setProjectDuration(maxFinish);
        setHasDependencyIssue(false);
        
        // Notify parent component
        const criticalPathTasks = criticalPathNodes.map(node => 
          tasks.find(task => task.id === node.id)
        ).filter(Boolean) as ExecutionTask[];
        onCriticalPathCalculated(criticalPathTasks);
      } catch (error) {
        console.error("Error calculating critical path:", error);
        setHasDependencyIssue(true);
      } finally {
        setIsCalculating(false);
      }
    }, 1000); // Simulate calculation time
  };
  
  return (
    <div>
      <div className="mb-6">
        <Button
          onClick={calculateCriticalPath}
          disabled={isCalculating || tasks.length === 0}
          className="bg-purple-600 hover:bg-purple-700"
        >
          {isCalculating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <GitMerge className="h-4 w-4 mr-2" />
              Calculate Critical Path
            </>
          )}
        </Button>
      </div>
      
      {hasDependencyIssue && (
        <Alert className="bg-red-900/30 border-red-700 mb-6">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription>
            Dependency issue detected. Please check for circular dependencies or missing tasks.
          </AlertDescription>
        </Alert>
      )}
      
      {criticalPath.length > 0 && !hasDependencyIssue && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg border border-purple-700">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-purple-400" />
              <span className="text-sm text-gray-300">Estimated Project Duration:</span>
            </div>
            <Badge className="bg-purple-600 ml-2">
              <Clock className="h-3 w-3 mr-1" />
              {projectDuration} days
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold text-purple-400 mt-6 mb-3">Critical Path Tasks</h3>
          
          <div className="grid grid-cols-1 gap-4">
            {criticalPath.map((node, index) => {
              const task = tasks.find(t => t.id === node.id);
              return task ? (
                <Card key={node.id} className="bg-gray-800 border border-purple-700">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <Badge className="bg-purple-600 mr-2">Task {index + 1}</Badge>
                          <h4 className="text-md font-medium">{task.task}</h4>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">{task.goalCategory}</p>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-xs text-gray-400">
                            <span className="font-medium">Start:</span> Day {node.earliestStart}
                          </div>
                          <div className="text-xs text-gray-400">
                            <span className="font-medium">Finish:</span> Day {node.earliestFinish}
                          </div>
                          <div className="text-xs text-gray-400">
                            <span className="font-medium">Duration:</span> {task.duration} days
                          </div>
                          <div className="text-xs text-gray-400">
                            <span className="font-medium">Slack:</span> {node.slack} days
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-red-600">Critical</Badge>
                    </div>
                    
                    {/* Dependencies visualization */}
                    {node.dependsOn.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-700">
                        <div className="text-xs text-gray-400 mb-1">Depends on:</div>
                        <div className="flex flex-wrap gap-1">
                          {node.dependsOn.map(depId => {
                            const depTask = tasks.find(t => t.id === depId);
                            return depTask ? (
                              <Badge key={depId} className="bg-gray-700 text-gray-300 text-xs">
                                {depTask.task}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : null;
            })}
          </div>
        </div>
      )}
      
      {tasks.length === 0 && (
        <Alert className="bg-gray-800 border-gray-700">
          <AlertDescription>
            No tasks available. Add tasks with dependencies to calculate the critical path.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default CriticalPathAnalyzer;
