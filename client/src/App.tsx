import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import AddGoal from "@/pages/add-goal";
import AddProgress from "@/pages/add-progress";
import AddTask from "@/pages/add-task";
import TaskDetails from "@/pages/task-details";
import GoalTasks from "@/pages/goal-tasks";
import TaskBoard from "@/pages/task-board";
import GoalVisualizations from "@/pages/goal-visualizations";
import Metrics from "@/pages/metrics";
import { GoalCelebrationProvider } from "./context/goal-celebration-context";
import { EnhancedNav } from "@/components/layout/enhanced-nav";
import { useState, useEffect } from "react";
import { Target } from "lucide-react";

function App() {
  const [currentPage, setCurrentPage] = useState<JSX.Element>(<Dashboard />);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get the current path when the component mounts
    const path = window.location.pathname;
    
    // Simple client-side routing
    switch (path) {
      case '/':
        setCurrentPage(<Dashboard />);
        break;
      case '/add-goal':
        setCurrentPage(<AddGoal />);
        break;
      case '/add-progress':
        setCurrentPage(<AddProgress />);
        break;
      case '/add-task':
        setCurrentPage(<AddTask />);
        break;
      case '/task-board':
        setCurrentPage(<TaskBoard />);
        break;
      case '/goal-visualizations':
        setCurrentPage(<GoalVisualizations />);
        break;
      case '/metrics':
        setCurrentPage(<Metrics />);
        break;
      default:
        // Check for pattern matches
        if (path.startsWith('/tasks/')) {
          setCurrentPage(<TaskDetails />);
        } else if (path.startsWith('/goal-tasks/')) {
          setCurrentPage(<GoalTasks />);
        } else {
          setCurrentPage(<NotFound />);
        }
    }
    
    // Set very short loading time to hide blue/white screen but keep app functionality
    setTimeout(() => {
      setIsLoading(false);
      
      // Also hide the emergency nav if it's showing
      const emergencyNav = document.getElementById('emergency-nav');
      if (emergencyNav) {
        emergencyNav.style.display = 'none';
      }
    }, 200); // Short delay to maintain responsiveness
  }, []);

  // If page is still technically "loading", show skeleton UI instead of white screen
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col bg-background animate-in fade-in-0">
        {/* Skeleton header */}
        <div className="h-16 border-b flex items-center justify-between px-4">
          <div className="h-8 w-32 rounded-md bg-muted/50 animate-pulse"></div>
          <div className="flex gap-2">
            <div className="h-10 w-24 rounded-md bg-muted/50 animate-pulse"></div>
            <div className="h-10 w-24 rounded-md bg-muted/50 animate-pulse"></div>
            <div className="h-10 w-24 rounded-md bg-muted/50 animate-pulse"></div>
          </div>
        </div>
        
        {/* Skeleton content */}
        <div className="flex-1 p-4 flex flex-col gap-4">
          <div className="h-8 w-3/4 max-w-md rounded-md bg-muted/50 animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-40 rounded-lg bg-muted/50 animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <GoalCelebrationProvider>
        {/* Navigation Header - Use Enhanced Nav */}
        <EnhancedNav 
          variant="enhanced"
          brandingText="Goals"
          brandingIcon={<Target className="h-5 w-5 text-primary" />}
          showBranding={true}
          fixed={true}
          quickActions={[
            { name: 'Add Goal', path: '/add-goal', icon: <Target size={16} />, description: 'Create a new goal' },
            { name: 'Add Task', path: '/add-task', icon: <Target size={16} />, description: 'Add a new task' },
            { name: 'Update Progress', path: '/add-progress', icon: <Target size={16} />, description: 'Update goal progress' }
          ]}
        />
        
        {/* Main Content */}
        <div className="pt-16 animate-in fade-in-50 duration-300">
          {currentPage}
        </div>
        
        <Toaster />
      </GoalCelebrationProvider>
    </QueryClientProvider>
  );
}

export default App;
