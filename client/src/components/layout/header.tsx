
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
            {isMobile && <MobileNav />}
            <div className="flex-shrink-0 flex items-center">
              <CalendarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-white hidden sm:inline">2025 Goals Tracker</span>
              <span className="ml-2 text-lg font-bold text-white sm:hidden">Goals</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
