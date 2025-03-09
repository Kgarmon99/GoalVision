import React, { useEffect, useState } from 'react';
import { Home, Target, CheckSquare, Plus } from 'lucide-react';

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
    { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
    { name: 'Goals', path: '/goal-visualizations', icon: <Target size={20} /> },
    { name: 'Tasks', path: '/task-board', icon: <CheckSquare size={20} /> },
  ];
  
  // Check if current path matches the given path
  const isActive = (path: string) => {
    if (path === '/' && currentPath === '/') {
      return true;
    }
    return path !== '/' && currentPath === path;
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10">
      <div className="container flex items-center justify-between h-16">
        <a 
          href="/" 
          className="flex items-center gap-2 font-semibold"
          onClick={(e) => {
            if (currentPath === '/') {
              e.preventDefault(); // Prevent navigation if already on this page
            }
          }}
        >
          <Target className="h-5 w-5 text-primary" />
          <span>2025 Goals</span>
        </a>
        
        <nav className="flex items-center space-x-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                isActive(item.path)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              onClick={(e) => {
                if (isActive(item.path)) {
                  e.preventDefault(); // Prevent navigation if already on this page
                } else {
                  // Force a full page reload to ensure routing works
                  window.location.href = item.path;
                  e.preventDefault();
                }
              }}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.name}</span>
            </a>
          ))}
          
          <a 
            href="/add-goal" 
            className={`ml-2 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
              isActive('/add-goal')
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
            onClick={(e) => {
              if (isActive('/add-goal')) {
                e.preventDefault(); // Prevent navigation if already on this page
              } else {
                // Force a full page reload to ensure routing works
                window.location.href = '/add-goal';
                e.preventDefault();
              }
            }}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Goal</span>
          </a>
        </nav>
      </div>
    </div>
  );
}