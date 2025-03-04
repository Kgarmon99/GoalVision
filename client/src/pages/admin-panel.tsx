
import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { queryClient } from "@/lib/query";
import { apiRequest } from "@/lib/api";
import { 
  Goal, 
  Metric, 
  GoalStatus, 
  ExecutionTask, 
  Week,
  InsertGoal, 
  InsertMetric, 
  InsertGoalStatus, 
  InsertExecutionTask, 
  InsertWeek 
} from "@shared/schema";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("goals");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [editType, setEditType] = useState<string>("");

  // Fetch data
  const { data: goals = [] } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  const { data: metrics = [] } = useQuery<Metric[]>({
    queryKey: ['/api/metrics'],
  });
  
  const { data: goalStatuses = [] } = useQuery<GoalStatus[]>({
    queryKey: ['/api/goal-statuses'],
  });
  
  const { data: tasks = [] } = useQuery<ExecutionTask[]>({
    queryKey: ['/api/tasks'],
  });
  
  const { data: weeks = [] } = useQuery<Week[]>({
    queryKey: ['/api/weeks'],
  });

  // Mutations
  const updateGoalMutation = useMutation({
    mutationFn: async (data: Partial<InsertGoal> & { id: number }) => {
      const { id, ...rest } = data;
      return apiRequest("PATCH", `/api/goals/${id}`, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({ title: "Goal updated successfully" });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error updating goal", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  });

  const updateMetricMutation = useMutation({
    mutationFn: async (data: Partial<InsertMetric> & { id: number }) => {
      const { id, ...rest } = data;
      return apiRequest("PATCH", `/api/metrics/${id}`, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({ title: "Metric updated successfully" });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error updating metric", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  });

  const updateGoalStatusMutation = useMutation({
    mutationFn: async (data: Partial<InsertGoalStatus> & { id: number }) => {
      const { id, ...rest } = data;
      return apiRequest("PATCH", `/api/goal-statuses/${id}`, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goal-statuses'] });
      toast({ title: "Goal status updated successfully" });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error updating goal status", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<InsertExecutionTask> & { id: number }) => {
      const { id, ...rest } = data;
      return apiRequest("PATCH", `/api/tasks/${id}`, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: "Task updated successfully" });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error updating task", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  });

  const updateWeekMutation = useMutation({
    mutationFn: async (data: Partial<InsertWeek> & { id: number }) => {
      const { id, ...rest } = data;
      return apiRequest("PATCH", `/api/weeks/${id}`, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/weeks'] });
      toast({ title: "Week updated successfully" });
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast({ 
        title: "Error updating week", 
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive" 
      });
    }
  });

  // Edit handlers
  const handleEdit = (item: any, type: string) => {
    setCurrentItem({ ...item });
    setEditType(type);
    setEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    switch (editType) {
      case "goal":
        updateGoalMutation.mutate(currentItem as (Partial<InsertGoal> & { id: number }));
        break;
      case "metric":
        updateMetricMutation.mutate(currentItem as (Partial<InsertMetric> & { id: number }));
        break;
      case "goalStatus":
        updateGoalStatusMutation.mutate(currentItem as (Partial<InsertGoalStatus> & { id: number }));
        break;
      case "task":
        updateTaskMutation.mutate(currentItem as (Partial<InsertExecutionTask> & { id: number }));
        break;
      case "week":
        updateWeekMutation.mutate(currentItem as (Partial<InsertWeek> & { id: number }));
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields specifically
    if (["current", "target", "trend", "completionRate", "number"].includes(name)) {
      setCurrentItem({
        ...currentItem,
        [name]: parseFloat(value) || 0,
      });
    } else {
      setCurrentItem({
        ...currentItem,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setCurrentItem({
      ...currentItem,
      [name]: value,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Edit Data</CardTitle>
            <CardDescription>
              Update goals, metrics, tasks, and other data in your 2025 Goals Tracking System
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs 
              value={activeTab}
              onValueChange={(value) => setActiveTab(value)}
            >
              <TabsList className="grid grid-cols-5 mb-6">
                <TabsTrigger value="goals">Goals</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
                <TabsTrigger value="goalStatuses">Goal Statuses</TabsTrigger>
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="weeks">Weeks</TabsTrigger>
              </TabsList>
              
              {/* Goals Tab */}
              <TabsContent value="goals">
                <div className="rounded-md border">
                  <div className="p-4 bg-muted/40">
                    <h3 className="text-lg font-medium">Goals</h3>
                    <p className="text-sm text-muted-foreground">Set your 2025 goals and track progress</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-7 gap-4 text-sm font-medium text-muted-foreground mb-2">
                      <div>ID</div>
                      <div>Name</div>
                      <div>Current</div>
                      <div>Target</div>
                      <div>Unit</div>
                      <div>Color</div>
                      <div>Actions</div>
                    </div>
                    
                    {goals.map((goal) => (
                      <div key={goal.id} className="grid grid-cols-7 gap-4 py-3 border-t items-center">
                        <div>{goal.id}</div>
                        <div>{goal.name}</div>
                        <div>{goal.current}</div>
                        <div>{goal.target}</div>
                        <div>{goal.unit}</div>
                        <div>{goal.color}</div>
                        <div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(goal, "goal")}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Metrics Tab */}
              <TabsContent value="metrics">
                <div className="rounded-md border">
                  <div className="p-4 bg-muted/40">
                    <h3 className="text-lg font-medium">Metrics</h3>
                    <p className="text-sm text-muted-foreground">Key performance indicators</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-8 gap-4 text-sm font-medium text-muted-foreground mb-2">
                      <div>ID</div>
                      <div>Name</div>
                      <div>Value</div>
                      <div>Previous</div>
                      <div>Trend</div>
                      <div>Direction</div>
                      <div>Category</div>
                      <div>Actions</div>
                    </div>
                    
                    {metrics.map((metric) => (
                      <div key={metric.id} className="grid grid-cols-8 gap-4 py-3 border-t items-center">
                        <div>{metric.id}</div>
                        <div>{metric.name}</div>
                        <div>{metric.value}</div>
                        <div>{metric.previousValue}</div>
                        <div>{metric.trend}</div>
                        <div>{metric.trendDirection}</div>
                        <div>{metric.category}</div>
                        <div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(metric, "metric")}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Goal Statuses Tab */}
              <TabsContent value="goalStatuses">
                <div className="rounded-md border">
                  <div className="p-4 bg-muted/40">
                    <h3 className="text-lg font-medium">Goal Statuses</h3>
                    <p className="text-sm text-muted-foreground">Current status of each goal</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground mb-2">
                      <div>ID</div>
                      <div>Goal ID</div>
                      <div>Goal Name</div>
                      <div>Status</div>
                      <div>Actions</div>
                    </div>
                    
                    {goalStatuses.map((status) => (
                      <div key={status.id} className="grid grid-cols-5 gap-4 py-3 border-t items-center">
                        <div>{status.id}</div>
                        <div>{status.goalId}</div>
                        <div>{status.goalName}</div>
                        <div>{status.status}</div>
                        <div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(status, "goalStatus")}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Tasks Tab */}
              <TabsContent value="tasks">
                <div className="rounded-md border">
                  <div className="p-4 bg-muted/40">
                    <h3 className="text-lg font-medium">Execution Tasks</h3>
                    <p className="text-sm text-muted-foreground">Tasks to execute on your goals</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-9 gap-4 text-sm font-medium text-muted-foreground mb-2">
                      <div>ID</div>
                      <div>Task</div>
                      <div>Owner</div>
                      <div>Goal Category</div>
                      <div>Category Color</div>
                      <div>Due Date</div>
                      <div>Status</div>
                      <div>Week ID</div>
                      <div>Actions</div>
                    </div>
                    
                    {tasks.map((task) => (
                      <div key={task.id} className="grid grid-cols-9 gap-4 py-3 border-t items-center text-sm">
                        <div>{task.id}</div>
                        <div>{task.task}</div>
                        <div>{task.owner}</div>
                        <div>{task.goalCategory}</div>
                        <div>{task.categoryColor}</div>
                        <div>{task.dueDate}</div>
                        <div>{task.status}</div>
                        <div>{task.weekId}</div>
                        <div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(task, "task")}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              
              {/* Weeks Tab */}
              <TabsContent value="weeks">
                <div className="rounded-md border">
                  <div className="p-4 bg-muted/40">
                    <h3 className="text-lg font-medium">Weeks</h3>
                    <p className="text-sm text-muted-foreground">Weekly tracking periods</p>
                  </div>
                  
                  <div className="p-4">
                    <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground mb-2">
                      <div>ID</div>
                      <div>Number</div>
                      <div>Date Range</div>
                      <div>Completion Rate</div>
                      <div>Actions</div>
                    </div>
                    
                    {weeks.map((week) => (
                      <div key={week.id} className="grid grid-cols-5 gap-4 py-3 border-t items-center">
                        <div>{week.id}</div>
                        <div>{week.number}</div>
                        <div>{week.dateRange}</div>
                        <div>{week.completionRate}%</div>
                        <div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEdit(week, "week")}
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <Footer />
      
      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>
              Edit {editType === "goalStatus" ? "Goal Status" : editType?.charAt(0).toUpperCase() + editType?.slice(1)}
            </DialogTitle>
            <DialogDescription>
              Make changes to the selected item. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {editType === "goal" && currentItem && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={currentItem.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="current" className="text-right">Current</Label>
                    <Input
                      id="current"
                      name="current"
                      type="number"
                      step="0.1"
                      value={currentItem.current}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="target" className="text-right">Target</Label>
                    <Input
                      id="target"
                      name="target"
                      type="number"
                      step="0.1"
                      value={currentItem.target}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="unit" className="text-right">Unit</Label>
                    <Input
                      id="unit"
                      name="unit"
                      value={currentItem.unit}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="color" className="text-right">Color</Label>
                    <Select
                      value={currentItem.color}
                      onValueChange={(value) => handleSelectChange("color", value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="primary">Primary</SelectItem>
                        <SelectItem value="green">Green</SelectItem>
                        <SelectItem value="blue">Blue</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="orange">Orange</SelectItem>
                        <SelectItem value="purple">Purple</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              {editType === "metric" && currentItem && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={currentItem.name}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="value" className="text-right">Value</Label>
                    <Input
                      id="value"
                      name="value"
                      value={currentItem.value}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="previousValue" className="text-right">Previous Value</Label>
                    <Input
                      id="previousValue"
                      name="previousValue"
                      value={currentItem.previousValue}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="trend" className="text-right">Trend</Label>
                    <Input
                      id="trend"
                      name="trend"
                      type="number"
                      step="0.1"
                      value={currentItem.trend}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="trendDirection" className="text-right">Trend Direction</Label>
                    <Select
                      value={currentItem.trendDirection}
                      onValueChange={(value) => handleSelectChange("trendDirection", value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select direction" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="up">Up</SelectItem>
                        <SelectItem value="down">Down</SelectItem>
                        <SelectItem value="stable">Stable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="category" className="text-right">Category</Label>
                    <Select
                      value={currentItem.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="growth">Growth</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="engagement">Engagement</SelectItem>
                        <SelectItem value="performance">Performance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              {editType === "goalStatus" && currentItem && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="goalId" className="text-right">Goal ID</Label>
                    <Input
                      id="goalId"
                      name="goalId"
                      type="number"
                      value={currentItem.goalId}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="goalName" className="text-right">Goal Name</Label>
                    <Input
                      id="goalName"
                      name="goalName"
                      value={currentItem.goalName}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select
                      value={currentItem.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="on-track">On Track</SelectItem>
                        <SelectItem value="needs-attention">Needs Attention</SelectItem>
                        <SelectItem value="off-track">Off Track</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              
              {editType === "task" && currentItem && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="task" className="text-right">Task</Label>
                    <Input
                      id="task"
                      name="task"
                      value={currentItem.task}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="owner" className="text-right">Owner</Label>
                    <Input
                      id="owner"
                      name="owner"
                      value={currentItem.owner}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ownerAvatar" className="text-right">Owner Avatar URL</Label>
                    <Input
                      id="ownerAvatar"
                      name="ownerAvatar"
                      value={currentItem.ownerAvatar}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="goalCategory" className="text-right">Goal Category</Label>
                    <Input
                      id="goalCategory"
                      name="goalCategory"
                      value={currentItem.goalCategory}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="categoryColor" className="text-right">Category Color</Label>
                    <Input
                      id="categoryColor"
                      name="categoryColor"
                      value={currentItem.categoryColor}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dueDate" className="text-right">Due Date</Label>
                    <Input
                      id="dueDate"
                      name="dueDate"
                      value={currentItem.dueDate}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">Status</Label>
                    <Select
                      value={currentItem.status}
                      onValueChange={(value) => handleSelectChange("status", value)}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="missed">Missed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="weekId" className="text-right">Week ID</Label>
                    <Input
                      id="weekId"
                      name="weekId"
                      type="number"
                      value={currentItem.weekId}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
              
              {editType === "week" && currentItem && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="number" className="text-right">Number</Label>
                    <Input
                      id="number"
                      name="number"
                      type="number"
                      value={currentItem.number}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dateRange" className="text-right">Date Range</Label>
                    <Input
                      id="dateRange"
                      name="dateRange"
                      value={currentItem.dateRange}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="completionRate" className="text-right">Completion Rate</Label>
                    <Input
                      id="completionRate"
                      name="completionRate"
                      type="number"
                      step="0.1"
                      value={currentItem.completionRate}
                      onChange={handleInputChange}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
