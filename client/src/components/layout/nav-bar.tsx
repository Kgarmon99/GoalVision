import React from 'react';
import { Home, Target, CheckSquare, Plus } from 'lucide-react';

// Navigation items with icon and path
const navItems = [
  { name: 'Dashboard', path: '/', icon: <Home size={20} /> },
  { name: 'Goals', path: '/goal-visualizations', icon: <Target size={20} /> },
  { name: 'Tasks', path: '/task-board', icon: <CheckSquare size={20} /> },
];

/**
 * A simple nav bar with direct navigation links
 */
export function NavBar() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border z-10">
      <div className="container flex items-center justify-between h-16">
        <a 
          href="/" 
          className="flex items-center gap-2 font-semibold text-glow-medium"
        >
          <Target className="h-5 w-5 text-primary drop-shadow-glow" />
          <span>Goals</span>
        </a>
        
        <nav className="flex items-center space-x-2">
          {navItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className={`px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors duration-200 
                ${location.pathname === item.path 
                  ? 'bg-primary/10 text-primary text-glow-soft glow-soft' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted hover:text-glow-soft'
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
                ? 'bg-primary/90 text-primary-foreground glow-medium'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 button-glow'
              }`}
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Add Goal</span>
          </a>
        </nav>
      </div>
    </header>
  );
}