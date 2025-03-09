import React from 'react';
import { Home, Target, CheckSquare, BarChart2, User } from 'lucide-react';
import { useLocation } from 'wouter';

/**
 * A simple and consistent navigation bar for the application
 */
export function SimpleNav() {
  const [location] = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: <Home size={20} /> },
    { name: 'Goals', href: '/goal-visualizations', icon: <Target size={20} /> },
    { name: 'Tasks', href: '/task-board', icon: <CheckSquare size={20} /> },
    // The task-board route exists in App.tsx, so this will work
  ];

  return (
    <div className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10">
      <div className="container flex items-center justify-between h-14">
        <div className="flex items-center gap-2 font-semibold">
          <Target className="h-5 w-5 text-primary" />
          <span>2025 Goals</span>
        </div>
        
        <nav className="flex items-center space-x-1">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className={`px-3 py-2 rounded-md text-sm flex items-center gap-1.5 ${
                location === item.href
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {item.icon}
              <span className="hidden sm:inline">{item.name}</span>
            </a>
          ))}
          
          <a 
            href="/add-goal" 
            className="ml-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm flex items-center gap-1.5 hover:bg-primary/90"
          >
            <span>+</span>
            <span className="hidden sm:inline">Add Goal</span>
          </a>
        </nav>
      </div>
    </div>
  );
}