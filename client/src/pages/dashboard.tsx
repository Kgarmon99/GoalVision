import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { GoalProgressCard } from "@/components/goal-progress-card";
import MetricsCard from "@/components/metrics-card";
import StatusIndicator from "@/components/status-indicator";
import WeeklyExecutionTracker from "@/components/weekly-execution-tracker";
import { ResetDataDialog } from "@/components/reset-data-dialog";
import { QuickStartGuide } from "@/components/quick-start-guide";
import { EmptyState, NoDataEmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  RefreshCcw, 
  Plus, 
  ChevronRight, 
  PlusCircle, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Target, 
  Rocket,
  ArrowUpRight,
  Users,
  Award,
  CheckCircle
} from "lucide-react";
import { useState, useEffect } from "react";
import { Goal, Metric, GoalStatus, ExecutionTask, Week } from "@shared/schema";
import { format } from "date-fns";
import { Link } from "wouter";

const Dashboard = () => {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(format(new Date(), "MMMM d, yyyy 'at' h:mm a"));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentWeekId, setCurrentWeekId] = useState<number | null>(null);
  const [shouldShowQuickStart, setShouldShowQuickStart] = useState(false);
  
  // Fetch goals
  const { 
    data: goals = [], 
    isLoading: isLoadingGoals,
    refetch: refetchGoals
  } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Fetch growth metrics
  const { 
    data: growthMetrics = [], 
    isLoading: isLoadingGrowthMetrics,
    refetch: refetchGrowthMetrics
  } = useQuery<Metric[]>({
    queryKey: ['/api/metrics/category/growth'],
  });
  
  // Fetch revenue metrics
  const { 
    data: revenueMetrics = [], 
    isLoading: isLoadingRevenueMetrics,
    refetch: refetchRevenueMetrics
  } = useQuery<Metric[]>({
    queryKey: ['/api/metrics/category/revenue'],
  });
  
  // Fetch goal statuses
  const { 
    data: goalStatuses = [], 
    isLoading: isLoadingGoalStatuses,
    refetch: refetchGoalStatuses
  } = useQuery<GoalStatus[]>({
    queryKey: ['/api/goal-statuses'],
  });
  
  // Fetch all weeks
  const { 
    data: weeks = [], 
    isLoading: isLoadingWeeks,
    refetch: refetchWeeks
  } = useQuery<Week[]>({
    queryKey: ['/api/weeks'],
  });
  
  // Determine current week ID from weeks data
  useEffect(() => {
    if (weeks && weeks.length > 0 && !currentWeekId) {
      setCurrentWeekId(weeks[0].id);
    }
    
    // Check if we should show the quick start guide
    // Show when data has been reset (no goals, no weeks)
    if (!isLoadingGoals && !isLoadingWeeks && goals.length === 0 && weeks.length === 0) {
      setShouldShowQuickStart(true);
    } else {
      setShouldShowQuickStart(false);
    }
  }, [weeks, currentWeekId, isLoadingGoals, isLoadingWeeks, goals]);
  
  // Fetch current week (only if currentWeekId is set)
  const { 
    data: currentWeek,
    isLoading: isLoadingWeek,
    refetch: refetchWeek
  } = useQuery<Week>({
    queryKey: ['/api/weeks', currentWeekId],
    enabled: !!currentWeekId,
  });
  
  // Fetch tasks for current week
  const { 
    data: weekTasks = [], 
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
    error: tasksError
  } = useQuery<ExecutionTask[]>({
    queryKey: ['/api/tasks/week', currentWeekId],
    enabled: !!currentWeekId,
  });
  
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        refetchGoals(), 
        refetchGrowthMetrics(), 
        refetchRevenueMetrics(), 
        refetchGoalStatuses(),
        refetchWeeks(),
        ...(currentWeekId ? [refetchWeek(), refetchTasks()] : []),
      ]);
      
      setLastUpdated(format(new Date(), "MMMM d, yyyy 'at' h:mm a"));
      
      toast({
        title: "Data refreshed",
        description: "Dashboard data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error refreshing data",
        description: "There was a problem updating the dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const handlePreviousWeek = () => {
    if (weeks.length > 0 && currentWeekId) {
      const currentIndex = weeks.findIndex(week => week.id === currentWeekId);
      if (currentIndex > 0) {
        setCurrentWeekId(weeks[currentIndex - 1].id);
      }
    }
  };
  
  const handleNextWeek = () => {
    if (weeks.length > 0 && currentWeekId) {
      const currentIndex = weeks.findIndex(week => week.id === currentWeekId);
      if (currentIndex < weeks.length - 1) {
        setCurrentWeekId(weeks[currentIndex + 1].id);
      }
    }
  };
  
  const isLoading = 
    isLoadingGoals || 
    isLoadingGrowthMetrics || 
    isLoadingRevenueMetrics || 
    isLoadingGoalStatuses || 
    isLoadingWeeks ||
    (currentWeekId && (isLoadingWeek || isLoadingTasks));
  
  // Check if there's any data to display
  const hasAnyData = goals.length > 0 || growthMetrics.length > 0 || revenueMetrics.length > 0 || weeks.length > 0;
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.15),rgba(0,0,0,0)_50%)]"></div>
      <Header />
      
      <main className="flex-1 py-6 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <Rocket className="h-8 w-8 mr-3 text-green-400 animate-float" />
                <h1 className="text-3xl font-bold text-white text-glow">2025 Goals Dashboard</h1>
              </div>
              <div className="flex items-center space-x-3">
                <div className="bg-gray-900/80 rounded-md shadow-sm border border-green-600 p-2 hidden sm:block gradient-border">
                  <span className="text-sm text-green-400">Last updated:</span>
                  <span className="text-sm font-medium text-white ml-1">{lastUpdated}</span>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleRefreshData} 
                  disabled={isRefreshing}
                  className="border-green-500 text-green-400 hover:bg-gray-800 hover:border-green-400 transition-colors"
                >
                  {isRefreshing ? (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-1 animate-spin" />
                      <span className="hidden sm:inline">Refreshing...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Refresh</span>
                    </>
                  )}
                </Button>
                <ResetDataDialog />
              </div>
            </div>
          </div>
          
          {/* Quick Start Guide - only show when data is empty */}
          {shouldShowQuickStart && (
            <QuickStartGuide />
          )}
          
          {/* No Data State */}
          {!isLoading && !hasAnyData && !shouldShowQuickStart && (
            <NoDataEmptyState />
          )}
          
          {/* Main Dashboard Content */}
          {(isLoading || hasAnyData) && (
            <>
              {/* Action Bar */}
              <div className="mb-8 bg-gray-900/80 rounded-lg border border-green-600 p-4 gradient-border flex flex-wrap gap-4 justify-between items-center">
                <div className="flex items-center">
                  <Target className="h-6 w-6 mr-2 text-green-400" />
                  <h2 className="text-lg font-semibold text-green-400 text-glow">2025 Goals Tracker</h2>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Link href="/add-progress">
                    <Button variant="outline" size="sm" className="border-green-600 text-green-400 hover:bg-gray-800 hover:border-green-400 group">
                      <PlusCircle className="h-4 w-4 mr-2 group-hover:text-white transition-colors" />
                      <span>Update Progress</span>
                    </Button>
                  </Link>
                  <Link href="/add-goal">
                    <Button variant="outline" size="sm" className="border-green-600 text-green-400 hover:bg-gray-800 hover:border-green-400 group">
                      <Plus className="h-4 w-4 mr-2 group-hover:text-white transition-colors" />
                      <span>Add Goal</span>
                    </Button>
                  </Link>
                  <Link href="/add-task">
                    <Button size="sm" className="bg-green-600 text-white hover:bg-green-700">
                      <Rocket className="h-4 w-4 mr-2" />
                      <span>Track Execution</span>
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Main Goals Progress */}
              <section className="mb-8">
                <div className="flex flex-col xs:flex-row justify-between xs:items-center gap-3 xs:gap-0 mb-4">
                  <h2 className="text-xl font-semibold text-green-400 text-glow flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Main Goals Progress
                  </h2>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((_, index) => (
                      <div key={index} className="bg-gray-900 rounded-lg shadow-sm border border-green-600 p-4 h-32 animate-pulse">
                        <div className="h-4 bg-gray-800 rounded w-1/4 mb-2"></div>
                        <div className="h-8 bg-gray-800 rounded w-1/2 mb-1"></div>
                        <div className="h-4 bg-gray-800 rounded w-1/3 mb-4"></div>
                        <div className="h-2 bg-gray-800 rounded w-full"></div>
                      </div>
                    ))}
                  </div>
                ) : goals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {goals.map(goal => (
                      <GoalProgressCard key={goal.id} goal={goal} />
                    ))}
                  </div>
                ) : (
                  <EmptyState 
                    title="No Goals Yet" 
                    description="Add your first 2025 goal to start tracking your progress"
                    icon="chart"
                    addLink="/add-goal"
                    addText="Add Your First Goal"
                  />
                )}
              </section>
              
              {/* Dashboard Tabs - Metrics and Execution */}
              <Tabs defaultValue="metrics" className="w-full mb-8">
                <TabsList className="w-full justify-start mb-6 bg-gray-900/70 border border-green-800 rounded-lg overflow-hidden p-1">
                  <TabsTrigger value="metrics" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Metrics Dashboard
                  </TabsTrigger>
                  <TabsTrigger value="execution" className="data-[state=active]:bg-gray-800 data-[state=active]:text-green-400">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Execution Tracker
                  </TabsTrigger>
                </TabsList>
                
                {/* Metrics Tab Content */}
                <TabsContent value="metrics" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Growth Metrics */}
                    <div className="col-span-1">
                      {isLoading ? (
                        <div className="bg-gray-900 rounded-lg shadow-sm border border-green-600 p-3 sm:p-4 h-48 sm:h-64 animate-pulse">
                          <div className="h-5 bg-gray-800 rounded w-1/3 mb-4"></div>
                          <div className="space-y-3">
                            {[1, 2, 3].map((_, i) => (
                              <div key={i} className="h-8 bg-gray-800 rounded w-full"></div>
                            ))}
                          </div>
                        </div>
                      ) : growthMetrics.length > 0 ? (
                        <MetricsCard title="Growth Metrics" metrics={growthMetrics} />
                      ) : (
                        <EmptyState 
                          title="No Growth Metrics" 
                          description="Add metrics to track growth KPIs"
                          icon="chart"
                          className="h-full"
                        />
                      )}
                    </div>
                    
                    {/* Revenue Metrics */}
                    <div className="col-span-1">
                      {isLoading ? (
                        <div className="bg-gray-900 rounded-lg shadow-sm border border-green-600 p-3 sm:p-4 h-48 sm:h-64 animate-pulse">
                          <div className="h-5 bg-gray-800 rounded w-1/3 mb-4"></div>
                          <div className="space-y-3">
                            {[1, 2, 3].map((_, i) => (
                              <div key={i} className="h-8 bg-gray-800 rounded w-full"></div>
                            ))}
                          </div>
                        </div>
                      ) : revenueMetrics.length > 0 ? (
                        <MetricsCard title="Revenue Metrics" metrics={revenueMetrics} />
                      ) : (
                        <EmptyState 
                          title="No Revenue Metrics" 
                          description="Add metrics to track revenue KPIs"
                          icon="chart"
                          className="h-full"
                        />
                      )}
                    </div>
                    
                    {/* Status Indicators */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-1">
                      {isLoading ? (
                        <div className="bg-gray-900 rounded-lg shadow-sm border border-green-600 p-3 sm:p-4 h-48 sm:h-64 animate-pulse">
                          <div className="h-5 bg-gray-800 rounded w-1/3 mb-4"></div>
                          <div className="space-y-3">
                            {[1, 2, 3].map((_, i) => (
                              <div key={i} className="h-8 bg-gray-800 rounded w-full"></div>
                            ))}
                          </div>
                        </div>
                      ) : goalStatuses.length > 0 ? (
                        <StatusIndicator statuses={goalStatuses} />
                      ) : (
                        <EmptyState 
                          title="No Goal Statuses" 
                          description="Goal statuses will appear here when you add goals"
                          icon="chart"
                          className="h-full"
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>
                
                {/* Execution Tab Content */}
                <TabsContent value="execution" className="mt-0">
                  {isLoading ? (
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-green-600 p-4 h-96 animate-pulse">
                      <div className="h-5 bg-gray-800 rounded w-1/3 mb-4"></div>
                      <div className="flex justify-between mb-6">
                        <div className="h-8 bg-gray-800 rounded w-1/4"></div>
                        <div className="h-8 bg-gray-800 rounded w-1/4"></div>
                      </div>
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((_, i) => (
                          <div key={i} className="h-14 bg-gray-800 rounded w-full"></div>
                        ))}
                      </div>
                    </div>
                  ) : currentWeek ? (
                    <WeeklyExecutionTracker 
                      tasks={weekTasks} 
                      week={currentWeek}
                      onPreviousWeek={handlePreviousWeek}
                      onNextWeek={handleNextWeek}
                    />
                  ) : weeks.length > 0 ? (
                    <div className="bg-gray-950 border border-green-800 rounded-lg p-6">
                      <h2 className="text-lg font-semibold text-green-400 mb-4">Weekly Execution Tracker</h2>
                      <p className="text-gray-400 mb-4">Error loading the current week's data. Please try refreshing the page.</p>
                      <Button onClick={handleRefreshData} variant="outline" className="border-green-600 text-green-400">
                        <RefreshCcw className="h-4 w-4 mr-2" /> Refresh Data
                      </Button>
                    </div>
                  ) : (
                    <EmptyState 
                      title="No Weekly Planning" 
                      description="Add your first week and tasks to track weekly execution"
                      icon="chart"
                      addLink="/add-task"
                      addText="Add Weekly Planning"
                    />
                  )}
                </TabsContent>
              </Tabs>
              
              {/* Quick Stats Cards */}
              {!isLoading && goals.length > 0 && (
                <section className="mb-8">
                  <h2 className="text-xl font-semibold text-green-400 text-glow flex items-center mb-4">
                    <Award className="h-5 w-5 mr-2" />
                    Achievement Stats
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gray-900/70 border border-green-600 glow-card">
                      <CardContent className="p-4 flex items-center">
                        <div className="mr-4 bg-green-900/50 p-3 rounded-full glow-element">
                          <Target className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Total Goals</p>
                          <p className="text-2xl font-bold text-white">{goals.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-900/70 border border-green-600 glow-card">
                      <CardContent className="p-4 flex items-center">
                        <div className="mr-4 bg-green-900/50 p-3 rounded-full glow-element">
                          <TrendingUp className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Avg Completion</p>
                          <p className="text-2xl font-bold text-white">
                            {Math.round(goals.reduce((acc, goal) => 
                              acc + Math.min(Math.round((goal.current / goal.target) * 100), 100), 0) / goals.length)}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-900/70 border border-green-600 glow-card">
                      <CardContent className="p-4 flex items-center">
                        <div className="mr-4 bg-green-900/50 p-3 rounded-full glow-element">
                          <CheckCircle className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">On Track Goals</p>
                          <p className="text-2xl font-bold text-white">
                            {goalStatuses.filter(status => status.status === "on-track").length}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-900/70 border border-green-600 glow-card">
                      <CardContent className="p-4 flex items-center">
                        <div className="mr-4 bg-green-900/50 p-3 rounded-full glow-element">
                          <Users className="h-6 w-6 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">Weekly Tasks</p>
                          <p className="text-2xl font-bold text-white">
                            {weekTasks.length}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </section>
              )}
            </>
          )}
          
          {/* Getting Started Resources */}
          {!isLoading && !hasAnyData && (
            <section className="mt-12">
              <h2 className="text-lg font-semibold text-green-400 text-glow mb-4">Getting Started Resources</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-gray-950 border border-green-800 rounded-lg p-4 sm:p-5 glow-card">
                  <h3 className="text-green-400 font-medium mb-2 text-glow-sm">Add Your First Goal</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Define your 2025 targets with measurable goals to track progress over time.
                  </p>
                  <Link href="/add-goal">
                    <Button variant="outline" size="sm" className="w-full border-green-600 text-green-400 glow-button">
                      Start <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-gray-950 border border-green-800 rounded-lg p-4 sm:p-5 glow-card">
                  <h3 className="text-green-400 font-medium mb-2 text-glow-sm">Track Key Metrics</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Monitor important KPIs related to growth, revenue, and performance.
                  </p>
                  <Link href="/add-metric">
                    <Button variant="outline" size="sm" className="w-full border-green-600 text-green-400 glow-button">
                      View Metrics <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-gray-950 border border-green-800 rounded-lg p-4 sm:p-5 sm:col-span-2 lg:col-span-1 glow-card">
                  <h3 className="text-green-400 font-medium mb-2 text-glow-sm">Plan Weekly Tasks</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Break down your goals into actionable weekly tasks for execution tracking.
                  </p>
                  <Link href="/add-task">
                    <Button variant="outline" size="sm" className="w-full border-green-600 text-green-400 glow-button">
                      Add Tasks <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
