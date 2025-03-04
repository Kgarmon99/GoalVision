import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ExecutionTask, Week } from "@shared/schema";

interface WeeklyExecutionTrackerProps {
  tasks: ExecutionTask[];
  week: Week;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}

const WeeklyExecutionTracker = ({ 
  tasks, 
  week, 
  onPreviousWeek, 
  onNextWeek 
}: WeeklyExecutionTrackerProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;
  
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTasks = tasks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tasks.length / itemsPerPage);
  
  // Function to get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "done":
        return (
          <Badge variant="outline" className="bg-green-900 text-green-400 border-green-500 hover:bg-green-800">
            ✅ Done
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-yellow-900 text-yellow-400 border-yellow-500 hover:bg-yellow-800">
            🔄 In Progress
          </Badge>
        );
      case "missed":
        return (
          <Badge variant="outline" className="bg-red-900 text-red-400 border-red-500 hover:bg-red-800">
            ❌ Missed
          </Badge>
        );
      default:
        return <Badge className="bg-gray-800 text-gray-300 border-gray-600">{status}</Badge>;
    }
  };
  
  // Function to get category badge styling
  const getCategoryBadge = (category: string, color: string | null) => {
    const colorMap: Record<string, string> = {
      "blue": "bg-blue-900 text-blue-400 border-blue-500",
      "indigo": "bg-indigo-900 text-indigo-400 border-indigo-500",
      "purple": "bg-purple-900 text-purple-400 border-purple-500",
      "green": "bg-green-900 text-green-400 border-green-500",
      "red": "bg-red-900 text-red-400 border-red-500",
      "yellow": "bg-yellow-900 text-yellow-400 border-yellow-500"
    };
    
    const badgeColor = color ? (colorMap[color] || "bg-gray-800 text-gray-300 border-gray-600") : "bg-green-900 text-green-400 border-green-500";
    
    return (
      <Badge variant="outline" className={badgeColor}>
        {category}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
        <h2 className="text-lg font-semibold text-green-400">Weekly Execution Tracker</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onPreviousWeek} 
            className="border-green-500 text-green-400 bg-gray-900 hover:bg-gray-800">
            <ChevronLeft className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Previous Week</span>
          </Button>
          <Button variant="outline" size="sm" onClick={onNextWeek}
            className="border-green-500 text-green-400 bg-gray-900 hover:bg-gray-800">
            <span className="hidden sm:inline">Next Week</span>
            <ChevronRight className="h-4 w-4 sm:ml-1" />
          </Button>
        </div>
      </div>
      
      <Card className="bg-gray-900 border border-green-600">
        <CardHeader className="border-b border-green-600 bg-gray-800 px-2 sm:px-4 py-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            <div>
              <CardTitle className="text-base font-medium text-green-400">
                Week {week.number} ({week.dateRange})
              </CardTitle>
              <p className="text-sm text-green-400 mt-1">Completion Rate: {week.completionRate}%</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-green-500 text-green-400 bg-gray-900 hover:bg-gray-800 hidden sm:flex">
                Export Report
              </Button>
              <Button size="sm" asChild className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                <Link href="/add-task">
                  <span className="hidden sm:inline">Add Task</span>
                  <span className="sm:hidden">Add New Task</span>
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {/* Desktop Table View */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader className="bg-gray-800">
                <TableRow className="border-b border-green-600">
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase">
                    Task
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase">
                    Owner
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase">
                    Goal Category
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase">
                    Due Date
                  </TableHead>
                  <TableHead className="px-6 py-3 text-left text-xs font-medium text-green-400 uppercase">
                    Status
                  </TableHead>
                  <TableHead className="px-6 py-3 text-right text-xs font-medium text-green-400 uppercase">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-800">
                {currentTasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-gray-800">
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                      {task.task}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      <div className="flex items-center">
                        {task.ownerAvatar ? (
                          <img 
                            className="h-6 w-6 rounded-full mr-2 border border-green-500" 
                            src={task.ownerAvatar} 
                            alt={task.owner} 
                          />
                        ) : task.owner === "Kahlil Garmon" ? (
                          <img 
                            className="h-6 w-6 rounded-full mr-2 border border-green-500" 
                            src="/images/profiles/kahlil-avatar.svg" 
                            alt={task.owner} 
                          />
                        ) : (
                          <div className="h-6 w-6 rounded-full bg-green-900 mr-2 flex items-center justify-center text-xs font-medium text-white border border-green-500">
                            {task.owner && task.owner.charAt(0) || "U"}
                          </div>
                        )}
                        <span>{task.owner}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {getCategoryBadge(task.goalCategory, task.categoryColor)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {task.dueDate}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="link" asChild className="text-green-400 hover:text-green-300">
                        <Link href={`/tasks/${task.id}`}>
                          View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="sm:hidden">
            <div className="divide-y divide-gray-800">
              {currentTasks.map((task) => (
                <div key={task.id} className="p-3 hover:bg-gray-800">
                  <div className="flex justify-between items-start mb-2">
                    <div className="text-sm font-medium text-white">{task.task}</div>
                    {getStatusBadge(task.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-3">
                    <div className="flex items-center text-xs text-gray-300">
                      <span className="text-green-400 mr-1">Owner:</span>
                      <div className="flex items-center">
                        {task.ownerAvatar ? (
                          <img 
                            className="h-4 w-4 rounded-full mr-1 border border-green-500" 
                            src={task.ownerAvatar} 
                            alt={task.owner} 
                          />
                        ) : task.owner === "Kahlil Garmon" ? (
                          <img 
                            className="h-4 w-4 rounded-full mr-1 border border-green-500" 
                            src="/images/profiles/kahlil-avatar.svg" 
                            alt={task.owner} 
                          />
                        ) : (
                          <div className="h-4 w-4 rounded-full bg-green-900 mr-1 flex items-center justify-center text-xs font-medium text-white border border-green-500">
                            {task.owner && task.owner.charAt(0) || "U"}
                          </div>
                        )}
                        <span>{task.owner}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-300">
                      <span className="text-green-400 mr-1">Due:</span>
                      {task.dueDate}
                    </div>
                    
                    <div className="col-span-2 flex items-center text-xs text-gray-300 mt-1">
                      <span className="text-green-400 mr-1">Category:</span>
                      {getCategoryBadge(task.goalCategory, task.categoryColor)}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button variant="link" asChild className="text-green-400 hover:text-green-300 p-0 h-6">
                      <Link href={`/tasks/${task.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="border-t border-green-600 bg-gray-800 px-3 sm:px-4 py-3">
          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs sm:text-sm text-green-400 order-2 sm:order-1">
              <span className="hidden sm:inline">
                Showing <span className="font-medium text-white">{indexOfFirstItem + 1}</span> to{" "}
                <span className="font-medium text-white">
                  {indexOfLastItem > tasks.length ? tasks.length : indexOfLastItem}
                </span>{" "}
                of{" "}
              </span>
              <span className="sm:hidden">Page {currentPage} of {totalPages} • </span>
              <span className="font-medium text-white">{tasks.length}</span> tasks
            </p>
            
            <Pagination className="order-1 sm:order-2">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {/* Hide page numbers on mobile, just show current/total in text */}
                <div className="hidden sm:flex">
                  {[...Array(totalPages)].map((_, idx) => (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        onClick={() => setCurrentPage(idx + 1)}
                        isActive={currentPage === idx + 1}
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                </div>
                
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WeeklyExecutionTracker;
