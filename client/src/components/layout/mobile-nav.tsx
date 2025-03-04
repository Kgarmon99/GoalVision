import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const MobileNav = () => {
  const [open, setOpen] = useState(false);

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
        <div className="absolute top-16 left-0 right-0 bg-gray-950 border-b border-green-600 p-4 shadow-lg z-20">
          <nav className="flex flex-col space-y-3">
            <Link href="/">
              <a className="text-green-400 hover:text-green-300 py-2 border-b border-green-800">Home</a>
            </Link>
            <Link href="/add-goal">
              <a className="text-green-400 hover:text-green-300 py-2 border-b border-green-800">Goals</a>
            </Link>
            <Link href="/add-metric">
              <a className="text-green-400 hover:text-green-300 py-2 border-b border-green-800">Metrics</a>
            </Link>
            <Link href="/add-progress">
              <a className="text-green-400 hover:text-green-300 py-2 border-b border-green-800">Progress</a>
            </Link>
            <Link href="/add-task">
              <a className="text-green-400 hover:text-green-300 py-2">Tasks</a>
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MobileNav;