import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { GoalProgressCard } from "@/components/goal-progress-card";
import MetricsCard from "@/components/metrics-card";
import StatusIndicator from "@/components/status-indicator";
import WeeklyExecutionTracker from "@/components/weekly-execution-tracker";
import { ResetDataDialog } from "@/components/reset-data-dialog";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Goal, Metric, GoalStatus, ExecutionTask, Week } from "@shared/schema";
import { format } from "date-fns";

const Dashboard = () => {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(format(new Date(), "MMMM d, yyyy 'at' h:mm a"));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentWeekId, setCurrentWeekId] = useState(1);
  
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
  
  // Fetch current week
  const { 
    data: currentWeek,
    isLoading: isLoadingWeek,
    refetch: refetchWeek
  } = useQuery<Week>({
    queryKey: ['/api/weeks', currentWeekId],
  });
  
  // Fetch tasks for current week
  const { 
    data: weekTasks = [], 
    isLoading: isLoadingTasks,
    refetch: refetchTasks
  } = useQuery<ExecutionTask[]>({
    queryKey: ['/api/tasks/week', currentWeekId],
    enabled: !!currentWeekId,
  });
  
  // Fetch all weeks
  const { 
    data: weeks = [], 
    isLoading: isLoadingWeeks
  } = useQuery<Week[]>({
    queryKey: ['/api/weeks'],
  });
  
  const handleRefreshData = async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        refetchGoals(), 
        refetchGrowthMetrics(), 
        refetchRevenueMetrics(), 
        refetchGoalStatuses(),
        refetchWeek(),
        refetchTasks()
      ]);
      
      setLastUpdated(format(new Date(), "MMMM d, yyyy 'at' h:mm a"));
      
      toast({
        title: "Data refreshed",
        description: "Dashboard data has been updated successfully.",
        variant: "default",
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
    if (weeks.length > 0) {
      const currentIndex = weeks.findIndex(week => week.id === currentWeekId);
      if (currentIndex > 0) {
        setCurrentWeekId(weeks[currentIndex - 1].id);
      }
    }
  };
  
  const handleNextWeek = () => {
    if (weeks.length > 0) {
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
    isLoadingWeek || 
    isLoadingTasks ||
    isLoadingWeeks;
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Header />
      
      <main className="flex-1 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Dashboard Overview</h1>
              <div className="flex items-center space-x-3">
                <div className="bg-gray-900 rounded-md shadow-sm border border-green-600 p-2">
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
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="h-4 w-4 mr-1" />
                      Refresh
                    </>
                  )}
                </Button>
                <ResetDataDialog />
              </div>
            </div>
          </div>
          
          {/* Main Goals Progress */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-green-400 mb-4">Main Goals Progress</h2>
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
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {goals.map(goal => (
                  <GoalProgressCard key={goal.id} goal={goal} />
                ))}
              </div>
            )}
          </section>
          
          {/* Metrics Dashboard */}
          <section className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Growth Metrics */}
            <div className="col-span-1">
              <MetricsCard title="Growth Metrics" metrics={growthMetrics} />
            </div>
            
            {/* Revenue Metrics */}
            <div className="col-span-1">
              <MetricsCard title="Revenue Metrics" metrics={revenueMetrics} />
            </div>
            
            {/* Status Indicators */}
            <div className="col-span-1">
              <StatusIndicator statuses={goalStatuses} />
            </div>
          </section>
          
          {/* Weekly Execution Tracker */}
          <section className="mb-8">
            {currentWeek && (
              <WeeklyExecutionTracker 
                tasks={weekTasks} 
                week={currentWeek}
                onPreviousWeek={handlePreviousWeek}
                onNextWeek={handleNextWeek}
              />
            )}
          </section>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
