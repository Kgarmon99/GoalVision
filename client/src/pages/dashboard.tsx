import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { ChartBarIcon, PlusIcon, SparklesIcon } from "@heroicons/react/24/outline"; // Added SparklesIcon import
import Link from 'next/link'; // Assuming Next.js Link component is used


const Dashboard = () => {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(format(new Date(), "MMMM d, yyyy 'at' h:mm a"));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentWeekId, setCurrentWeekId] = useState(1);

  const queryClient = useQueryClient();

  // Fetch goals
  const { 
    data: goals = [], 
    isLoading: isLoadingGoals,
    refetch: refetchGoals
  } = useQuery({
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

  const addPresetGoalsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/goals/presets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to add goals");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/goals"] });
      toast({
        title: "Success",
        description: "All 2025 goals added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add goals",
        variant: "destructive",
      });
    },
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

  const buttonVariants = ({ variant }: { variant?: 'outline' | 'default' }) => {
    return `
      inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${variant === 'outline' ? 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50' : ''}
    `;
  };


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
            {goals.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <h3 className="text-lg font-medium mb-2">No Goals Found</h3>
                <p className="text-gray-500 mb-4 text-center">You haven't added any goals yet. Get started by adding your 2025 goals.</p>
                <Button 
                  onClick={() => addPresetGoalsMutation.mutate()} 
                  disabled={addPresetGoalsMutation.isPending}
                >
                  {addPresetGoalsMutation.isPending ? "Adding Goals..." : "Add 2025 Goals"}
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {goals.map((goal) => (
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
          <div className="mt-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h2 className="text-base font-semibold leading-6 text-gray-900">This Week's Execution</h2>
                <p className="mt-2 text-sm text-gray-500">A list of all tasks for this week grouped by goal category.</p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 flex gap-2">
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/goals/custom', { method: 'POST' });
                      toast({
                        title: "Success",
                        description: "Your custom goals have been added!",
                      });
                      // Refresh the data
                      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/goal-statuses'] });
                      queryClient.invalidateQueries({ queryKey: ['/api/tasks/week'] });
                    } catch (error) {
                      toast({
                        title: "Error",
                        description: "Failed to add custom goals. Please try again.",
                        variant: "destructive",
                      });
                    }
                  }}
                  className={buttonVariants({ variant: "default" })}
                >
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  Add My Goals
                </button>
                <Link
                  to="/add-task"
                  className={buttonVariants({ variant: "outline" })}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Task
                </Link>
                <Link
                  to="/add-metric"
                  className={buttonVariants()}
                >
                  <ChartBarIcon className="h-4 w-4 mr-1" />
                  Add Metric
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;