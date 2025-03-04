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
import { RefreshCcw, Plus, ChevronRight, PlusCircle } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <h1 className="text-2xl font-bold text-white">2025 Goals Dashboard</h1>
              <div className="flex items-center space-x-3">
                <div className="bg-gray-900 rounded-md shadow-sm border border-green-600 p-2 hidden sm:block">
                  <span className="text-sm text-green-400">Last updated:</span>
                  <span className="text-sm font-medium text-white ml-1">{lastUpdated}</span>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleRefreshData} 
                  disabled={isRefreshing}
                  className="border-green-500 text-green-400 hover:bg-gray-800"
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
              {/* Main Goals Progress */}
              <section className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-green-400">Main Goals Progress</h2>
                  <div className="flex gap-2">
                    <Link href="/add-progress">
                      <Button variant="outline" size="sm" className="border-green-600 text-green-400">
                        <PlusCircle className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Update Progress</span>
                      </Button>
                    </Link>
                    <Link href="/add-goal">
                      <Button variant="outline" size="sm" className="border-green-600 text-green-400">
                        <Plus className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">Add Goal</span>
                      </Button>
                    </Link>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              
              {/* Metrics Dashboard */}
              <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Growth Metrics */}
                <div className="col-span-1">
                  {isLoading ? (
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-green-600 p-4 h-64 animate-pulse">
                      <div className="h-5 bg-gray-800 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="h-10 bg-gray-800 rounded w-full"></div>
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
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-green-600 p-4 h-64 animate-pulse">
                      <div className="h-5 bg-gray-800 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="h-10 bg-gray-800 rounded w-full"></div>
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
                <div className="col-span-1">
                  {isLoading ? (
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-green-600 p-4 h-64 animate-pulse">
                      <div className="h-5 bg-gray-800 rounded w-1/3 mb-4"></div>
                      <div className="space-y-3">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="h-10 bg-gray-800 rounded w-full"></div>
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
              </section>
              
              {/* Weekly Execution Tracker */}
              <section className="mb-8">
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
              </section>
            </>
          )}
          
          {/* Getting Started Resources */}
          {!isLoading && !hasAnyData && (
            <section className="mt-12">
              <h2 className="text-lg font-semibold text-green-400 mb-4">Getting Started Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-950 border border-green-800 rounded-lg p-5">
                  <h3 className="text-green-400 font-medium mb-2">Add Your First Goal</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Define your 2025 targets with measurable goals to track progress over time.
                  </p>
                  <Link href="/add-goal">
                    <Button variant="outline" size="sm" className="w-full border-green-600 text-green-400">
                      Start <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-gray-950 border border-green-800 rounded-lg p-5">
                  <h3 className="text-green-400 font-medium mb-2">Track Key Metrics</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Monitor important KPIs related to growth, revenue, and performance.
                  </p>
                  <Link href="/add-metric">
                    <Button variant="outline" size="sm" className="w-full border-green-600 text-green-400">
                      View Metrics <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="bg-gray-950 border border-green-800 rounded-lg p-5">
                  <h3 className="text-green-400 font-medium mb-2">Plan Weekly Tasks</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Break down your goals into actionable weekly tasks for execution tracking.
                  </p>
                  <Link href="/add-task">
                    <Button variant="outline" size="sm" className="w-full border-green-600 text-green-400">
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
