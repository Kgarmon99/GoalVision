import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { HabitStreakTracker } from "@/components/habit-streak-tracker-fixed";
import { Separator } from "@/components/ui/separator";
import { Plus, MoreHorizontal, Trash2, Flame, Home, LayoutDashboard, ListTodo, BarChart3, ChevronRight, ArrowLeft } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Goal, Habit, insertHabitSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";

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

                  <Link href="/habit-tracker-fixed" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-800 text-white transition-colors border-b-2 border-green-500">
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

                <Link href="/habit-tracker-fixed" className="flex items-center px-3 py-2 text-sm font-medium rounded-md bg-gray-800 text-white transition-colors border-b-2 border-green-500">
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
                <img 
                  src="/images/user-profile.jpeg" 
                  alt="Kahlil Garmon" 
                  className="w-12 h-12 rounded-full border-2 border-green-400 shadow-lg shadow-green-500/20 mr-3" 
                />
                <div className="relative aura-pulse mr-3">
                  <Flame className="h-8 w-8 text-orange-400 float-effect" />
                </div>
                <h1 className="text-3xl font-bold text-white text-glow">Habit Streak Tracker</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Dialog open={isAddHabitOpen} onOpenChange={setIsAddHabitOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      className="mt-4 md:mt-0 neon-glow border-green-500 text-green-400 hover:bg-gray-800 hover:border-green-400 transition-colors"
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Habit
                    </Button>
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

                        <div className="mt-6 flex items-center">
                          <img 
                            src="/images/kahlil-profile.jpeg" 
                            alt="Kahlil Garmon" 
                            className="h-8 w-8 rounded-full border border-green-400 mr-3" 
                          />
                          <div className="text-sm text-gray-300">Tracked by Kahlil Garmon</div>
                        </div>

                        <DialogFooter>
                          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Create Habit</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-gray-800 border-b border-gray-700">
              <TabsTrigger value="all" className="text-gray-300 data-[state=active]:text-green-400">All Habits</TabsTrigger>
              <TabsTrigger value="byGoal" className="text-gray-300 data-[state=active]:text-green-400">By Goal</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <HabitStreakTracker />

              <div className="mt-8">
                <div className="flex items-center mb-4">
                  <h2 className="text-xl font-bold text-white text-glow">All Habits</h2>
                  <div className="ml-3 h-px flex-1 bg-gradient-to-r from-green-500/50 to-transparent"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {habits.map(habit => (
                    <motion.div
                      key={habit.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className={`overflow-hidden bg-gray-900 border-gray-800 border glow-card ${
                        habit.color === 'primary' ? 'hover:border-green-600' :
                        habit.color === 'blue' ? 'hover:border-blue-600' :
                        habit.color === 'green' ? 'hover:border-green-600' :
                        habit.color === 'purple' ? 'hover:border-purple-600' :
                        'hover:border-indigo-600'
                      } transition-all duration-300`}>
                        <div className={`h-2 w-full ${
                          habit.color === 'primary' ? 'bg-primary' :
                          habit.color === 'blue' ? 'bg-blue-500' :
                          habit.color === 'green' ? 'bg-green-500' :
                          habit.color === 'purple' ? 'bg-purple-500' :
                          'bg-indigo-500'
                        }`}></div>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-white">{habit.name}</CardTitle>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-red-400 hover:bg-red-900/30 hover:text-red-300"
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
                          <p className="text-sm text-gray-300 mb-2">
                            {habit.description}
                          </p>
                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-green-400">Target: {habit.targetStreakDays} days</span>
                            <span className="text-blue-400">Reminder: {habit.reminderTime}</span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>

                {habits.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center p-12 border border-gray-800 rounded-lg bg-gray-900/50 backdrop-blur-sm"
                  >
                    <h3 className="text-lg font-medium mb-2 text-white">No habits yet</h3>
                    <p className="text-gray-400 mb-4">
                      Create your first habit to start building streaks
                    </p>
                    <Button 
                      onClick={() => setIsAddHabitOpen(true)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Habit
                    </Button>
                  </motion.div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="byGoal" className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-900/70 backdrop-blur-sm rounded-lg p-4 border border-gray-800">
                    <h3 className="text-lg font-medium mb-2 text-white">Select a goal</h3>
                    <Select
                      value={selectedGoalId?.toString() || ""}
                      onValueChange={(value) => setSelectedGoalId(parseInt(value))}
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Choose a goal" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {goals.map(goal => (
                          <SelectItem key={goal.id} value={goal.id.toString()}>
                            {goal.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedGoalId && <HabitStreakTracker goalId={selectedGoalId} />}
                </div>

                <div className="space-y-4">
                  <Card className="bg-gray-900 border-gray-800 shadow-xl">
                    <CardHeader className="pb-2 border-b border-gray-800">
                      <CardTitle className="text-lg text-white">Goal-related Habits</CardTitle>
                      <CardDescription className="text-gray-400">
                        Habits that directly contribute to your selected goal
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                      {selectedGoalId ? (
                        habits.filter(h => h.goalId === selectedGoalId).length > 0 ? (
                          <div className="space-y-3">
                            {habits
                              .filter(h => h.goalId === selectedGoalId)
                              .map(habit => (
                                <motion.div 
                                  key={habit.id} 
                                  className="flex justify-between items-center p-3 border border-gray-800 bg-gray-800/50 rounded-md"
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <div>
                                    <h4 className="font-medium text-white">{habit.name}</h4>
                                    <p className="text-sm text-gray-400">{habit.description}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <div className={`h-2 w-2 rounded-full ${
                                      habit.color === 'primary' ? 'bg-primary' :
                                      habit.color === 'blue' ? 'bg-blue-500' :
                                      habit.color === 'green' ? 'bg-green-500' :
                                      habit.color === 'purple' ? 'bg-purple-500' :
                                      'bg-indigo-500'
                                    }`}></div>
                                    <Button 
                                      variant="ghost"
                                      size="sm"
                                      className="text-red-400 hover:text-red-300 hover:bg-red-900/30"
                                      onClick={() => deleteHabit(habit.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </motion.div>
                              ))
                            }
                          </div>
                        ) : (
                          <div className="text-center py-6 border border-gray-800 rounded-lg bg-gray-900/50">
                            <p className="text-gray-400 mb-4">No habits associated with this goal</p>
                            <Button 
                              onClick={() => setIsAddHabitOpen(true)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Add Habit
                            </Button>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-10 border border-gray-800 rounded-lg bg-gray-900/50">
                          <p className="text-gray-400">Select a goal to see its associated habits</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}