import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { 
  CalendarIcon, 
  Menu, 
  Home, 
  BarChart3, 
  PlusCircle, 
  ListTodo,
  Settings
} from "lucide-react";

const MobileNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="lg:hidden text-green-500">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="border-r border-green-600 bg-black w-72">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-left flex items-center text-white">
            <CalendarIcon className="h-6 w-6 text-primary mr-2" />
            <span>2025 Goals Tracker</span>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4">
          <Link href="/">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-green-900 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <Home className="mr-2 h-5 w-5 text-green-500" />
              Dashboard
            </Button>
          </Link>
          <Link href="/add-goal">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-green-900 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <BarChart3 className="mr-2 h-5 w-5 text-green-500" />
              Add Goal
            </Button>
          </Link>
          <Link href="/add-progress">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-green-900 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <PlusCircle className="mr-2 h-5 w-5 text-green-500" />
              Add Progress
            </Button>
          </Link>
          <Link href="/add-task">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-white hover:bg-green-900 hover:text-white"
              onClick={() => setOpen(false)}
            >
              <ListTodo className="mr-2 h-5 w-5 text-green-500" />
              Add Task
            </Button>
          </Link>
        </nav>
        <div className="absolute bottom-4 left-4 right-4">
          <Button 
            variant="outline" 
            className="w-full border-green-600 text-green-400 hover:bg-green-900 hover:text-white"
            onClick={() => setOpen(false)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;