import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Target, 
  CheckSquare, 
  Plus, 
  BarChart2, 
  Settings, 
  PlusCircle 
} from 'lucide-react';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Navigation item type definition
interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  description?: string;
}

// Enhanced navigation props
interface EnhancedNavProps {
  variant?: 'simple' | 'enhanced';
  className?: string;
  showBranding?: boolean;
  brandingText?: string;
  brandingIcon?: React.ReactNode;
  additionalNavItems?: NavItem[];
  quickActions?: NavItem[];
  fixed?: boolean;
}

// Default navigation items
const getDefaultNavItems = (): NavItem[] => [
  { name: 'Dashboard', path: '/', icon: <Home size={20} />, description: 'Main overview' },
  { name: 'Goals', path: '/goal-visualizations', icon: <Target size={20} />, description: 'View and manage goals' },
  { name: 'Tasks', path: '/task-board', icon: <CheckSquare size={20} />, description: 'View and manage tasks' },
  { name: 'Metrics', path: '/metrics', icon: <BarChart2 size={20} />, description: 'Track performance metrics' },
];

// Default quick actions
const getDefaultQuickActions = (): NavItem[] => [
  { name: 'Add Goal', path: '/add-goal', icon: <Target size={16} /> },
  { name: 'Add Task', path: '/add-task', icon: <CheckSquare size={16} /> },
  { name: 'Update Progress', path: '/add-progress', icon: <BarChart2 size={16} /> },
];

// Check if current path matches given path
const isActivePath = (currentPath: string, path: string): boolean => {
  if (path === '/' && currentPath === '/') {
    return true;
  }
  return path !== '/' && currentPath === path;
};

// Handle navigation with proper routing
const handleNavigation = (path: string, currentPath: string, e: React.MouseEvent): void => {
  if (isActivePath(currentPath, path)) {
    e.preventDefault(); // Prevent navigation if already on this page
  } else {
    // Force a full page reload to ensure routing works
    window.location.href = path;
    e.preventDefault();
  }
};

// Render a simple navigation bar
const renderSimpleNav = (props: EnhancedNavProps) => {
  const { 
    className, 
    showBranding = true, 
    brandingText = "2025 Goals",
    brandingIcon = <Target className="h-5 w-5 text-primary" />,
    additionalNavItems = [],
    fixed = true
  } = props;
  
  // Combine default and additional navigation items
  const navItems = [...getDefaultNavItems(), ...additionalNavItems];

  return (
    <header className={cn(
      fixed ? "fixed top-0 left-0 right-0" : "",
      "bg-background border-b border-border z-10",
      className
    )}>
      <div className="container flex items-center justify-between h-16">
        {showBranding && (
          <a 
            href="/" 
            className="flex items-center gap-2 font-semibold"
          >
            {brandingIcon}
            <span>{brandingText}</span>
          </a>
        )}
        
        <nav className="flex items-center space-x-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200 
                ${location.pathname === item.path 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.name}</span>
            </a>
          ))}
          
          <a 
            href="/add-goal" 
            className={`ml-2 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200
              ${location.pathname === '/add-goal'
                ? 'bg-primary/90 text-primary-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Goal</span>
          </a>
        </nav>
      </div>
    </header>
  );
};

// Render an enhanced navigation with tooltips and dropdown
const renderEnhancedNav = (props: EnhancedNavProps) => {
  const { 
    className, 
    showBranding = true, 
    brandingText = "2025 Goals Tracker",
    brandingIcon = <Target className="h-5 w-5 text-primary" />,
    additionalNavItems = [],
    quickActions = getDefaultQuickActions(),
    fixed = true
  } = props;
  
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
  
  // Combine default and additional navigation items
  const navItems = [...getDefaultNavItems(), ...additionalNavItems];

  return (
    <TooltipProvider>
      <div className={cn(
        fixed ? "fixed top-0 left-0 right-0" : "",
        "bg-background border-b border-border z-10",
        className
      )}>
        <div className="container flex items-center justify-between h-16">
          {showBranding && (
            <a 
              href="/" 
              className="flex items-center gap-2 font-semibold transition-colors hover:text-primary"
              onClick={(e) => handleNavigation('/', currentPath, e)}
            >
              {brandingIcon}
              <span>{brandingText}</span>
            </a>
          )}
          
          <nav className="flex items-center space-x-3">
            {navItems.map((item) => (
              <Tooltip key={item.name} delayDuration={300}>
                <TooltipTrigger asChild>
                  <a
                    href={item.path}
                    className={cn(
                      "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-all duration-200",
                      isActivePath(currentPath, item.path)
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                    onClick={(e) => handleNavigation(item.path, currentPath, e)}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.name}</span>
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.description || item.name}</p>
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
                      onClick={(e) => handleNavigation(action.path, currentPath, e)}
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
};

// Main component export
export function EnhancedNav(props: EnhancedNavProps) {
  const { variant = 'simple' } = props;
  
  if (variant === 'enhanced') {
    return renderEnhancedNav(props);
  }
  
  return renderSimpleNav(props);
}