import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Goal } from "@shared/schema";
import { Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface GoalProgressCardProps {
  goal: Goal;
}

export function GoalProgressCard({ goal }: GoalProgressCardProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Calculate percentage complete
  const percentComplete = Math.round((goal.current / goal.target) * 100);
  
  // Format values with units
  const formatValue = (value: number, unit: string | null) => {
    if (unit === "M") {
      return `$${value}M`;
    } else if (unit === "K") {
      return `$${value}K`;
    } else {
      return value.toLocaleString();
    }
  };
  
  // Delete goal mutation
  const deleteGoalMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/goals/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/goal-statuses'] });
      
      toast({
        title: "Goal deleted",
        description: "Goal has been deleted successfully.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting goal",
        description: error instanceof Error ? error.message : "There was a problem deleting the goal.",
        variant: "destructive",
      });
    }
  });
  
  const handleDeleteGoal = async () => {
    setIsDeleting(true);
    try {
      await deleteGoalMutation.mutateAsync(goal.id);
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <Card className="bg-gray-900 border border-green-600">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-green-400">{goal.name}</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {formatValue(goal.current, goal.unit)}
            </p>
            <p className="text-sm text-green-400">
              of {formatValue(goal.target, goal.unit)} target
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-400 border border-green-500 mb-2">
              {percentComplete}% complete
            </span>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 text-red-400 hover:text-red-500 hover:bg-gray-800">
                  <Trash2Icon className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border border-green-600 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-white">Delete Goal</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    Are you sure you want to delete the goal "{goal.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-800 text-white border-green-600 hover:bg-gray-700">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteGoal} 
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={percentComplete} className="h-2.5 bg-gray-800" />
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-green-400">0%</span>
            <span className="text-green-400">100%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
