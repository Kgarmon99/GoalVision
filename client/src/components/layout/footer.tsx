import { format } from "date-fns";
import { useIsMobile } from "@/hooks/use-mobile";
import { Home, BarChart3, PlusCircle, ListTodo } from "lucide-react";
import { Link } from "wouter";

const Footer = () => {
  const currentDate = format(new Date(), "MMMM d, yyyy");
  const isMobile = useIsMobile();
  
  return (
    <>
      {/* Standard Footer for desktop */}
      <footer className="bg-black border-t border-green-600 hidden sm:block">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="text-sm text-green-400">
              &copy; 2024 Goals Tracking System
            </div>
            <div className="text-sm text-green-400">
              Last updated: {currentDate}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Navigation Bar */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-green-600 z-10 sm:hidden">
          <div className="grid grid-cols-4 h-14">
            <Link href="/">
              <button className="flex flex-col items-center justify-center h-full w-full text-green-400">
                <Home className="h-5 w-5" />
                <span className="text-xs mt-1">Home</span>
              </button>
            </Link>
            <Link href="/add-goal">
              <button className="flex flex-col items-center justify-center h-full w-full text-green-400">
                <BarChart3 className="h-5 w-5" />
                <span className="text-xs mt-1">Goals</span>
              </button>
            </Link>
            <Link href="/add-progress">
              <button className="flex flex-col items-center justify-center h-full w-full text-green-400">
                <PlusCircle className="h-5 w-5" />
                <span className="text-xs mt-1">Progress</span>
              </button>
            </Link>
            <Link href="/add-task">
              <button className="flex flex-col items-center justify-center h-full w-full text-green-400">
                <ListTodo className="h-5 w-5" />
                <span className="text-xs mt-1">Tasks</span>
              </button>
            </Link>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
