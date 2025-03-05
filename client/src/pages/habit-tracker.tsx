import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HabitStreakTracker } from "@/components/habit-streak-tracker";
import { Separator } from "@/components/ui/separator";
import { Plus, MoreHorizontal, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Goal, Habit, insertHabitSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// Create a schema for adding a habit
const habitFormSchema = insertHabitSchema.extend({
  targetStreakDays: z.coerce.number().min(1, "Target streak must be at least 1 day"),
});

type HabitFormValues = z.infer<typeof habitFormSchema>;

export default function HabitTracker() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  const form = useForm<HabitFormValues>({
    resolver: zodResolver(habitFormSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: "daily",
      targetStreakDays: 7,
      reminderTime: "08:00",
      color: "primary"
    }
  });
  
  // Fetch goals
  useEffect(() => {
    async function fetchGoals() {
      try {
        setIsLoading(true);
        const response = await apiRequest('/api/goals');
        const data = await response.json();
        setGoals(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching goals:', error);
        setIsLoading(false);
      }
    }
    fetchGoals();
  }, []);
  
  // Fetch habits when selected goal changes
  useEffect(() => {
    async function fetchHabits() {
      try {
        setIsLoading(true);
        const response = await apiRequest('/api/habits');
        const data = await response.json();
        setHabits(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching habits:', error);
        setIsLoading(false);
      }
    }
    fetchHabits();
  }, []);
  
  // Submit handler for adding a new habit
  const onSubmit = async (values: HabitFormValues) => {
    try {
      await apiRequest('/api/habits', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      
      // Refetch habits
      const response = await apiRequest('/api/habits');
      const data = await response.json();
      setHabits(data);
      
      // Reset form and close dialog
      form.reset();
      setIsAddHabitOpen(false);
      
      toast({
        title: "Habit Created",
        description: "Your new habit has been successfully created.",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      if (values.goalId) {
        queryClient.invalidateQueries({ queryKey: [`/api/goals/${values.goalId}/habits`] });
      }
    } catch (error) {
      console.error('Error creating habit:', error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not create habit. Please try again.",
      });
    }
  };
  
  // Delete a habit
  const deleteHabit = async (habitId: number) => {
    if (!confirm("Are you sure you want to delete this habit? This will also delete all streak records.")) {
      return;
    }
    
    try {
      await apiRequest(`/api/habits/${habitId}`, {
        method: 'DELETE',
      });
      
      // Remove from local state
      setHabits(habits.filter(h => h.id !== habitId));
      
      toast({
        title: "Habit Deleted",
        description: "The habit has been successfully deleted.",
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/habits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/habits', habitId] });
    } catch (error) {
      console.error('Error deleting habit:', error);
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not delete habit. Please try again.",
      });
    }
  };
  
  if (isLoading && habits.length === 0) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-1">Habit Streak Tracker</h1>
          <p className="text-muted-foreground">
            Build consistency by tracking your daily and weekly habits
          </p>
        </div>
        
        <Dialog open={isAddHabitOpen} onOpenChange={setIsAddHabitOpen}>
          <DialogTrigger asChild>
            <Button className="mt-4 md:mt-0" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add New Habit
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Habit</DialogTitle>
              <DialogDescription>
                Create a new habit to track consistently. Habits are most effective when tracked daily.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Habit Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Morning Exercise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Describe your habit..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="goalId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Associated Goal</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          value={field.value?.toString()}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {goals.map(goal => (
                              <SelectItem key={goal.id} value={goal.id.toString()}>
                                {goal.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Link this habit to a specific goal
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="workdays">Workdays Only</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="targetStreakDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Streak</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" max="365" {...field} />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Days to build habit
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reminderTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminder Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Color</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select color" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="primary">Primary</SelectItem>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                            <SelectItem value="indigo">Indigo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="submit">Create Habit</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Habits</TabsTrigger>
          <TabsTrigger value="byGoal">By Goal</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <HabitStreakTracker />
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">All Habits</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {habits.map(habit => (
                <Card key={habit.id} className="overflow-hidden">
                  <div className={`h-2 w-full ${
                    habit.color === 'primary' ? 'bg-primary' :
                    habit.color === 'blue' ? 'bg-blue-500' :
                    habit.color === 'green' ? 'bg-green-500' :
                    habit.color === 'purple' ? 'bg-purple-500' :
                    'bg-indigo-500'
                  }`}></div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle>{habit.name}</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground"
                        onClick={() => deleteHabit(habit.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardDescription>
                      {habit.frequency === 'daily' ? 'Daily habit' : 
                       habit.frequency === 'weekly' ? 'Weekly habit' : 
                       'Workdays only'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {habit.description}
                    </p>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-muted-foreground">Target: {habit.targetStreakDays} days</span>
                      <span className="text-muted-foreground">Reminder: {habit.reminderTime}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {habits.length === 0 && (
              <div className="text-center p-12 border rounded-lg bg-slate-50">
                <h3 className="text-lg font-medium mb-2">No habits yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first habit to start building streaks
                </p>
                <Button onClick={() => setIsAddHabitOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Habit
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="byGoal" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Select a Goal</h2>
              <div className="space-y-2">
                {goals.map(goal => (
                  <Card 
                    key={goal.id} 
                    className={`cursor-pointer hover:bg-slate-50 transition-colors ${selectedGoalId === goal.id ? 'border-primary border-2' : ''}`}
                    onClick={() => setSelectedGoalId(goal.id)}
                  >
                    <CardContent className="p-4 flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {goal.current} / {goal.target} {goal.unit}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {habits.filter(h => h.goalId === goal.id).length} habits
                        </span>
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {goals.length === 0 && (
                  <div className="text-center p-12 border rounded-lg bg-slate-50">
                    <h3 className="text-lg font-medium mb-2">No goals found</h3>
                    <p className="text-muted-foreground">
                      Create goals first to associate habits with them
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-xl font-bold mb-4">Habits for Selected Goal</h2>
              {selectedGoalId ? (
                <HabitStreakTracker goalId={selectedGoalId} />
              ) : (
                <div className="text-center p-12 border rounded-lg bg-slate-50">
                  <h3 className="text-lg font-medium mb-2">No goal selected</h3>
                  <p className="text-muted-foreground">
                    Select a goal from the left to view its habits
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <Separator className="my-8" />
      
      <div className="bg-slate-50 p-6 rounded-lg border mt-6">
        <h2 className="text-xl font-bold mb-2">Why Track Habits?</h2>
        <p className="text-muted-foreground mb-4">
          Research shows that consistency is key to achieving goals. The Habit Streak Tracker helps you:
        </p>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Build momentum with visual streaks</li>
          <li>Establish new behaviors through regular repetition</li>
          <li>Track your progress toward habit formation</li>
          <li>Receive rewards and celebrations at milestone points</li>
          <li>Connect your daily actions to your larger goals</li>
        </ul>
      </div>
    </div>
  );
}