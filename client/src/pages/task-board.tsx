import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { DragDropTaskBoard } from "@/components/drag-drop-task-board";
import { VisualProgressTracker } from "@/components/visual-progress-tracker";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Kanban,
  Filter,
  ArrowDownUp,
  Search,
  PlusCircle,
  LayoutGrid,
  List,
  Calendar,
  Target,
  Rocket,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { ExecutionTask, Goal, Week } from "@shared/schema";

export default function TaskBoard() {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"board" | "progress">("board");
  const [sortBy, setSortBy] = useState<"dueDate" | "goalCategory">("dueDate");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterGoal, setFilterGoal] = useState<string | null>(null);
  
  // Fetch all tasks
  const { 
    data: tasks = [], 
    isLoading: isLoadingTasks 
  } = useQuery<ExecutionTask[]>({
    queryKey: ['/api/tasks'],
  });
  
  // Fetch all goals
  const { 
    data: goals = [], 
    isLoading: isLoadingGoals 
  } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Fetch all weeks for reference
  const { 
    data: weeks = [], 
    isLoading: isLoadingWeeks 
  } = useQuery<Week[]>({
    queryKey: ['/api/weeks'],
  });
  
  // Filter and sort tasks
  const filteredTasks = tasks.filter(task => {
    if (filterStatus && task.status !== filterStatus) return false;
    if (filterGoal && task.goalCategory !== filterGoal) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "dueDate") {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    } else {
      return a.goalCategory.localeCompare(b.goalCategory);
    }
  });

  const handleTaskStatusChange = (taskId: number, newStatus: string) => {
    toast({
      title: "Task Status Updated",
      description: `Task has been moved to ${newStatus.replace("-", " ")}`,
    });
  };
  
  const isLoading = isLoadingTasks || isLoadingGoals || isLoadingWeeks;

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.15),rgba(0,0,0,0)_50%)]"></div>
      <Header />
      
      <main className="flex-1 py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white text-glow flex items-center">
                  <Kanban className="h-6 w-6 mr-2 text-green-400" />
                  Task Board
                </h1>
                <p className="text-gray-400 mt-1">
                  Drag and drop tasks to update their status and track your progress
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center rounded-md border border-green-800 overflow-hidden">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`h-9 px-3 rounded-none border-r border-green-800 ${
                      viewMode === "board" ? "bg-green-900/50 text-green-400" : "text-gray-400"
                    }`}
                    onClick={() => setViewMode("board")}
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    Board
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className={`h-9 px-3 rounded-none ${
                      viewMode === "progress" ? "bg-green-900/50 text-green-400" : "text-gray-400"
                    }`}
                    onClick={() => setViewMode("progress")}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Progress
                  </Button>
                </div>
                
                <Button asChild className="bg-green-600 text-white hover:bg-green-700">
                  <Link href="/add-task">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Task
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          
          {/* Filters and Controls */}
          <div className="mb-6 flex flex-wrap gap-2 bg-gray-900/80 p-3 rounded-lg border border-green-600 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <Filter className="text-green-400 h-4 w-4 mr-2" />
                <span className="text-green-400 font-medium text-sm">Filter:</span>
              </div>
              
              <select 
                className="bg-gray-800 text-white text-sm rounded-md border border-gray-700 h-8 px-2"
                value={filterStatus || ""}
                onChange={(e) => setFilterStatus(e.target.value || null)}
              >
                <option value="">All Statuses</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Completed</option>
                <option value="missed">Missed</option>
              </select>
              
              <select 
                className="bg-gray-800 text-white text-sm rounded-md border border-gray-700 h-8 px-2"
                value={filterGoal || ""}
                onChange={(e) => setFilterGoal(e.target.value || null)}
              >
                <option value="">All Goals</option>
                {goals.map(goal => (
                  <option key={goal.id} value={goal.name}>{goal.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <ArrowDownUp className="text-green-400 h-4 w-4 mr-2" />
                <span className="text-green-400 font-medium text-sm">Sort:</span>
              </div>
              
              <select 
                className="bg-gray-800 text-white text-sm rounded-md border border-gray-700 h-8 px-2"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "dueDate" | "goalCategory")}
              >
                <option value="dueDate">Due Date</option>
                <option value="goalCategory">Goal Category</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex items-center justify-center h-96 bg-gray-900/80 rounded-lg border border-green-600">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                <p className="text-green-400">Loading tasks...</p>
              </div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              title="No Tasks Found"
              description={filterStatus || filterGoal ? "Try changing your filters" : "Add your first task to get started"}
              icon="warning"
              addLink="/add-task"
              addText="Add Your First Task"
            />
          ) : viewMode === "board" ? (
            <DragDropTaskBoard 
              tasks={filteredTasks} 
              onTaskStatusChange={handleTaskStatusChange} 
            />
          ) : (
            <VisualProgressTracker
              goals={goals}
              tasks={filteredTasks}
            />
          )}
          
          {/* Quick Help Card */}
          <div className="mt-8 p-4 bg-gray-900/80 rounded-lg border border-green-800/50 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-4">
            <div className="p-3 bg-green-900/30 rounded-full">
              <Rocket className="h-8 w-8 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Pro Tip: Drag & Drop to Update Status</h3>
              <p className="text-gray-400 mb-2">
                Simply drag tasks between columns to update their status. This helps you stay organized and track your progress visually.
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <div className="flex items-center px-2 py-1 bg-yellow-900/20 border border-yellow-500/50 rounded-md">
                  <Clock className="h-3 w-3 text-yellow-400 mr-1" />
                  <span className="text-xs text-yellow-400">In Progress</span>
                </div>
                <div className="flex items-center px-2 py-1 bg-green-900/20 border border-green-500/50 rounded-md">
                  <CheckCircle2 className="h-3 w-3 text-green-400 mr-1" />
                  <span className="text-xs text-green-400">Completed</span>
                </div>
                <div className="flex items-center px-2 py-1 bg-red-900/20 border border-red-500/50 rounded-md">
                  <Target className="h-3 w-3 text-red-400 mr-1" />
                  <span className="text-xs text-red-400">Missed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}