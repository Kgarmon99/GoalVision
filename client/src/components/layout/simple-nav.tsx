import React, { useEffect, useState } from 'react';
import { Home, Target, CheckSquare, TrendingUp, PlusCircle, Calendar, DollarSign, LayoutDashboard, BarChart2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

/**
 * A simple navigation bar with clear, meaningful labels
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

  // Navigation items with clearer descriptions
  const navItems = [
    { name: 'Overview', path: '/', icon: <LayoutDashboard size={20} />, description: 'Your main dashboard' },
    { name: 'Goals', path: '/goal-visualizations', icon: <Target size={20} />, description: 'Track your progress' },
    { name: 'Weekly Tasks', path: '/task-board', icon: <Calendar size={20} />, description: 'Your action items' },
    { name: 'Money & Growth', path: '/metrics', icon: <DollarSign size={20} />, description: 'Financial performance' },
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

  // Quick actions with clearer descriptions
  const quickActions = [
    { name: 'Set New Goal', path: '/add-goal', icon: <Target size={16} /> },
    { name: 'Plan Weekly Task', path: '/add-task', icon: <Calendar size={16} /> },
    { name: 'Update Goal Progress', path: '/add-progress', icon: <TrendingUp size={16} /> },
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
            <span>2025 Goals Tracker</span>
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
                  <span className="hidden sm:inline">Quick Actions</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="p-2 bg-card border border-border shadow-md">
                <h4 className="text-sm font-medium pl-2 pb-2 mb-1 border-b border-border">What would you like to do?</h4>
                {quickActions.map((action) => (
                  <DropdownMenuItem key={action.name} asChild className="rounded-md my-1 px-2 py-1.5 hover:bg-primary/10 hover:text-primary">
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