import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Home, LayoutDashboard, ListTodo, Flame, BarChart, BellRing, ArrowLeft } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Goal, Habit } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Link } from "wouter";
import { ParticleEffect } from "@/components/ui/particle-effect";
import { HabitStreakTracker } from "@/components/habit-streak-tracker-enhanced";
import { HabitAnalyticsDashboard } from "@/components/habit-analytics-dashboard";
import { SmartReminderSystem } from "@/components/smart-reminder-system";

export default function HabitTrackerSuper() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
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
        
        if (data.length > 0 && !selectedHabitId) {
          setSelectedHabitId(data[0].id);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching habits:', error);
        setIsLoading(false);
      }
    }
    fetchHabits();
  }, []);
  
  // Handle habit selection
  const handleHabitSelect = (habitId: number) => {
    setSelectedHabitId(habitId);
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
                  <h1 className="text-3xl font-bold text-white text-glow">Supercharged Habit Tracker</h1>
                </AnimatedComponent>
              </div>
            </div>
          </div>
          
          <Tabs 
            defaultValue="tracker" 
            className="w-full bg-gray-900/40 backdrop-blur-sm p-4 rounded-lg border border-gray-800 shadow-xl"
          >
            <TabsList className="grid w-full md:w-auto grid-cols-3 mb-6">
              <TabsTrigger value="tracker" className="text-base">
                <Flame className="h-4 w-4 mr-2 text-orange-400" />
                Habit Tracker
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-base">
                <BarChart className="h-4 w-4 mr-2 text-blue-400" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reminders" className="text-base">
                <BellRing className="h-4 w-4 mr-2 text-purple-400" />
                Reminders
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="tracker" className="mt-4 space-y-8">
              <AnimatedComponent animation="fadeIn" delay={0.3}>
                <HabitStreakTracker
                  goalId={null}
                />
              </AnimatedComponent>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-4 space-y-8">
              <AnimatedComponent animation="fadeIn" delay={0.3}>
                <HabitAnalyticsDashboard
                  habitId={selectedHabitId || undefined}
                  allHabits={habits}
                  onHabitSelect={handleHabitSelect}
                />
              </AnimatedComponent>
            </TabsContent>
            
            <TabsContent value="reminders" className="mt-4 space-y-8">
              <AnimatedComponent animation="fadeIn" delay={0.3}>
                <SmartReminderSystem
                  habitId={selectedHabitId || undefined}
                  habits={habits}
                  onHabitSelect={handleHabitSelect}
                />
              </AnimatedComponent>
            </TabsContent>
          </Tabs>
          
          {/* Version switcher */}
          <div className="mt-8 text-center">
            <div className="inline-flex bg-gray-800 rounded-lg p-1 space-x-1">
              <Link href="/habit-tracker-fixed">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Basic Version
                </Button>
              </Link>
              <Link href="/habit-tracker">
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  Enhanced Version
                </Button>
              </Link>
              <div className="bg-gray-700 rounded-md px-3 py-1 text-sm text-white">
                Supercharged
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}