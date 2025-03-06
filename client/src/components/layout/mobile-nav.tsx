import { useState } from "react";
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Target, 
  BarChart, 
  TrendingUp, 
  ListChecks,
  Kanban,
  Plus,
  User
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user-avatar";

const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const closeMenu = () => setOpen(false);

  return (
    <div className="flex items-center mr-2">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setOpen(!open)}
        className="text-green-400 hover:text-green-300 hover:bg-gray-900"
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {open && (
        <div className="fixed inset-0 top-16 bg-black/90 z-20">
          <div className="bg-gray-950 border-b border-green-600 p-4 shadow-lg">
            <nav className="flex flex-col space-y-2 max-w-md mx-auto">
              <Link href="/" onClick={closeMenu}>
                <div className={`flex items-center p-3 rounded-md ${
                  location === '/' ? 'bg-green-900/30 text-green-400' : 'text-white hover:bg-gray-900/50'
                }`}>
                  <LayoutDashboard className="h-5 w-5 mr-3" />
                  <span className="font-medium">Dashboard</span>
                </div>
              </Link>
              
              <Link href="/task-board" onClick={closeMenu}>
                <div className={`flex items-center p-3 rounded-md ${
                  location === '/task-board' ? 'bg-green-900/30 text-green-400' : 'text-white hover:bg-gray-900/50'
                }`}>
                  <Kanban className="h-5 w-5 mr-3" />
                  <span className="font-medium">Task Board</span>
                </div>
              </Link>

              <div className="h-px bg-green-800/50 my-2"></div>
              
              <Link href="/add-goal" onClick={closeMenu}>
                <div className="flex items-center p-3 rounded-md text-white hover:bg-gray-900/50">
                  <Target className="h-5 w-5 mr-3 text-green-400" />
                  <span className="font-medium">Add Goal</span>
                </div>
              </Link>
              
              <Link href="/add-task" onClick={closeMenu}>
                <div className="flex items-center p-3 rounded-md text-white hover:bg-gray-900/50">
                  <ListChecks className="h-5 w-5 mr-3 text-green-400" />
                  <span className="font-medium">Add Task</span>
                </div>
              </Link>
              
              <Link href="/add-progress" onClick={closeMenu}>
                <div className="flex items-center p-3 rounded-md text-white hover:bg-gray-900/50">
                  <TrendingUp className="h-5 w-5 mr-3 text-green-400" />
                  <span className="font-medium">Update Progress</span>
                </div>
              </Link>
              
              <div className="h-px bg-green-800/50 my-2"></div>
              
              <Link href="/profile" onClick={closeMenu}>
                <div className="flex items-center p-3 rounded-md text-white hover:bg-gray-900/50">
                  <User className="h-5 w-5 mr-3 text-green-400" />
                  <span className="font-medium">Profile</span>
                </div>
              </Link>
              
              <div className="h-px bg-green-800/50 my-2"></div>
              
              <div className="flex items-center justify-between p-3 rounded-md bg-gray-900/30">
                <div className="flex items-center">
                  <UserAvatar size="md" showStatus={true} />
                  <div className="ml-3">
                    <div className="font-medium text-white">Kahlil Garmon</div>
                    <div className="text-sm text-green-400">Goal Master</div>
                  </div>
                </div>
              </div>
              
              <Button
                variant="default"
                className="w-full mt-4 bg-green-600 hover:bg-green-700"
                onClick={closeMenu}
                asChild
              >
                <Link href="/add-task">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Task
                </Link>
              </Button>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileNav;