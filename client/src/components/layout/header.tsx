import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CalendarIcon, BellIcon } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <CalendarIcon className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">2025 Goals Tracker</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              <Button asChild className="bg-primary hover:bg-blue-600 text-white">
                <Link href="/add-progress">
                  Add Progress Update
                </Link>
              </Button>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              <button className="p-1 rounded-full text-gray-500 hover:text-gray-600 focus:outline-none">
                <BellIcon className="h-6 w-6" />
              </button>
              <div className="ml-3 relative">
                <div>
                  <button type="button" className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none">
                    <img 
                      className="h-8 w-8 rounded-full" 
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                      alt="User profile" 
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
