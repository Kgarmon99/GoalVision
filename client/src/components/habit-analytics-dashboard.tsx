import { useState, useEffect } from "react";
import { Habit, HabitStreak } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from "recharts";
import { format, subDays, isWeekend, differenceInDays, isSameDay, startOfWeek, endOfWeek, getDay, isWithinInterval } from "date-fns";
import { Info, ChevronRight, Zap, Calendar, TrendingUp, PieChart as PieChartIcon, BarChart as BarChartIcon, LineChart as LineChartIcon, Award, Clock } from "lucide-react";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { apiRequest } from "@/lib/queryClient";
import { motion } from "framer-motion";

interface HabitAnalyticsDashboardProps {
  habitId?: number;
  allHabits?: Habit[];
  onHabitSelect?: (habitId: number) => void;
}

interface StreakData {
  date: Date;
  completed: boolean;
}

interface DayAnalysis {
  day: string;
  completionRate: number;
  count: number;
}

interface TimeAnalysis {
  period: string;
  completionRate: number;
}

export function HabitAnalyticsDashboard({ habitId, allHabits, onHabitSelect }: HabitAnalyticsDashboardProps) {
  const [selectedHabitId, setSelectedHabitId] = useState<number | undefined>(habitId);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [habits, setHabits] = useState<Habit[]>(allHabits || []);
  const [streaks, setStreaks] = useState<HabitStreak[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("overview");
  
  // Analytics metrics
  const [completionRate, setCompletionRate] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [longestStreak, setLongestStreak] = useState<number>(0);
  const [weekdayAnalysis, setWeekdayAnalysis] = useState<DayAnalysis[]>([]);
  const [weekendVsWeekday, setWeekendVsWeekday] = useState<{ name: string; value: number }[]>([]);
  const [timeAnalysis, setTimeAnalysis] = useState<TimeAnalysis[]>([]);
  const [streakHistory, setStreakHistory] = useState<{ date: string; streak: number }[]>([]);
  
  // Fetch habits if not provided
  useEffect(() => {
    if (!allHabits) {
      async function fetchHabits() {
        try {
          setLoading(true);
          const response = await apiRequest("GET", '/api/habits');
          const data = await response.json();
          setHabits(data);
          
          if (data.length > 0) {
            const initialHabitId = habitId || data[0].id;
            setSelectedHabitId(initialHabitId);
            setSelectedHabit(data.find(h => h.id === initialHabitId) || null);
          }
          
          setLoading(false);
        } catch (error) {
          console.error('Error fetching habits:', error);
          setLoading(false);
        }
      }
      fetchHabits();
    } else if (habitId && allHabits.length > 0) {
      setSelectedHabitId(habitId);
      setSelectedHabit(allHabits.find(h => h.id === habitId) || null);
    } else if (allHabits.length > 0) {
      setSelectedHabitId(allHabits[0].id);
      setSelectedHabit(allHabits[0]);
    }
  }, [habitId, allHabits]);
  
  // Fetch streaks for selected habit
  useEffect(() => {
    if (!selectedHabitId) return;
    
    async function fetchStreaks() {
      try {
        setLoading(true);
        const today = new Date();
        const startDate = subDays(today, 90); // Get 90 days of history
        
        const response = await apiRequest("GET", `/api/habits/${selectedHabitId}/streaks/range?startDate=${startDate.toISOString()}&endDate=${today.toISOString()}`);
        const data = await response.json();
        setStreaks(data);
        
        const currentStreakResponse = await apiRequest("GET", `/api/habits/${selectedHabitId}/current-streak`);
        const currentStreakData = await currentStreakResponse.json();
        setCurrentStreak(currentStreakData.currentStreak);
        
        calculateAnalytics(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching habit streaks:', error);
        setLoading(false);
      }
    }
    
    fetchStreaks();
  }, [selectedHabitId]);
  
  // Handler for habit selection
  const handleHabitSelect = (id: number) => {
    setSelectedHabitId(id);
    const habit = habits.find(h => h.id === id);
    setSelectedHabit(habit || null);
    
    if (onHabitSelect) {
      onHabitSelect(id);
    }
  };
  
  // Calculate analytics from streak data
  const calculateAnalytics = (streakData: HabitStreak[]) => {
    if (!streakData.length) {
      setCompletionRate(0);
      setLongestStreak(0);
      setWeekdayAnalysis([]);
      setWeekendVsWeekday([]);
      setTimeAnalysis([]);
      setStreakHistory([]);
      return;
    }
    
    // Calculate completion rate
    const completedDays = streakData.filter(s => s.completed).length;
    const completionPercentage = (completedDays / streakData.length) * 100;
    setCompletionRate(Math.round(completionPercentage));
    
    // Calculate longest streak
    let currentCount = 0;
    let maxCount = 0;
    
    // Sort streaks by date
    const sortedStreaks = [...streakData].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Calculate streak history for chart
    const streakHistoryData: { date: string; streak: number }[] = [];
    let runningStreak = 0;
    
    sortedStreaks.forEach((streak, index) => {
      const streakDate = new Date(streak.date);
      
      if (streak.completed) {
        runningStreak++;
        currentCount++;
        maxCount = Math.max(maxCount, currentCount);
      } else {
        runningStreak = 0;
        currentCount = 0;
      }
      
      // Only add points where the streak changes or every 7 days to reduce data points
      if (index % 7 === 0 || index === sortedStreaks.length - 1) {
        streakHistoryData.push({
          date: format(streakDate, 'MMM dd'),
          streak: runningStreak
        });
      }
    });
    
    setLongestStreak(maxCount);
    setStreakHistory(streakHistoryData);
    
    // Analyze performance by day of week
    const dayMap: Record<string, { completed: number; total: number }> = {
      'Sunday': { completed: 0, total: 0 },
      'Monday': { completed: 0, total: 0 },
      'Tuesday': { completed: 0, total: 0 },
      'Wednesday': { completed: 0, total: 0 },
      'Thursday': { completed: 0, total: 0 },
      'Friday': { completed: 0, total: 0 },
      'Saturday': { completed: 0, total: 0 }
    };
    
    // Weekend vs weekday data
    const weekendData = { completed: 0, total: 0 };
    const weekdayData = { completed: 0, total: 0 };
    
    sortedStreaks.forEach(streak => {
      const date = new Date(streak.date);
      const dayName = format(date, 'EEEE');
      
      dayMap[dayName].total++;
      if (streak.completed) {
        dayMap[dayName].completed++;
      }
      
      // Weekend vs weekday
      if (isWeekend(date)) {
        weekendData.total++;
        if (streak.completed) weekendData.completed++;
      } else {
        weekdayData.total++;
        if (streak.completed) weekdayData.completed++;
      }
    });
    
    // Create day analysis
    const weekdayAnalysisData = Object.entries(dayMap).map(([day, data]) => ({
      day,
      completionRate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      count: data.total
    }));
    
    setWeekdayAnalysis(weekdayAnalysisData);
    
    // Create weekend vs weekday data
    const weekendCompletionRate = weekendData.total > 0 ? Math.round((weekendData.completed / weekendData.total) * 100) : 0;
    const weekdayCompletionRate = weekdayData.total > 0 ? Math.round((weekdayData.completed / weekdayData.total) * 100) : 0;
    
    setWeekendVsWeekday([
      { name: 'Weekdays', value: weekdayCompletionRate },
      { name: 'Weekends', value: weekendCompletionRate }
    ]);
    
    // Time analysis (monthly, weekly, daily)
    const today = new Date();
    const lastWeek = subDays(today, 7);
    const lastMonth = subDays(today, 30);
    
    const lastWeekStreaks = sortedStreaks.filter(s => 
      new Date(s.date) >= lastWeek && new Date(s.date) <= today
    );
    const lastMonthStreaks = sortedStreaks.filter(s => 
      new Date(s.date) >= lastMonth && new Date(s.date) <= today
    );
    
    const weeklyCompletion = lastWeekStreaks.length > 0 
      ? Math.round((lastWeekStreaks.filter(s => s.completed).length / lastWeekStreaks.length) * 100)
      : 0;
    
    const monthlyCompletion = lastMonthStreaks.length > 0
      ? Math.round((lastMonthStreaks.filter(s => s.completed).length / lastMonthStreaks.length) * 100)
      : 0;
    
    setTimeAnalysis([
      { period: 'Last 7 days', completionRate: weeklyCompletion },
      { period: 'Last 30 days', completionRate: monthlyCompletion },
      { period: 'All time', completionRate: Math.round(completionPercentage) }
    ]);
  };
  
  // Smart recommendations based on analytics
  const getRecommendations = () => {
    if (!streaks.length || !selectedHabit) return [];
    
    const recommendations: string[] = [];
    
    // Recommendation based on completion rate
    if (completionRate < 30) {
      recommendations.push("Your completion rate is quite low. Consider making this habit smaller or easier to complete.");
    } else if (completionRate < 60) {
      recommendations.push("Try setting a consistent time of day for this habit to improve your completion rate.");
    }
    
    // Recommendation based on day analysis
    const lowestPerformanceDay = [...weekdayAnalysis].sort((a, b) => a.completionRate - b.completionRate)[0];
    if (lowestPerformanceDay && lowestPerformanceDay.count > 3) {
      recommendations.push(`You tend to miss this habit most often on ${lowestPerformanceDay.day}s. Consider adjusting your approach for this day.`);
    }
    
    // Weekend vs weekday recommendation
    const weekendPerf = weekendVsWeekday.find(d => d.name === 'Weekends')?.value || 0;
    const weekdayPerf = weekendVsWeekday.find(d => d.name === 'Weekdays')?.value || 0;
    
    if (weekendPerf < weekdayPerf - 20) {
      recommendations.push("Your weekend consistency is much lower than weekdays. Try creating a weekend-specific routine.");
    } else if (weekdayPerf < weekendPerf - 20) {
      recommendations.push("You perform better on weekends than weekdays. Consider how to apply your weekend approach to weekdays.");
    }
    
    // Streak recommendations
    if (currentStreak === 0 && streaks.length > 10) {
      recommendations.push("You've broken your streak. Remember why this habit matters to you and start fresh today.");
    } else if (currentStreak > 0 && currentStreak === longestStreak && currentStreak >= 7) {
      recommendations.push(`Congratulations! You're on your best streak ever (${currentStreak} days). Keep it going!`);
    }
    
    return recommendations.length ? recommendations : ["Keep tracking your habit consistently to receive personalized recommendations."];
  };
  
  if (loading) {
    return (
      <Card className="shadow-lg bg-gray-900/70 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center p-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (habits.length === 0) {
    return (
      <Card className="shadow-lg bg-gray-900/70 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Habit Analytics</CardTitle>
          <CardDescription className="text-gray-400">Insights and patterns from your habit data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <BarChartIcon className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-white">No habits found</h3>
            <p className="text-sm text-gray-400 mt-2">
              Create habits to see analytics and insights
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <AnimatedComponent animation="fadeIn" delay={0.1}>
      <Card className="shadow-xl bg-gray-900/80 border-gray-800 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-indigo-500/10 opacity-50 blur-xl pointer-events-none"></div>
        
        <CardHeader className="relative z-10 border-b border-gray-800">
          <CardTitle className="flex items-center text-white">
            <BarChartIcon className="mr-2 h-6 w-6 text-blue-500" />
            <span className="text-glow">Habit Analytics Dashboard</span>
          </CardTitle>
          <CardDescription className="text-gray-400">Data-driven insights for your habits</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 relative z-10 pt-6">
          {/* Habit Selection */}
          <div className="flex flex-wrap gap-2 mb-4">
            {habits.map((habit, index) => (
              <motion.div
                key={habit.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Badge 
                  variant={selectedHabitId === habit.id ? 'default' : 'outline'}
                  className={`cursor-pointer transition-all ${
                    selectedHabitId === habit.id ? 'scale-110 shadow-glow' : 'hover:scale-105'
                  } ${habit.color === 'primary' ? 'bg-primary' : 
                    habit.color === 'blue' ? 'bg-blue-500' : 
                    habit.color === 'green' ? 'bg-green-500' : 
                    habit.color === 'purple' ? 'bg-purple-500' : 
                    habit.color === 'indigo' ? 'bg-indigo-500' : 'bg-primary'}`}
                  onClick={() => handleHabitSelect(habit.id)}
                >
                  {habit.name}
                </Badge>
              </motion.div>
            ))}
          </div>
          
          {selectedHabit && (
            <>
              <Tabs 
                defaultValue="overview" 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 w-full bg-gray-800">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">Overview</TabsTrigger>
                  <TabsTrigger value="patterns" className="data-[state=active]:bg-gray-700">Patterns</TabsTrigger>
                  <TabsTrigger value="recommendations" className="data-[state=active]:bg-gray-700">Smart Tips</TabsTrigger>
                </TabsList>
                
                {/* Overview Tab */}
                <TabsContent value="overview" className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-800/80 p-4 rounded-md border border-gray-700 flex flex-col items-center">
                      <div className="text-sm text-gray-400 mb-2">Completion Rate</div>
                      <div className="text-3xl font-bold text-white">{completionRate}%</div>
                      <div className="w-full mt-2">
                        <AnimatedProgress 
                          value={completionRate} 
                          className="h-2 bg-gray-700" 
                          indicatorClassName="bg-gradient-to-r from-blue-600 to-indigo-500"
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/80 p-4 rounded-md border border-gray-700 flex flex-col items-center">
                      <div className="text-sm text-gray-400 mb-2">Current Streak</div>
                      <div className="text-3xl font-bold flex items-center text-white">
                        {currentStreak} <span className="text-sm ml-1 font-normal text-gray-400">days</span>
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        <span className={currentStreak >= longestStreak && longestStreak > 0 ? "text-green-400" : "text-gray-400"}>
                          {currentStreak >= longestStreak && longestStreak > 0 ? "Best streak ever!" : `Best: ${longestStreak} days`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800/80 p-4 rounded-md border border-gray-700 flex flex-col items-center">
                      <div className="text-sm text-gray-400 mb-2">Total Records</div>
                      <div className="text-3xl font-bold text-white">{streaks.length}</div>
                      <div className="mt-2 text-xs text-gray-400">
                        {streaks.length > 0 ? 
                          `Since ${format(new Date(streaks[0].date), 'MMM d, yyyy')}` : 
                          "No data yet"}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800 mt-6">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <LineChartIcon className="h-5 w-5 mr-2 text-blue-400" />
                      Streak History
                    </h3>
                    
                    {streakHistory.length > 1 ? (
                      <div className="w-full h-60 mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={streakHistory}>
                            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f9fafb' }}
                              itemStyle={{ color: '#f9fafb' }}
                              labelStyle={{ color: '#f9fafb' }}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="streak" 
                              stroke="#3b82f6" 
                              strokeWidth={2} 
                              dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#1f2937' }}
                              activeDot={{ stroke: '#3b82f6', strokeWidth: 2, r: 6, fill: '#1f2937' }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-gray-400">Not enough data to show streak history</div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <PieChartIcon className="h-5 w-5 mr-2 text-blue-400" />
                        Time Analysis
                      </h3>
                      
                      {timeAnalysis.length > 0 ? (
                        <div className="space-y-4">
                          {timeAnalysis.map((period, index) => (
                            <div key={index} className="flex flex-col">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-300">{period.period}</span>
                                <span className="text-sm font-medium text-gray-300">{period.completionRate}%</span>
                              </div>
                              <AnimatedProgress 
                                value={period.completionRate} 
                                className="h-2 bg-gray-700" 
                                indicatorClassName={index === 0 ? "bg-blue-500" : index === 1 ? "bg-indigo-500" : "bg-purple-500"}
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center p-4 text-gray-400">Not enough data for time analysis</div>
                      )}
                    </div>
                    
                    <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                        Weekend vs. Weekday
                      </h3>
                      
                      {weekendVsWeekday.length > 0 ? (
                        <div className="w-full h-40">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={weekendVsWeekday}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}%`}
                                labelLine={false}
                              >
                                <Cell fill="#4f46e5" />
                                <Cell fill="#8b5cf6" />
                              </Pie>
                              <Tooltip 
                                formatter={(value) => [`${value}%`, 'Completion Rate']}
                                contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                                itemStyle={{ color: '#f9fafb' }}
                                labelStyle={{ color: '#f9fafb' }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="text-center p-4 text-gray-400">Not enough data for weekend vs. weekday analysis</div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Patterns Tab */}
                <TabsContent value="patterns" className="pt-4">
                  <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800 mb-6">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-blue-400" />
                      Day of Week Performance
                    </h3>
                    
                    {weekdayAnalysis.length > 0 ? (
                      <div className="w-full h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={weekdayAnalysis}>
                            <XAxis dataKey="day" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip 
                              formatter={(value) => [`${value}%`, 'Completion Rate']}
                              contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151' }}
                              itemStyle={{ color: '#f9fafb' }}
                              labelStyle={{ color: '#f9fafb' }}
                            />
                            <Bar 
                              dataKey="completionRate" 
                              radius={[4, 4, 0, 0]}
                              barSize={30}
                            >
                              {weekdayAnalysis.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.completionRate > 75 ? '#10b981' : entry.completionRate > 50 ? '#3b82f6' : entry.completionRate > 25 ? '#8b5cf6' : '#ef4444'} 
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-gray-400">Not enough data to analyze daily patterns</div>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-400" />
                        Completion Trend
                      </h3>
                      
                      {streaks.length > 7 ? (
                        <div className="space-y-4">
                          <div className="text-gray-400 mb-2">Recent 30-day trend compared to previous 30 days:</div>
                          {(() => {
                            // Calculate recent vs previous completion rates
                            const today = new Date();
                            const last30Days = subDays(today, 30);
                            const previous30Days = subDays(last30Days, 30);
                            
                            const recentStreaks = streaks.filter(s => 
                              isWithinInterval(new Date(s.date), { start: last30Days, end: today })
                            );
                            
                            const previousStreaks = streaks.filter(s => 
                              isWithinInterval(new Date(s.date), { start: previous30Days, end: last30Days })
                            );
                            
                            const recentCompletionRate = recentStreaks.length > 0 
                              ? Math.round((recentStreaks.filter(s => s.completed).length / recentStreaks.length) * 100) 
                              : 0;
                              
                            const previousCompletionRate = previousStreaks.length > 0 
                              ? Math.round((previousStreaks.filter(s => s.completed).length / previousStreaks.length) * 100) 
                              : 0;
                              
                            const difference = recentCompletionRate - previousCompletionRate;
                            const trendText = difference > 0 
                              ? `Improving (+${difference}%)` 
                              : difference < 0 
                                ? `Declining (${difference}%)` 
                                : "Stable (no change)";
                                
                            const trendColor = difference > 0 
                              ? "text-green-400" 
                              : difference < 0 
                                ? "text-red-400" 
                                : "text-blue-400";
                                
                            return (
                              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex items-center justify-between">
                                <div>
                                  <div className="text-sm text-gray-400">Current: {recentCompletionRate}%</div>
                                  <div className="text-sm text-gray-400">Previous: {previousCompletionRate}%</div>
                                </div>
                                <div className={`text-lg font-medium ${trendColor}`}>
                                  {trendText}
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="text-center p-4 text-gray-400">Need more data for trend analysis (at least 2 weeks)</div>
                      )}
                    </div>
                    
                    <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800">
                      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-blue-400" />
                        Consistency Score
                      </h3>
                      
                      {(() => {
                        // Calculate consistency score based on regularity and streaks
                        if (streaks.length < 7) {
                          return (
                            <div className="text-center p-4 text-gray-400">Need more data for consistency score (at least 7 days)</div>
                          );
                        }
                        
                        // Sort streaks by date
                        const sortedStreaks = [...streaks].sort((a, b) => 
                          new Date(a.date).getTime() - new Date(b.date).getTime()
                        );
                        
                        // Calculate gaps between tracking dates
                        const gaps: number[] = [];
                        for (let i = 1; i < sortedStreaks.length; i++) {
                          const currentDate = new Date(sortedStreaks[i].date);
                          const prevDate = new Date(sortedStreaks[i-1].date);
                          const gap = differenceInDays(currentDate, prevDate);
                          if (gap > 1) gaps.push(gap);
                        }
                        
                        // Calculate average gap (smaller is better)
                        const avgGap = gaps.length > 0 ? 
                          gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length : 1;
                          
                        // Calculate streak ratio (higher is better)
                        const streakRatio = currentStreak / (sortedStreaks.length / 7);
                        
                        // Calculate consistency score (0-100)
                        const gapScore = Math.max(0, 50 - (avgGap * 10));
                        const streakScore = Math.min(50, streakRatio * 10);
                        
                        const consistencyScore = Math.round(gapScore + streakScore);
                        
                        // Determine consistency level
                        let consistencyLevel = "";
                        let consistencyColor = "";
                        
                        if (consistencyScore >= 90) {
                          consistencyLevel = "Exceptional";
                          consistencyColor = "text-emerald-400";
                        } else if (consistencyScore >= 75) {
                          consistencyLevel = "Excellent";
                          consistencyColor = "text-green-400";
                        } else if (consistencyScore >= 60) {
                          consistencyLevel = "Good";
                          consistencyColor = "text-blue-400";
                        } else if (consistencyScore >= 40) {
                          consistencyLevel = "Moderate";
                          consistencyColor = "text-yellow-400";
                        } else if (consistencyScore >= 20) {
                          consistencyLevel = "Needs Improvement";
                          consistencyColor = "text-orange-400";
                        } else {
                          consistencyLevel = "Poor";
                          consistencyColor = "text-red-400";
                        }
                        
                        return (
                          <div className="flex flex-col items-center">
                            <div className="relative w-36 h-36 mb-4">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className={`text-4xl font-bold ${consistencyColor}`}>{consistencyScore}</div>
                              </div>
                              <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="none"
                                  stroke="#374151"
                                  strokeWidth="10"
                                />
                                <circle
                                  cx="50"
                                  cy="50"
                                  r="45"
                                  fill="none"
                                  stroke={consistencyColor.replace('text-', 'var(--')}
                                  strokeWidth="10"
                                  strokeDasharray={`${(consistencyScore / 100) * 283} 283`}
                                  transform="rotate(-90 50 50)"
                                  strokeLinecap="round"
                                  className="transition-all duration-1000 ease-out"
                                  style={{ 
                                    stroke: consistencyScore >= 90 ? '#10b981' : 
                                            consistencyScore >= 75 ? '#22c55e' : 
                                            consistencyScore >= 60 ? '#3b82f6' : 
                                            consistencyScore >= 40 ? '#eab308' : 
                                            consistencyScore >= 20 ? '#f97316' : '#ef4444' 
                                  }}
                                />
                              </svg>
                            </div>
                            <div className={`text-xl font-medium ${consistencyColor} mb-2`}>
                              {consistencyLevel}
                            </div>
                            <div className="text-sm text-gray-400 text-center">
                              {consistencyScore >= 75 ? 
                                "You're highly consistent with this habit!" : 
                                consistencyScore >= 40 ? 
                                "You're making good progress with consistency." : 
                                "Focus on building more consistent tracking."}
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Recommendations Tab */}
                <TabsContent value="recommendations" className="pt-4">
                  <div className="bg-gray-900/40 rounded-lg p-6 border border-gray-800">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-yellow-400" />
                      Smart Recommendations
                    </h3>
                    
                    <div className="space-y-4">
                      {getRecommendations().map((recommendation, index) => (
                        <div key={index} className="bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-start">
                            <div className="bg-gray-700 rounded-full p-1 mr-3 mt-0.5">
                              <ChevronRight className="h-4 w-4 text-blue-400" />
                            </div>
                            <p className="text-gray-300">{recommendation}</p>
                          </div>
                        </div>
                      ))}
                      
                      {streaks.length > 0 && (
                        <>
                          <Separator className="my-6 bg-gray-800" />
                          
                          <div className="bg-gray-800/60 rounded-lg p-4 border border-gray-700">
                            <h4 className="text-md font-medium text-white mb-2 flex items-center">
                              <Award className="h-4 w-4 mr-2 text-yellow-400" />
                              Ideal Target
                            </h4>
                            
                            {(() => {
                              // Calculate ideal target based on historical performance
                              const completedDays = streaks.filter(s => s.completed).length;
                              const completionPercentage = completedDays / streaks.length;
                              
                              // Current target days from habit
                              const currentTarget = selectedHabit.targetStreakDays || 7;
                              
                              // If completion rate is high, suggest a slightly higher target
                              // If it's low, suggest a lower, more achievable target
                              let idealTarget = currentTarget;
                              
                              if (completionPercentage >= 0.8 && currentStreak >= currentTarget) {
                                // Doing very well, can increase target by 30%
                                idealTarget = Math.ceil(currentTarget * 1.3);
                              } else if (completionPercentage >= 0.6) {
                                // Doing well, can slightly increase target
                                idealTarget = Math.ceil(currentTarget * 1.1);
                              } else if (completionPercentage <= 0.3 && currentTarget > 3) {
                                // Struggling, suggest an easier target
                                idealTarget = Math.max(3, Math.floor(currentTarget * 0.7));
                              }
                              
                              const targetDiff = idealTarget - currentTarget;
                              
                              return (
                                <div className="text-gray-300">
                                  {targetDiff > 0 ? (
                                    <p>Based on your performance, you could increase your target streak from {currentTarget} to {idealTarget} days. You're consistently meeting your current goal!</p>
                                  ) : targetDiff < 0 ? (
                                    <p>Consider adjusting your target streak from {currentTarget} to {idealTarget} days for now. A more achievable goal may help you build momentum.</p>
                                  ) : (
                                    <p>Your current target of {currentTarget} days seems well matched to your current performance level.</p>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          
                          <div className="bg-indigo-900/20 rounded-lg p-4 border border-indigo-800/50 mt-4">
                            <h4 className="text-md font-medium text-white mb-2 flex items-center">
                              <Info className="h-4 w-4 mr-2 text-indigo-400" />
                              Did You Know?
                            </h4>
                            <p className="text-gray-300">
                              {[
                                "Research suggests it takes an average of 66 days to form a new habit, not the commonly cited 21 days.",
                                "Missing one day doesn't significantly impact habit formation. It's consistency over time that matters most.",
                                "Morning habits tend to have higher completion rates as willpower is typically stronger earlier in the day.",
                                "Habit stacking (connecting a new habit to an existing one) can increase success rates by 70%.",
                                "The most sustainable habits start small. People who start with tiny habits are 3x more likely to maintain them."
                              ][Math.floor(Math.random() * 5)]}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </AnimatedComponent>
  );
}