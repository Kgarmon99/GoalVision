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
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            ✅ Done
          </Badge>
        );
      case "in-progress":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            🔄 In Progress
          </Badge>
        );
      case "missed":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            ❌ Missed
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Function to get category badge styling
  const getCategoryBadge = (category: string, color: string) => {
    const colorMap: Record<string, string> = {
      "blue": "bg-blue-100 text-blue-800",
      "indigo": "bg-indigo-100 text-indigo-800",
      "purple": "bg-purple-100 text-purple-800",
      "green": "bg-green-100 text-green-800",
      "red": "bg-red-100 text-red-800",
      "yellow": "bg-yellow-100 text-yellow-800"
    };
    
    const badgeColor = colorMap[color] || "bg-gray-100 text-gray-800";
    
    return (
      <Badge variant="outline" className={badgeColor}>
        {category}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Weekly Execution Tracker</h2>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={onPreviousWeek}>
            Previous Week
          </Button>
          <Button variant="outline" size="sm" onClick={onNextWeek}>
            Next Week
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="border-b bg-gray-50 px-4 py-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-medium text-gray-900">
                Week {week.number} ({week.dateRange})
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Completion Rate: {week.completionRate}%</p>
            </div>
            <div className="flex items-center">
              <Button variant="outline" size="sm" className="mr-2">
                Export Report
              </Button>
              <Button size="sm" asChild>
                <Link href="/add-task">Add Task</Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Task
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Owner
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Goal Category
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </TableHead>
                <TableHead className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </TableHead>
                <TableHead className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-200">
              {currentTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.task}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <img 
                        className="h-6 w-6 rounded-full mr-2" 
                        src={task.ownerAvatar} 
                        alt={task.owner} 
                      />
                      <span>{task.owner}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getCategoryBadge(task.goalCategory, task.categoryColor)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.dueDate}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(task.status)}
                  </TableCell>
                  <TableCell className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button variant="link" asChild>
                      <Link href={`/tasks/${task.id}`}>
                        View
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        
        <CardFooter className="border-t bg-gray-50 px-4 py-3">
          <div className="w-full flex items-center justify-between">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{" "}
              <span className="font-medium">
                {indexOfLastItem > tasks.length ? tasks.length : indexOfLastItem}
              </span>{" "}
              of <span className="font-medium">{tasks.length}</span> tasks
            </p>
            
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
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
