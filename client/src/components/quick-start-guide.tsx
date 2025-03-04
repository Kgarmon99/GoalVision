import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Goal, Metric, GoalStatus, ExecutionTask, Week } from "@shared/schema";
import { 
  Check, 
  ChevronDown, 
  ChevronUp, 
  PlusCircle, 
  BarChart4, 
  Calendar, 
  RefreshCcw
} from "lucide-react";

type QuickFormState = {
  goalName: string;
  goalCurrent: string;
  goalTarget: string;
  goalUnit: string;
  weekNumber: string;
  weekDateRange: string;
};

export function QuickStartGuide() {
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [createdGoalId, setCreatedGoalId] = useState<number | null>(null);
  const [createdWeekId, setCreatedWeekId] = useState<number | null>(null);

  const [formState, setFormState] = useState<QuickFormState>({
    goalName: "",
    goalCurrent: "",
    goalTarget: "",
    goalUnit: "",
    weekNumber: "1",
    weekDateRange: `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${new Date().getFullYear()}`
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleAddGoal = async () => {
    setIsSubmitting(true);
    
    try {
      // Convert string numbers to numeric values
      const goalCurrent = parseFloat(formState.goalCurrent);
      const goalTarget = parseFloat(formState.goalTarget);
      
      // Validate inputs
      if (isNaN(goalCurrent) || isNaN(goalTarget)) {
        throw new Error("Current and target values must be numbers");
      }
      
      if (!formState.goalName || !formState.goalUnit) {
        throw new Error("All fields are required");
      }
      
      // Create the goal
      const response = await apiRequest<Goal>("/api/goals", {
        method: "POST",
        body: JSON.stringify({
          name: formState.goalName,
          current: goalCurrent,
          target: goalTarget,
          unit: formState.goalUnit,
          color: "green" // Default color
        }),
      });
      
      // Store the created goal ID
      setCreatedGoalId(response.id);
      
      // Add a goal status
      await apiRequest<GoalStatus>("/api/goal-statuses", {
        method: "POST",
        body: JSON.stringify({
          goalId: response.id,
          goalName: formState.goalName,
          status: "on-track"
        }),
      });
      
      // Success!
      toast({
        title: "Goal Created",
        description: `Successfully created goal: ${formState.goalName}`,
      });
      
      // Move to next step
      setActiveStep(2);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/goal-statuses'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create goal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddWeek = async () => {
    setIsSubmitting(true);
    
    try {
      // Validate inputs
      const weekNumber = parseInt(formState.weekNumber);
      
      if (isNaN(weekNumber)) {
        throw new Error("Week number must be numeric");
      }
      
      if (!formState.weekDateRange) {
        throw new Error("Date range is required");
      }
      
      // Create the week
      const response = await apiRequest("/api/weeks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: weekNumber,
          dateRange: formState.weekDateRange,
          completionRate: 0
        }),
      });
      
      // Store the created week ID
      setCreatedWeekId(response.id);
      
      // Success!
      toast({
        title: "Week Created",
        description: `Successfully created week ${weekNumber}`,
      });
      
      // Move to next step
      setActiveStep(3);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/weeks'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create week",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddMetric = async () => {
    setIsSubmitting(true);
    
    try {
      // Add example metrics tied to the goal
      await apiRequest("/api/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formState.goalName} Growth Rate`,
          value: "12%",
          previousValue: "8%",
          trend: 4.0,
          trendDirection: "up",
          category: "growth"
        }),
      });
      
      await apiRequest("/api/metrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: `${formState.goalName} Revenue`,
          value: "$125K",
          previousValue: "$100K",
          trend: 25.0,
          trendDirection: "up",
          category: "revenue"
        }),
      });
      
      // Success!
      toast({
        title: "Metrics Created",
        description: "Successfully created example metrics",
      });
      
      // Move to next step
      setActiveStep(4);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/category/growth'] });
      queryClient.invalidateQueries({ queryKey: ['/api/metrics/category/revenue'] });
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create metrics",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTask = async () => {
    setIsSubmitting(true);
    
    try {
      if (!createdWeekId) {
        throw new Error("Week ID is missing");
      }
      
      // Add an example task for the created week
      await apiRequest("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: `Work on ${formState.goalName} improvements`,
          owner: "You",
          ownerAvatar: null,
          goalCategory: formState.goalName,
          categoryColor: "green",
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
          status: "pending",
          weekId: createdWeekId
        }),
      });
      
      // Success!
      toast({
        title: "Task Created",
        description: "Successfully created an example task",
      });
      
      // Final step complete
      setActiveStep(5);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/week'] });
      
      // Reload the page after a short delay to show all new data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkipAll = () => {
    setIsExpanded(false);
  };

  const handleResetAllSteps = () => {
    setActiveStep(1);
    setCreatedGoalId(null);
    setCreatedWeekId(null);
    setFormState({
      goalName: "",
      goalCurrent: "",
      goalTarget: "",
      goalUnit: "",
      weekNumber: "1",
      weekDateRange: `${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}, ${new Date().getFullYear()}`
    });
  };

  if (!isExpanded) {
    return (
      <Card className="w-full mb-6 bg-gray-950 border border-green-800 text-white shadow-lg">
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(true)}>
          <div className="flex justify-between items-center">
            <CardTitle className="text-green-400">Quick Start Guide</CardTitle>
            <ChevronDown className="h-5 w-5 text-green-400" />
          </div>
          <CardDescription className="text-gray-400">
            Expand to quickly add your first goal, metrics, and tasks
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full mb-6 bg-gray-950 border border-green-800 text-white shadow-lg">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(false)}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-green-400">Quick Start Guide</CardTitle>
          <ChevronUp className="h-5 w-5 text-green-400" />
        </div>
        <CardDescription className="text-gray-400">
          Follow these steps to quickly set up your 2025 Goals Dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Step 1: Add Goal */}
          <div className={`border ${activeStep === 1 ? 'border-green-600' : 'border-gray-800'} rounded-md p-4`}>
            <div className="flex items-center mb-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${activeStep >= 1 ? 'bg-green-600' : 'bg-gray-800'}`}>
                {activeStep > 1 ? <Check className="h-5 w-5" /> : <BarChart4 className="h-5 w-5" />}
              </div>
              <h3 className="text-lg font-medium">Step 1: Add Your First Goal</h3>
            </div>
            
            {activeStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalName">Goal Name</Label>
                    <Input 
                      id="goalName" 
                      name="goalName"
                      value={formState.goalName}
                      onChange={handleChange}
                      placeholder="Revenue Growth"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goalUnit">Unit</Label>
                    <Input 
                      id="goalUnit" 
                      name="goalUnit"
                      value={formState.goalUnit}
                      onChange={handleChange}
                      placeholder="M (million), K, %, etc."
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goalCurrent">Current Value</Label>
                    <Input 
                      id="goalCurrent" 
                      name="goalCurrent"
                      value={formState.goalCurrent}
                      onChange={handleChange}
                      placeholder="2.5"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="goalTarget">Target Value</Label>
                    <Input 
                      id="goalTarget" 
                      name="goalTarget"
                      value={formState.goalTarget}
                      onChange={handleChange}
                      placeholder="10"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={handleSkipAll}>
                    Skip All
                  </Button>
                  <Button 
                    onClick={handleAddGoal}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                    Add Goal
                  </Button>
                </div>
              </div>
            )}
            
            {activeStep > 1 && (
              <div className="text-sm text-gray-400">
                Added goal: <span className="text-green-400">{formState.goalName}</span>
              </div>
            )}
          </div>
          
          {/* Step 2: Add Week */}
          <div className={`border ${activeStep === 2 ? 'border-green-600' : 'border-gray-800'} rounded-md p-4`}>
            <div className="flex items-center mb-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${activeStep >= 2 ? 'bg-green-600' : 'bg-gray-800'}`}>
                {activeStep > 2 ? <Check className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
              </div>
              <h3 className="text-lg font-medium">Step 2: Add Weekly Planning</h3>
            </div>
            
            {activeStep === 2 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weekNumber">Week Number</Label>
                    <Input 
                      id="weekNumber" 
                      name="weekNumber"
                      value={formState.weekNumber}
                      onChange={handleChange}
                      placeholder="1"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weekDateRange">Date Range</Label>
                    <Input 
                      id="weekDateRange" 
                      name="weekDateRange"
                      value={formState.weekDateRange}
                      onChange={handleChange}
                      placeholder="June 10 - 16, 2024"
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setActiveStep(3)}>
                    Skip
                  </Button>
                  <Button 
                    onClick={handleAddWeek}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                    Add Week
                  </Button>
                </div>
              </div>
            )}
            
            {activeStep > 2 && (
              <div className="text-sm text-gray-400">
                Added week: <span className="text-green-400">Week {formState.weekNumber} ({formState.weekDateRange})</span>
              </div>
            )}
          </div>
          
          {/* Step 3: Add Metrics */}
          <div className={`border ${activeStep === 3 ? 'border-green-600' : 'border-gray-800'} rounded-md p-4`}>
            <div className="flex items-center mb-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${activeStep >= 3 ? 'bg-green-600' : 'bg-gray-800'}`}>
                {activeStep > 3 ? <Check className="h-5 w-5" /> : <BarChart4 className="h-5 w-5" />}
              </div>
              <h3 className="text-lg font-medium">Step 3: Add Example Metrics</h3>
            </div>
            
            {activeStep === 3 && (
              <div className="space-y-4">
                <p className="text-gray-400">
                  Add example metrics related to {formState.goalName || "your goal"}. These will be automatically created in both Growth and Revenue categories.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setActiveStep(4)}>
                    Skip
                  </Button>
                  <Button 
                    onClick={handleAddMetric}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                    Add Example Metrics
                  </Button>
                </div>
              </div>
            )}
            
            {activeStep > 3 && (
              <div className="text-sm text-gray-400">
                Added metrics: <span className="text-green-400">{formState.goalName} Growth Rate, {formState.goalName} Revenue</span>
              </div>
            )}
          </div>
          
          {/* Step 4: Add Task */}
          <div className={`border ${activeStep === 4 ? 'border-green-600' : 'border-gray-800'} rounded-md p-4`}>
            <div className="flex items-center mb-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full mr-3 ${activeStep >= 4 ? 'bg-green-600' : 'bg-gray-800'}`}>
                {activeStep > 4 ? <Check className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
              </div>
              <h3 className="text-lg font-medium">Step 4: Add Example Task</h3>
            </div>
            
            {activeStep === 4 && (
              <div className="space-y-4">
                <p className="text-gray-400">
                  Add an example task for Week {formState.weekNumber}. This task will be automatically assigned to the {formState.goalName || "your goal"} category.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => {
                    setActiveStep(5);
                    // Reload the page after a short delay
                    setTimeout(() => {
                      window.location.reload();
                    }, 1000);
                  }}>
                    Skip & Finish
                  </Button>
                  <Button 
                    onClick={handleAddTask}
                    disabled={isSubmitting}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? <RefreshCcw className="h-4 w-4 mr-2 animate-spin" /> : <PlusCircle className="h-4 w-4 mr-2" />}
                    Add Example Task
                  </Button>
                </div>
              </div>
            )}
            
            {activeStep > 4 && (
              <div className="text-sm text-gray-400">
                Added task: <span className="text-green-400">Work on {formState.goalName} improvements</span>
              </div>
            )}
          </div>
          
          {/* Success */}
          {activeStep === 5 && (
            <div className="border border-green-600 rounded-md p-4 bg-green-900/20">
              <div className="flex items-center mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 mr-3">
                  <Check className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-medium text-green-400">Setup Complete!</h3>
              </div>
              
              <p className="text-gray-300 mb-4">
                Your dashboard has been set up with your first goal, metrics, and tasks.
                The page will refresh automatically to show your data.
              </p>
              
              <div className="flex justify-end">
                <Button onClick={handleResetAllSteps} variant="outline">
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-gray-800 pt-4">
        <div className="text-sm text-gray-400">
          {activeStep < 5 ? `Step ${activeStep} of 4` : "Complete"}
        </div>
        <Button variant="ghost" onClick={() => setIsExpanded(false)}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}