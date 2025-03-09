import React from 'react';
import { Home, Target, CheckSquare, BarChart2, Plus } from 'lucide-react';
import { useLocation, Link } from 'wouter';

/**
 * A simple and consistent navigation bar for the application
 */
export function SimpleNav() {
  const [location] = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: <Home size={20} /> },
    { name: 'Goals', href: '/goal-visualizations', icon: <Target size={20} /> },
    { name: 'Tasks', href: '/task-board', icon: <CheckSquare size={20} /> },
  ];
  
  // Check if current location matches the given href
  const isActive = (href: string) => {
    if (href === '/' && location === '/') {
      return true;
    }
    // For other routes, check if location starts with the href
    return href !== '/' && location.startsWith(href);
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10">
      <div className="container flex items-center justify-between h-16">
        <a href="/" className="flex items-center gap-2 font-semibold">
          <Target className="h-5 w-5 text-primary" />
          <span>2025 Goals</span>
        </a>
        
        <nav className="flex items-center space-x-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
                isActive(item.href)
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
            className={`ml-2 px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200 ${
              location === '/add-goal'
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Goal</span>
          </a>
        </nav>
      </div>
    </div>
  );
}