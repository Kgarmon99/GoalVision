import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HabitStreakTracker } from "@/components/habit-streak-tracker-enhanced";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, MoreHorizontal, Trash2, Home, LayoutDashboard, ListTodo, Flame, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Goal, Habit, insertHabitSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Link } from "wouter";
import { ParticleEffect } from "@/components/ui/particle-effect";

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
        const response = await apiRequest("GET", '/api/goals');
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
        const response = await apiRequest("GET", '/api/habits');
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
      await apiRequest("POST", '/api/habits', values);
      
      // Refetch habits
      const response = await apiRequest("GET", '/api/habits');
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
      await apiRequest("DELETE", `/api/habits/${habitId}`);
      
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
      <div className="min-h-screen flex flex-col bg-black text-white relative cosmic-bg">
        {/* Navigation Bar */}
        <div className="sticky top-0 z-50 w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center">
                <Link href="/" className="flex items-center text-green-500 font-semibold">
                  <Home className="h-5 w-5 mr-2" />
                  <span className="hidden sm:inline">Home</span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-4">
                <div className="flex overflow-x-auto no-scrollbar space-x-1 sm:space-x-2 p-2">
                  <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                    <LayoutDashboard className="h-4 w-4 mr-1 sm:mr-2" />
                    <span>Dashboard</span>
                  </Link>
                  
                  <Link href="/task-board" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                    <ListTodo className="h-4 w-4 mr-1 sm:mr-2" />
                    <span>Tasks</span>
                  </Link>
                  
                  <Link href="/habit-tracker" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-800 text-white transition-colors border-b-2 border-green-500">
                    <Flame className="h-4 w-4 mr-1 sm:mr-2 text-orange-400" />
                    <span>Habits</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative cosmic-bg">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.15),rgba(0,0,0,0)_50%)]"></div>
      
      {/* Animated Floating Orbs */}
      <div className="absolute left-[10%] top-[20%] w-40 h-40 rounded-full bg-gradient-to-r from-green-900/10 to-green-500/5 blur-2xl float-effect-slow"></div>
      <div className="absolute right-[15%] top-[30%] w-64 h-64 rounded-full bg-gradient-to-r from-blue-900/10 to-purple-500/5 blur-2xl float-effect"></div>
      <div className="absolute left-[25%] bottom-[15%] w-52 h-52 rounded-full bg-gradient-to-r from-purple-900/5 to-pink-500/5 blur-2xl float-effect-fast"></div>
      
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 w-full bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-green-500 font-semibold">
                <Home className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-4">
              <div className="flex overflow-x-auto no-scrollbar space-x-1 sm:space-x-2 p-2">
                <Link href="/dashboard" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                  <LayoutDashboard className="h-4 w-4 mr-1 sm:mr-2" />
                  <span>Dashboard</span>
                </Link>
                
                <Link href="/task-board" className="flex items-center px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-800 text-gray-300 hover:text-white transition-colors">
                  <ListTodo className="h-4 w-4 mr-1 sm:mr-2" />
                  <span>Tasks</span>
                </Link>
                
                <Link href="/habit-tracker" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-800 text-white transition-colors border-b-2 border-green-500">
                  <Flame className="h-4 w-4 mr-1 sm:mr-2 text-orange-400" />
                  <span>Habits</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-1 py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <div className="relative aura-pulse mr-3">
                  <Flame className="h-8 w-8 text-orange-400 float-effect" />
                </div>
                <AnimatedComponent animation="fadeIn" delay={0.2}>
                  <h1 className="text-3xl font-bold text-white text-glow">Habit Streak Tracker</h1>
                </AnimatedComponent>
              </div>
              
              <Dialog open={isAddHabitOpen} onOpenChange={setIsAddHabitOpen}>
                <DialogTrigger asChild>
                  <AnimatedButton 
                    animation="pulse"
                    className="mt-4 md:mt-0 neon-glow border-green-500 text-green-400 hover:bg-gray-800 hover:border-green-400 transition-colors"
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Habit
                  </AnimatedButton>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px] bg-gray-900 border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Habit</DialogTitle>
                    <DialogDescription className="text-gray-400">
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
                            <FormLabel className="text-gray-300">Habit Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Morning Exercise" {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                            <FormLabel className="text-gray-300">Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Describe your habit..." {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                              <FormLabel className="text-gray-300">Associated Goal</FormLabel>
                              <Select
                                onValueChange={(value) => field.onChange(parseInt(value))}
                                value={field.value?.toString()}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue placeholder="Select a goal" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-700">
                                  {goals.map(goal => (
                                    <SelectItem key={goal.id} value={goal.id.toString()}>
                                      {goal.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormDescription className="text-gray-500">
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
                              <FormLabel className="text-gray-300">Frequency</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue placeholder="Select frequency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-700">
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
                              <FormLabel className="text-gray-300">Target Streak</FormLabel>
                              <FormControl>
                                <Input type="number" min="1" max="365" {...field} className="bg-gray-800 border-gray-700 text-white" />
                              </FormControl>
                              <FormDescription className="text-xs text-gray-500">
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
                              <FormLabel className="text-gray-300">Reminder Time</FormLabel>
                              <FormControl>
                                <Input type="time" {...field} className="bg-gray-800 border-gray-700 text-white" />
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
                              <FormLabel className="text-gray-300">Color</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                                    <SelectValue placeholder="Select color" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-gray-800 border-gray-700">
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
                        <Button 
                          type="submit" 
                          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          Create Habit
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <Tabs 
            defaultValue="all" 
            className="w-full bg-gray-900/40 backdrop-blur-sm p-4 rounded-lg border border-gray-800 shadow-xl"
          >
            <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
              <TabsTrigger value="all" className="text-base">All Habits</TabsTrigger>
              <TabsTrigger value="byGoal" className="text-base">By Goal</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4 space-y-8">
              <AnimatedComponent animation="fadeIn" delay={0.3}>
                <HabitStreakTracker />
              </AnimatedComponent>
              
              <div className="mt-8">
                <div className="flex items-center mb-6">
                  <h2 className="text-xl font-bold mr-2 text-white">Your Habits</h2>
                  <div className="h-px flex-grow bg-gradient-to-r from-green-500/50 to-transparent ml-4" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {habits.map((habit, index) => (
                      <motion.div
                        key={habit.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="overflow-hidden bg-gray-900/80 border border-gray-800 shadow-xl hover:shadow-emerald-500/5 transition-shadow group">
                          <div className={`h-2 w-full ${
                            habit.color === 'primary' ? 'bg-primary' :
                            habit.color === 'blue' ? 'bg-blue-500' :
                            habit.color === 'green' ? 'bg-green-500' :
                            habit.color === 'purple' ? 'bg-purple-500' :
                            'bg-indigo-500'
                          }`}></div>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-white group-hover:text-glow transition-all">{habit.name}</CardTitle>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                                onClick={() => deleteHabit(habit.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <CardDescription className="text-gray-400">
                              {habit.frequency === 'daily' ? 'Daily habit' : 
                              habit.frequency === 'weekly' ? 'Weekly habit' : 
                              'Workdays only'}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-400 mb-4 h-12 overflow-hidden">
                              {habit.description}
                            </p>
                            <div className="flex justify-between text-sm">
                              <span className="flex items-center text-gray-400">
                                <Flame className="mr-1 h-4 w-4 text-orange-400" />
                                Target: {habit.targetStreakDays} days
                              </span>
                              <span className="text-gray-400">
                                {habit.reminderTime}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                
                {habits.length === 0 && (
                  <div className="text-center p-12 border rounded-lg bg-gray-900/50 border-gray-800">
                    <ParticleEffect
                      type="sparkles"
                      count={15}
                      colors={["#10b981", "#6366f1", "#8b5cf6"]}
                      className="absolute inset-0"
                    />
                    <div className="relative z-10">
                      <Flame className="h-16 w-16 mx-auto text-gray-600 mb-4" />
                      <h3 className="text-xl font-medium mb-2 text-white">No habits yet</h3>
                      <p className="text-gray-400 mb-6">
                        Create your first habit to start building consistent streaks
                      </p>
                      <AnimatedButton 
                        onClick={() => setIsAddHabitOpen(true)}
                        animation="shine"
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        <Plus className="mr-2 h-5 w-5" />
                        Create Your First Habit
                      </AnimatedButton>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="byGoal" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 shadow-lg">
                    <h2 className="text-lg font-bold mb-4 text-white">Select a Goal</h2>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className={`w-full justify-start text-left ${selectedGoalId === null ? 'bg-gray-800 border-green-500' : 'bg-transparent border-gray-800'}`}
                        onClick={() => setSelectedGoalId(null)}
                      >
                        <span className="mr-2">👁️</span> View All Habits
                      </Button>
                      
                      {goals.map(goal => (
                        <Button
                          key={goal.id}
                          variant="outline"
                          className={`w-full justify-start text-left ${selectedGoalId === goal.id ? 'bg-gray-800 border-green-500' : 'bg-transparent border-gray-800'}`}
                          onClick={() => setSelectedGoalId(goal.id)}
                        >
                          <Flame className="mr-2 h-4 w-4 text-orange-400" />
                          {goal.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-white">
                        {selectedGoalId 
                          ? `Habits for ${goals.find(g => g.id === selectedGoalId)?.name || 'Goal'}` 
                          : 'All Habits'}
                      </h2>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-white"
                        onClick={() => setIsAddHabitOpen(true)}
                      >
                        <Plus className="mr-1 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {(selectedGoalId 
                        ? habits.filter(h => h.goalId === selectedGoalId)
                        : habits
                      ).map(habit => (
                        <AnimatedComponent
                          key={habit.id}
                          animation="fadeIn"
                          className="bg-gray-800/70 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold text-white">{habit.name}</h3>
                              <p className="text-sm text-gray-400 mt-1">{habit.description}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={`${
                                habit.color === 'primary' ? 'bg-primary' :
                                habit.color === 'blue' ? 'bg-blue-500' :
                                habit.color === 'green' ? 'bg-green-500' :
                                habit.color === 'purple' ? 'bg-purple-500' :
                                'bg-indigo-500'
                              }`}>
                                {habit.frequency}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-red-400"
                                onClick={() => deleteHabit(habit.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </AnimatedComponent>
                      ))}
                      
                      {(selectedGoalId
                        ? habits.filter(h => h.goalId === selectedGoalId).length === 0
                        : habits.length === 0
                      ) && (
                        <div className="text-center p-6 border border-gray-800 rounded-lg bg-gray-900/30">
                          <p className="text-gray-400">
                            {selectedGoalId
                              ? 'No habits associated with this goal yet.'
                              : 'No habits found. Create your first habit.'}
                          </p>
                          <Button
                            className="mt-4 bg-gradient-to-r from-green-600 to-emerald-600"
                            size="sm"
                            onClick={() => setIsAddHabitOpen(true)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Habit
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}