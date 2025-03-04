import { useState, useEffect } from "react";
import { Goal, ExecutionTask } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link as WouterLink } from "wouter";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
  ChevronRight,
  ArrowRight,
  Plus,
  TrendingUp
} from "lucide-react";

interface VisualProgressTrackerProps {
  goals: Goal[];
  tasks: ExecutionTask[];
}

export function VisualProgressTracker({ goals, tasks }: VisualProgressTrackerProps) {
  const [hoveredGoal, setHoveredGoal] = useState<number | null>(null);
  
  // Group tasks by goal category
  const tasksByGoal: Record<string, ExecutionTask[]> = {};
  tasks.forEach(task => {
    if (!tasksByGoal[task.goalCategory]) {
      tasksByGoal[task.goalCategory] = [];
    }
    tasksByGoal[task.goalCategory].push(task);
  });

  return (
    <Card className="bg-gray-900/90 border border-green-600">
      <CardHeader className="border-b border-green-800 bg-gray-800/50">
        <CardTitle className="text-green-400 flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Visual Goal Tracker
        </CardTitle>
        <CardDescription className="text-gray-400">
          Track your goals and their tasks in a visual way
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="space-y-1">
          {goals.map(goal => {
            const goalTasks = tasksByGoal[goal.name] || [];
            const totalTasks = goalTasks.length;
            const completedTasks = goalTasks.filter(t => t.status === 'done').length;
            const inProgressTasks = goalTasks.filter(t => t.status === 'in-progress').length;
            const missedTasks = goalTasks.filter(t => t.status === 'missed').length;
            
            const completionPercentage = totalTasks > 0 
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0;
            
            const progressPercentage = (goal.current / goal.target) * 100;
            
            return (
              <div 
                key={goal.id}
                className={`relative p-4 ${
                  hoveredGoal === goal.id 
                    ? 'bg-gray-800/70' 
                    : 'hover:bg-gray-800/50'
                } transition-colors rounded-sm`}
                onMouseEnter={() => setHoveredGoal(goal.id)}
                onMouseLeave={() => setHoveredGoal(null)}
              >
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-white flex items-center">
                      <div className={`w-3 h-3 rounded-full bg-${goal.color || 'green'}-500 mr-2`}></div>
                      {goal.name}
                    </h3>
                    <p className="text-sm text-gray-400 mt-1 flex items-center">
                      <Target className="h-3.5 w-3.5 mr-1.5 text-green-400" />
                      <span className="text-white">{goal.current}</span>
                      <span className="text-gray-500 mx-1">/</span>
                      <span className="text-white">{goal.target} {goal.unit}</span>
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      <span className="text-green-400">{completedTasks}</span>
                      <span className="text-gray-500">/</span>
                      <span className="text-white">{totalTasks} tasks</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {completionPercentage}% complete
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {/* Goal Progress bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Goal Progress</span>
                      <span className="text-xs font-medium text-green-400">{Math.round(progressPercentage)}%</span>
                    </div>
                    <Progress 
                      value={progressPercentage} 
                      className="h-2" 
                      indicatorClassName="bg-green-500"
                    />
                  </div>
                  
                  {/* Task Completion Progress bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-gray-400">Task Completion</span>
                      <span className="text-xs font-medium text-green-400">{completionPercentage}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-green-500 h-full" 
                        style={{ width: `${completedTasks / totalTasks * 100}%` }}
                      ></div>
                      <div 
                        className="bg-yellow-500 h-full" 
                        style={{ width: `${inProgressTasks / totalTasks * 100}%` }}
                      ></div>
                      <div 
                        className="bg-red-500 h-full" 
                        style={{ width: `${missedTasks / totalTasks * 100}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between mt-2 text-xs">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        <span className="text-gray-400">Done ({completedTasks})</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                        <span className="text-gray-400">In Progress ({inProgressTasks})</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                        <span className="text-gray-400">Missed ({missedTasks})</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Task Quick View */}
                {hoveredGoal === goal.id && goalTasks.length > 0 && (
                  <div className="mt-4 bg-gray-800/70 rounded-md p-3 border border-green-800/60">
                    <h4 className="text-sm font-medium text-green-400 mb-2">Recent Tasks</h4>
                    <div className="space-y-2 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
                      {goalTasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            {task.status === 'done' ? (
                              <CheckCircle2 className="h-3 w-3 text-green-400 mr-2" />
                            ) : task.status === 'in-progress' ? (
                              <Clock className="h-3 w-3 text-yellow-400 mr-2" />
                            ) : (
                              <AlertCircle className="h-3 w-3 text-red-400 mr-2" />
                            )}
                            <span className="text-sm text-white truncate max-w-xs">{task.task}</span>
                          </div>
                          <Badge 
                            variant="outline" 
                            className="text-xs bg-gray-900/60 text-gray-300 border-gray-700"
                          >
                            {task.dueDate}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="link" 
                        size="sm" 
                        asChild
                        className="text-green-400 hover:text-green-300 p-0 h-6"
                      >
                        <WouterLink href={`/goal-tasks/${goal.id}`}>
                          View All Tasks
                          <ChevronRight className="h-3 w-3 ml-1" />
                        </WouterLink>
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Task Quick Add */}
                {hoveredGoal === goal.id && (
                  <div className="absolute top-3 right-3">
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-8 w-8 p-0 text-gray-400 hover:text-green-400 hover:bg-gray-800"
                      asChild
                    >
                      <WouterLink href="/add-task">
                        <Plus className="h-4 w-4" />
                      </WouterLink>
                    </Button>
                  </div>
                )}
                
                {/* View Goal Details Button */}
                <div className={`mt-3 text-right transition-opacity ${hoveredGoal === goal.id ? 'opacity-100' : 'opacity-0'}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="text-green-400 border-green-500 hover:bg-gray-800"
                  >
                    <WouterLink href={`/goal-tasks/${goal.id}`}>
                      View Goal Details
                      <ArrowRight className="ml-2 h-3.5 w-3.5" />
                    </WouterLink>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}