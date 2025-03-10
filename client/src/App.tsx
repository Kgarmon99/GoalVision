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
import { GoalCelebrationProvider } from "./context/goal-celebration-context";
import { useState, useEffect } from "react";

function App() {
  const [currentPage, setCurrentPage] = useState<JSX.Element>(<Dashboard />);
  // Add a loading state with very short display time
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
        {/* Navigation Header */}
        <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10">
          <div className="container flex items-center justify-between h-16">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <circle cx="12" cy="12" r="10"></circle>
                <circle cx="12" cy="12" r="6"></circle>
                <circle cx="12" cy="12" r="2"></circle>
              </svg>
              <span>2025 Goals</span>
            </a>
            
            <nav className="flex items-center space-x-2">
              <a 
                href="/"
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${window.location.pathname === '/' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
                <span className="hidden sm:inline">Dashboard</span>
              </a>
              
              <a 
                href="/goal-visualizations"
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${window.location.pathname === '/goal-visualizations' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
                <span className="hidden sm:inline">Goals</span>
              </a>
              
              <a 
                href="/task-board"
                className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${window.location.pathname === '/task-board' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2"></rect>
                  <path d="m9 13 2 2 4-4"></path>
                </svg>
                <span className="hidden sm:inline">Tasks</span>
              </a>
              
              <a 
                href="/add-goal"
                className={`ml-2 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${
                  window.location.pathname === '/add-goal' ? 'bg-primary/90 text-primary-foreground' : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14"></path>
                  <path d="M5 12h14"></path>
                </svg>
                <span className="hidden sm:inline">Add Goal</span>
              </a>
            </nav>
          </div>
        </header>
        
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
