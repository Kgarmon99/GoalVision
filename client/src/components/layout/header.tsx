
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  CalendarIcon, 
  BellIcon, 
  PlusCircle, 
  Kanban, 
  LayoutDashboard,
  Target,
  TrendingUp,
  Flame,
  GamepadIcon,
  Trophy 
} from "lucide-react";
import MobileNav from "./mobile-nav";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();
  const [location] = useLocation();

  return (
    <header className="bg-black border-b border-green-600 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {isMobile && <MobileNav />}
            <Link href="/">
              <div className="flex-shrink-0 flex items-center cursor-pointer">
                <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <span className="ml-2 text-xl font-bold text-white hidden sm:inline">2025 Goals Tracker</span>
                <span className="ml-2 text-lg font-bold text-white sm:hidden">Goals</span>
              </div>
            </Link>
            
            {/* Navigation Links - Only show on desktop */}
            <nav className="hidden md:ml-8 md:flex md:space-x-2">
              <Link href="/">
                <Button 
                  variant="ghost" 
                  className={`text-sm ${location === '/' ? 'text-green-400 bg-green-900/30' : 'text-gray-300 hover:text-white hover:bg-gray-900'}`}
                >
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/task-board">
                <Button 
                  variant="ghost" 
                  className={`text-sm ${location === '/task-board' ? 'text-green-400 bg-green-900/30' : 'text-gray-300 hover:text-white hover:bg-gray-900'}`}
                >
                  <Kanban className="h-4 w-4 mr-1" />
                  Task Board
                </Button>
              </Link>
              <Link href="/habit-tracker">
                <Button 
                  variant="ghost" 
                  className={`text-sm ${location === '/habit-tracker' ? 'text-green-400 bg-green-900/30' : 'text-gray-300 hover:text-white hover:bg-gray-900'}`}
                >
                  <Flame className="h-4 w-4 mr-1" />
                  Habit Streaks
                </Button>
              </Link>
              <Link href="/game">
                <Button 
                  variant="ghost" 
                  className={`text-sm ${location === '/game' ? 'text-purple-400 bg-purple-900/30' : 'text-gray-300 hover:text-white hover:bg-gray-900'}`}
                >
                  <GamepadIcon className="h-4 w-4 mr-1" />
                  Game Mode
                </Button>
              </Link>
            </nav>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 relative">
              <Button 
                asChild 
                className="bg-primary hover:bg-green-700 text-white hidden sm:flex"
                size={isMobile ? "sm" : "default"}
              >
                <Link href="/add-task">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Task
                </Link>
              </Button>
              <Button 
                asChild 
                className="bg-primary hover:bg-green-700 text-white sm:hidden"
                size="icon"
              >
                <Link href="/add-task">
                  <PlusCircle className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            
            <Link href="/add-progress">
              <Button 
                variant="outline" 
                className="border-green-500 text-green-400 hover:bg-gray-900 hover:text-green-300 hidden sm:flex"
                size={isMobile ? "sm" : "default"}
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                Update Progress
              </Button>
            </Link>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-green-400 hover:text-green-300 hover:bg-gray-900"
            >
              <BellIcon className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
