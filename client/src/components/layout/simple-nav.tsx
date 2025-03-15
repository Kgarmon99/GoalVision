import React, { useEffect, useState } from 'react';
import { Home, Target, CheckSquare, Plus, BarChart2, Settings, PlusCircle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/**
 * A simple and consistent navigation bar for the application
 */
export function SimpleNav() {
  const [currentPath, setCurrentPath] = useState<string>('');
  
  // Update current path when component mounts or when navigation occurs
  useEffect(() => {
    const updatePath = () => {
      setCurrentPath(window.location.pathname);
    };
    
    // Set initial path
    updatePath();
    
    // Add event listener for navigation changes
    window.addEventListener('popstate', updatePath);
    
    // Cleanup
    return () => {
      window.removeEventListener('popstate', updatePath);
    };
  }, []);

  // Navigation items definition
  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home size={20} />, description: 'Main overview' },
    { name: 'Goals', path: '/goal-visualizations', icon: <Target size={20} />, description: 'View and manage goals' },
    { name: 'Tasks', path: '/task-board', icon: <CheckSquare size={20} />, description: 'View and manage tasks' },
    { name: 'Metrics', path: '/metrics', icon: <BarChart2 size={20} />, description: 'Track performance metrics' },
  ];
  
  // Check if current path matches the given path
  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') {
      return true;
    }
    return path !== '/' && currentPath === path;
  };

  // Handle navigation with proper routing
  const handleNavigation = (path: string, e: React.MouseEvent) => {
    if (isActive(path)) {
      e.preventDefault(); // Prevent navigation if already on this page
    } else {
      // Force a full page reload to ensure routing works
      window.location.href = path;
      e.preventDefault();
    }
  };

  // Quick actions for adding new items
  const quickActions = [
    { name: 'Add Goal', path: '/add-goal', icon: <Target size={16} /> },
    { name: 'Add Task', path: '/add-task', icon: <CheckSquare size={16} /> },
    { name: 'Update Progress', path: '/add-progress', icon: <BarChart2 size={16} /> },
  ];

  return (
    <TooltipProvider>
      <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10">
        <div className="container flex items-center justify-between h-16">
          <a 
            href="/" 
            className="flex items-center gap-2 font-semibold transition-colors hover:text-primary"
            onClick={(e) => handleNavigation('/', e)}
          >
            <Target className="h-5 w-5 text-primary" />
            <span>Goals</span>
          </a>
          
          <nav className="flex items-center space-x-3">
            {navItems.map((item) => (
              <Tooltip key={item.name} delayDuration={300}>
                <TooltipTrigger asChild>
                  <a
                    href={item.path}
                    className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    onClick={(e) => handleNavigation(item.path, e)}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.name}</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.description}</p>
                </TooltipContent>
              </Tooltip>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="ml-2 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <PlusCircle size={18} className="mr-2" />
                  <span className="hidden sm:inline">Add New</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {quickActions.map((action) => (
                  <DropdownMenuItem key={action.name} asChild>
                    <a
                      href={action.path}
                      className="flex items-center cursor-pointer"
                      onClick={(e) => handleNavigation(action.path, e)}
                    >
                      {action.icon}
                      <span className="ml-2">{action.name}</span>
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </TooltipProvider>
  );
}