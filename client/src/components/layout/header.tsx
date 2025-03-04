import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { CalendarIcon, BellIcon, PlusCircle } from "lucide-react";
import MobileNav from "./mobile-nav";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const isMobile = useIsMobile();

  return (
    <header className="bg-black border-b border-green-600 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {isMobile ? (
              <MobileNav />
            ) : null}
            <div className="flex-shrink-0 flex items-center">
              <CalendarIcon className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-white hidden sm:inline">2025 Goals Tracker</span>
              <span className="ml-2 text-lg font-bold text-white sm:hidden">Goals</span>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex-shrink-0 relative">
              <Button 
                asChild 
                className="bg-primary hover:bg-green-700 text-white hidden sm:flex"
                size={isMobile ? "sm" : "default"}
              >
                <Link href="/add-progress">
                  Add Progress Update
                </Link>
              </Button>
              <Button 
                asChild 
                className="bg-primary hover:bg-green-700 text-white sm:hidden"
                size="icon"
              >
                <Link href="/add-progress">
                  <PlusCircle className="h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="ml-3 sm:ml-4 flex items-center">
              <button className="p-1 rounded-full text-green-500 hover:text-green-400 focus:outline-none">
                <BellIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <div className="ml-2 sm:ml-3 relative">
                <div>
                  <button type="button" className="max-w-xs bg-black flex items-center text-sm rounded-full focus:outline-none">
                    <img 
                      className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-green-500" 
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