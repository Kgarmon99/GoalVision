import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link as WouterLink } from "wouter";
import { ExecutionTask } from "@shared/schema";
import { format, isAfter, isBefore, parseISO, differenceInDays, addDays } from "date-fns";
import { getFirstCharacter, getStringOrFallback } from "../utils/string-utils";
import { getDaysUntilDescription, getUrgencyLevel, isDatePast } from "../utils/date-utils";
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Plus,
  User,
  Target,
  MoreVertical,
  Trash2,
  Eye,
  PlusCircle,
  AlertTriangle,
  Flag,
  ArrowUpCircle,
  Timer
} from "lucide-react";

interface DragDropTaskBoardProps {
  tasks: ExecutionTask[];
  onTaskStatusChange?: (taskId: number, newStatus: string) => void;
}

type TaskColumn = {
  id: string;
  title: string;
  icon: React.ReactNode;
  tasks: ExecutionTask[];
  colorClass: string;
};

export function DragDropTaskBoard({ tasks, onTaskStatusChange }: DragDropTaskBoardProps) {
  const { toast } = useToast();
  const [hoveredTask, setHoveredTask] = useState<number | null>(null);
  
  // Calculate if a date is urgent (within 2 days)
  const isUrgent = (dateString: string) => {
    const urgencyLevel = getUrgencyLevel(dateString);
    return urgencyLevel === 'medium';
  };

  // Calculate if a date is overdue
  const isOverdue = (dateString: string) => {
    return isDatePast(dateString);
  };
  
  // Format date to be more readable and show urgency
  const formatDueDate = (dateString: string, status: string) => {
    if (status === "done") {
      return <span className="text-xs text-gray-400">{dateString}</span>;
    }
    
    const urgencyLevel = getUrgencyLevel(dateString);
    const daysDescription = getDaysUntilDescription(dateString);
    
    // If date is overdue
    if (urgencyLevel === 'high' && isDatePast(dateString)) {
      return (
        <span className="text-xs flex items-center text-red-400 font-medium">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Overdue!
        </span>
      );
    }
    
    // If date is today
    if (daysDescription === "Today") {
      return (
        <span className="text-xs flex items-center text-amber-400 font-medium">
          <Timer className="h-3 w-3 mr-1" />
          Today!
        </span>
      );
    }
    
    // If date is tomorrow
    if (daysDescription === "Tomorrow") {
      return (
        <span className="text-xs flex items-center text-amber-400 font-medium">
          <Clock className="h-3 w-3 mr-1" />
          Tomorrow
        </span>
      );
    }
    
    // Within 2-7 days (medium urgency)
    if (urgencyLevel === 'medium') {
      return (
        <span className="text-xs flex items-center text-amber-400">
          <Flag className="h-3 w-3 mr-1" />
          {daysDescription}
        </span>
      );
    }
    
    // Low urgency (more than 7 days)
    return <span className="text-xs text-gray-400">{dateString}</span>;
  };
  
  // Get priority indicator badge
  const getPriorityBadge = (task: ExecutionTask) => {
    // High priority if overdue
    if (isOverdue(task.dueDate) && task.status !== "done") {
      return (
        <Badge variant="outline" className="text-xs bg-red-950 text-red-400 border-red-700 absolute -top-2 -right-2">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Urgent
        </Badge>
      );
    }
    
    // Urgent if due within 2 days
    if (isUrgent(task.dueDate) && task.status !== "done") {
      return (
        <Badge variant="outline" className="text-xs bg-amber-950 text-amber-400 border-amber-700 absolute -top-2 -right-2">
          <Flag className="h-3 w-3 mr-1" />
          Due Soon
        </Badge>
      );
    }
    
    // High impact goals
    if ((task.goalCategory === "Revenue" || task.goalCategory === "User Growth") && task.status !== "done") {
      return (
        <Badge variant="outline" className="text-xs bg-blue-950 text-blue-400 border-blue-700 absolute -top-2 -right-2">
          <ArrowUpCircle className="h-3 w-3 mr-1" />
          High Impact
        </Badge>
      );
    }
    
    return null;
  };
  
  const [columns, setColumns] = useState<TaskColumn[]>([
    {
      id: "in-progress",
      title: "In Progress",
      icon: <Clock className="h-4 w-4 text-yellow-400" />,
      tasks: [],
      colorClass: "border-yellow-500/50 bg-yellow-900/20 hover:bg-yellow-900/30"
    },
    {
      id: "done",
      title: "Completed",
      icon: <CheckCircle2 className="h-4 w-4 text-green-400" />,
      tasks: [],
      colorClass: "border-green-500/50 bg-green-900/20 hover:bg-green-900/30"
    },
    {
      id: "missed",
      title: "Missed",
      icon: <AlertCircle className="h-4 w-4 text-red-400" />,
      tasks: [],
      colorClass: "border-red-500/50 bg-red-900/20 hover:bg-red-900/30"
    }
  ]);

  // Update task status mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: number; newStatus: string }) => {
      return apiRequest("PATCH", `/api/tasks/${id}`, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
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

  // Distribute tasks to columns
  useEffect(() => {
    const newColumns = [...columns];
    
    // Reset tasks in each column
    newColumns.forEach(column => {
      column.tasks = [];
    });
    
    // Distribute tasks to appropriate columns
    tasks.forEach(task => {
      const columnIndex = newColumns.findIndex(column => column.id === task.status);
      if (columnIndex >= 0) {
        newColumns[columnIndex].tasks.push(task);
      }
    });
    
    setColumns(newColumns);
  }, [tasks]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    
    // If dropped outside a droppable area
    if (!destination) return;
    
    // If dropped in the same place
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) return;
    
    // Find source and destination columns
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);
    
    if (!sourceColumn || !destColumn) return;
    
    // Create new arrays to avoid mutation
    const newColumns = [...columns];
    const sourceColIndex = newColumns.findIndex(col => col.id === source.droppableId);
    const destColIndex = newColumns.findIndex(col => col.id === destination.droppableId);
    
    // If source and destination are different columns
    if (source.droppableId !== destination.droppableId) {
      // Remove task from source column
      const [movedTask] = newColumns[sourceColIndex].tasks.splice(source.index, 1);
      
      // Update task status
      const updatedTask = { ...movedTask, status: destination.droppableId };
      
      // Add task to destination column
      newColumns[destColIndex].tasks.splice(destination.index, 0, updatedTask);
      
      // Update task status in the backend
      updateTaskMutation.mutateAsync({
        id: movedTask.id,
        newStatus: destination.droppableId
      });
      
      // Call the callback if provided
      if (onTaskStatusChange) {
        onTaskStatusChange(movedTask.id, destination.droppableId);
      }
    } else {
      // Reorder within the same column
      const [movedTask] = newColumns[sourceColIndex].tasks.splice(source.index, 1);
      newColumns[sourceColIndex].tasks.splice(destination.index, 0, movedTask);
    }
    
    setColumns(newColumns);
  };

  return (
    <Card className="bg-gray-900/90 border border-green-600">
      <CardHeader className="border-b border-green-800 bg-gray-800/50">
        <CardTitle className="text-green-400 flex items-center">
          <Target className="mr-2 h-5 w-5" />
          Task Board
        </CardTitle>
        <CardDescription className="text-gray-400">
          Drag and drop tasks to update their status
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {columns.map(column => (
              <div key={column.id} className="flex flex-col">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white flex items-center">
                    {column.icon}
                    <span className="ml-2">{column.title}</span>
                    <Badge className="ml-2 text-xs bg-gray-800">{column.tasks.length}</Badge>
                  </h3>
                  {column.id === "in-progress" && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 p-0 text-green-400 hover:text-green-300"
                      asChild
                    >
                      <WouterLink href="/add-task">
                        <PlusCircle className="h-4 w-4" />
                      </WouterLink>
                    </Button>
                  )}
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[400px] p-2 rounded-md border ${column.colorClass} flex-grow overflow-y-auto`}
                    >
                      {column.tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-3 mb-2 rounded-md border border-gray-700 bg-gray-800 ${
                                snapshot.isDragging ? "shadow-lg opacity-80" : ""
                              } ${hoveredTask === task.id ? "ring-1 ring-green-500" : ""}`}
                              onMouseEnter={() => setHoveredTask(task.id)}
                              onMouseLeave={() => setHoveredTask(null)}
                            >
                              {/* Priority badge */}
                              {getPriorityBadge(task)}
                              
                              <div className="flex justify-between items-start">
                                <div className="font-medium text-white text-sm mb-2">{task.task}</div>
                                {hoveredTask === task.id && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-7 w-7 p-0 text-gray-400 hover:text-white hover:bg-gray-700 -mt-1 -mr-1"
                                    asChild
                                  >
                                    <WouterLink href={`/tasks/${task.id}`}>
                                      <Eye className="h-3.5 w-3.5" />
                                    </WouterLink>
                                  </Button>
                                )}
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <div className="flex">
                                  {formatDueDate(task.dueDate, task.status)}
                                </div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    task.goalCategory === "Revenue" 
                                      ? "bg-blue-900/40 text-blue-400 border-blue-700" 
                                      : task.goalCategory === "User Growth"
                                        ? "bg-purple-900/40 text-purple-400 border-purple-700"
                                        : "bg-gray-700/80 text-gray-300 border-gray-600"
                                  }`}
                                >
                                  {task.goalCategory}
                                </Badge>
                              </div>
                              
                              {hoveredTask === task.id && (
                                <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-700">
                                  <div className="flex items-center">
                                    <div className="h-5 w-5 rounded-full bg-green-900 flex items-center justify-center text-xs font-medium text-white border border-green-500">
                                      {getFirstCharacter(task.owner)}
                                    </div>
                                    <span className="text-xs text-gray-400 ml-1">{getStringOrFallback(task.owner)}</span>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-5 p-0 text-gray-400 hover:text-green-400"
                                    asChild
                                  >
                                    <WouterLink href={`/tasks/${task.id}`}>
                                      View
                                    </WouterLink>
                                  </Button>
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {column.tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-4">
                          <div className="text-gray-500 mb-2">
                            {column.icon}
                          </div>
                          <p className="text-xs text-gray-500">
                            {column.id === "in-progress" 
                              ? "No tasks in progress" 
                              : column.id === "done" 
                                ? "No completed tasks" 
                                : "No missed tasks"}
                          </p>
                          {column.id === "in-progress" && (
                            <Button 
                              variant="link" 
                              size="sm" 
                              className="mt-2 text-green-400 p-0 h-auto"
                              asChild
                            >
                              <WouterLink href="/add-task">
                                <Plus className="h-3 w-3 mr-1" />
                                Add Task
                              </WouterLink>
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
}