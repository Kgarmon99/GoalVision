import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SimpleNav } from "@/components/layout/simple-nav";
import { GoalProgressCard } from "@/components/goal-progress-card";
import MetricsCard from "@/components/metrics-card";
import StatusIndicator from "@/components/status-indicator";
import WeeklyExecutionTracker from "@/components/weekly-execution-tracker";
import { MetricsDashboard } from "@/components/metrics-dashboard";
import { UserPhotoAvatar } from "@/components/user-photo-avatar";

import { QuickStartGuide } from "@/components/quick-start-guide";
import { EmptyState, NoDataEmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { AnimatedButton } from "@/components/ui/animated-button";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { AnimatedNotification } from "@/components/ui/animated-notification";
import { Animated3DBackground } from "@/components/ui/animated-3d-background";
import { ParticleEffect } from "@/components/ui/particle-effect";
import { CursorEffect } from "@/components/ui/cursor-effect";
import { XPBar, StatusBar, GameButton, QuestItem, Celebration } from "@/components/game-elements";
import "@/components/ui/glow-effects.css";
import { 
  RefreshCcw, 
  Plus, 
  ChevronRight, 
  PlusCircle, 
  Calendar,
  ListCheck as ListTodo,
  BarChart3,
  Award,
  CheckCircle,
  TrendingUp, 
  DollarSign, 
  Target, 
  Rocket,
  ArrowUpRight,
  Users,
  Star,
  Sparkles,
  Flame,
  Trophy,
  Heart,
  Clock,
  AlertCircle,
  TrendingDown
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Goal, Metric, GoalStatus, ExecutionTask, Week } from "@shared/schema";
import { format } from "date-fns";
import { formatDate, getDaysUntilDescription, getUrgencyLevel } from "@/utils/date-utils";
import { Link } from "wouter";

// Memoized stat card component to prevent unnecessary re-renders
interface StatCardProps {
  icon: React.ReactNode;
  value: number | string;
  label: string;
  delay: number;
}

const StatCard = memo(({ icon, value, label, delay }: StatCardProps) => (
  <motion.div 
    className="bg-card rounded-lg border border-border shadow-sm p-4 flex flex-col items-center"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
  >
    <div className="text-primary mb-2 bg-primary/10 p-3 rounded-full">
      {icon}
    </div>
    <h3 className="text-2xl font-bold">{value}</h3>
    <p className="text-muted-foreground text-sm">{label}</p>
  </motion.div>
));

// Memoized action bar to prevent unnecessary re-renders
const ActionBar = memo(() => {
  // State to control animation type
  const [photoAnimation, setPhotoAnimation] = useState<"float" | "pulse" | "spin" | "glow" | "morph" | "bounce">("float");
  const [showNotification, setShowNotification] = useState(false);
  const [notificationKey, setNotificationKey] = useState(0);
  const [showParticles, setShowParticles] = useState(false);
  const [particleType, setParticleType] = useState<"confetti" | "sparkles" | "bubbles" | "atoms">("sparkles");
  
  // Animation name mapping for display
  const animationNames = {
    float: "Floating",
    pulse: "Pulsing",
    spin: "Spinning",
    glow: "Glowing",
    morph: "Morphing",
    bounce: "Bouncing"
  };
  
  // Cycle through animations on click
  const cycleAnimation = () => {
    const animations: Array<"float" | "pulse" | "spin" | "glow" | "morph" | "bounce"> = ["float", "pulse", "spin", "glow", "morph", "bounce"];
    const currentIndex = animations.indexOf(photoAnimation);
    const nextIndex = (currentIndex + 1) % animations.length;
    const newAnimation = animations[nextIndex];
    
    setPhotoAnimation(newAnimation);
    setShowNotification(true);
    setNotificationKey(prevKey => prevKey + 1);
    
    // Show particles for a short duration
    setParticleType(getParticleTypeForAnimation(newAnimation));
    setShowParticles(true);
    setTimeout(() => {
      setShowParticles(false);
    }, 2000);
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };
  
  // Get particle type based on animation
  const getParticleTypeForAnimation = (animation: "float" | "pulse" | "spin" | "glow" | "morph" | "bounce"): "confetti" | "sparkles" | "bubbles" | "atoms" => {
    switch(animation) {
      case "float":
        return "bubbles";
      case "pulse":
        return "atoms";
      case "spin":
        return "confetti";
      case "glow":
        return "sparkles";
      case "morph":
        return "atoms";
      case "bounce":
        return "confetti";
      default:
        return "sparkles";
    }
  };
  
  // Get particle colors based on animation
  const getParticleColors = (): string[] => {
    switch(photoAnimation) {
      case "float":
        return ["#10b981", "#34d399", "#6ee7b7", "#a7f3d0"];
      case "pulse":
        return ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe"];
      case "spin":
        return ["#f59e0b", "#fbbf24", "#fcd34d", "#fef3c7"];
      case "glow":
        return ["#10b981", "#34d399", "#047857", "#a7f3d0"];
      case "morph":
        return ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ddd6fe"];
      case "bounce":
        return ["#ec4899", "#f472b6", "#f9a8d4", "#fbcfe8"];
      default:
        return ["#10b981", "#3b82f6", "#ec4899", "#f59e0b"];
    }
  };
  
  // Select appropriate notification type based on animation
  const getNotificationType = (): "success" | "info" | "warning" | "error" => {
    switch(photoAnimation) {
      case "float":
      case "glow":
        return "success";
      case "pulse":
      case "morph":
        return "info";
      case "spin":
        return "warning";
      case "bounce":
        return "success";
      default:
        return "info";
    }
  };
  
  return (
    <>
      <motion.div 
        className="mb-6 bg-card rounded-lg border border-border shadow-sm p-4 flex flex-wrap gap-4 justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center relative">
          {/* Particle effects around the avatar */}
          {showParticles && (
            <div className="absolute -inset-2 z-10">
              <ParticleEffect
                type={particleType}
                count={30}
                colors={getParticleColors()}
                autoPlay={true}
                duration={2000}
                speed={1.5}
                particleSize={[3, 8]}
              />
            </div>
          )}
          
          <UserPhotoAvatar 
            size="md" 
            imagePath="/user.jpeg"
            animation={photoAnimation} 
            className="mr-3 z-20 relative"
            onClick={cycleAnimation}
            withBorder={true}
            borderColor="border-green-400"
            withShadow={true}
          />
          <div>
            <h2 className="text-lg font-semibold">2025 Goals Tracker</h2>
            <p className="text-xs text-muted-foreground">Your personal achievement dashboard</p>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap">
          <AnimatedTooltip content="Update your progress on existing goals" position="bottom">
            <Link href="/add-progress">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Update Progress
              </Button>
            </Link>
          </AnimatedTooltip>
          <AnimatedTooltip content="Add a new goal to track" position="bottom">
            <Link href="/add-goal">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            </Link>
          </AnimatedTooltip>
          <AnimatedTooltip content="Track your execution tasks" position="bottom">
            <Link href="/add-task">
              <Button 
                size="sm" 
                className="gap-2"
              >
                <Rocket className="h-4 w-4" />
                Track Execution
              </Button>
            </Link>
          </AnimatedTooltip>
        </div>
      </motion.div>
      
      {/* Animated notification for animation changes */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50">
          <AnimatedNotification
            key={notificationKey}
            type={getNotificationType()}
            title={`Animation: ${animationNames[photoAnimation]}`}
            message="Click on your photo to try more animations!"
            duration={3000}
            position="top-right"
            showIcon={true}
            onClose={() => setShowNotification(false)}
          />
        </div>
      )}
    </>
  );
});

// Loading skeletons for goals and metrics as memoized components
const GoalsSkeleton = memo(() => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((_, index) => (
      <div key={index} className="bg-card rounded-lg shadow-sm border border-border p-4 h-32 animate-pulse">
        <div className="h-4 bg-muted rounded w-1/4 mb-2"></div>
        <div className="h-8 bg-muted rounded w-1/2 mb-1"></div>
        <div className="h-4 bg-muted rounded w-1/3 mb-4"></div>
        <div className="h-2 bg-muted rounded w-full"></div>
      </div>
    ))}
  </div>
));

// Memoized goals grid component
interface GoalsGridProps {
  goals: Goal[];
}

const GoalCard = memo(({ goal }: { goal: Goal }) => {
  // Calculate percentage complete
  const percentComplete = Math.min(Math.round((goal.current / goal.target) * 100), 100);
  
  // Format values with units
  const formatValue = (value: number, unit: string | null) => {
    if (unit === "M") {
      return `$${value}M`;
    } else if (unit === "K") {
      return `$${value}K`;
    } else {
      return value.toLocaleString();
    }
  };
  
  // Calculate remaining amount
  const remaining = goal.target - goal.current;
  
  // Get background style based on progress
  const getBackgroundStyle = (percent: number) => {
    if (percent >= 100) return "bg-primary/10 border-primary/40";
    if (percent >= 75) return "bg-primary/5 border-primary/30";
    if (percent >= 50) return "bg-orange-500/5 border-orange-500/30";
    if (percent >= 25) return "bg-orange-700/5 border-orange-700/30";
    return "bg-red-900/5 border-red-900/30";
  };
  
  // Get progress color
  const getProgressColor = (percent: number) => {
    if (percent >= 75) return "bg-primary";
    if (percent >= 50) return "bg-yellow-500";
    if (percent >= 25) return "bg-orange-500";
    return "bg-red-600";
  };
  
  // Get text describing urgency/status
  const getStatusText = () => {
    if (percentComplete >= 100) return { text: "Completed", color: "text-primary" };
    
    if (goal.deadline) {
      const urgency = getUrgencyLevel(goal.deadline);
      if (urgency === 'high') {
        return { text: "Urgent", color: "text-red-500" };
      } else if (urgency === 'medium') {
        return { text: "Approaching deadline", color: "text-yellow-500" };
      }
    }
    
    if (percentComplete < 25) return { text: "Off track", color: "text-red-500" };
    if (percentComplete < 50) return { text: "Needs attention", color: "text-orange-500" };
    if (percentComplete < 75) return { text: "On track", color: "text-yellow-500" };
    
    return { text: "Almost there", color: "text-primary" };
  };
  
  const status = getStatusText();
  
  return (
    <Link href={`/add-progress?goalId=${goal.id}`} className="block">
      <Card className={`bg-card hover:shadow-xl transition-all duration-300 cursor-pointer ${getBackgroundStyle(percentComplete)} border`}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex flex-col justify-between gap-2">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <p className="text-sm font-medium">{goal.name}</p>
                  {percentComplete >= 100 ? (
                    <Award className="h-3 w-3 text-yellow-400 ml-1" />
                  ) : (
                    <Target className="h-3 w-3 text-primary ml-1" />
                  )}
                </div>
                <div className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  percentComplete >= 75 ? "bg-primary/20 text-primary" :
                  percentComplete >= 50 ? "bg-yellow-500/20 text-yellow-500" :
                  percentComplete >= 25 ? "bg-orange-500/20 text-orange-500" :
                  "bg-red-600/20 text-red-600"
                }`}>
                  {percentComplete}%
                </div>
              </div>
              
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-xl font-bold">
                  {formatValue(goal.current, goal.unit)}
                </p>
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground">
                    of {formatValue(goal.target, goal.unit)}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {remaining > 0 ? `${formatValue(remaining, goal.unit)} remaining` : "Target achieved!"}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-2">
              <div className="relative">
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${getProgressColor(percentComplete)}`}
                    style={{ width: `${percentComplete}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="mt-3 flex items-center justify-between text-xs">
              <div className={`flex items-center gap-1 ${status.color}`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {status.text}
              </div>
              
              {goal.deadline && (
                <div className="flex items-center gap-1">
                  <Clock className={`h-3.5 w-3.5 ${
                    getUrgencyLevel(goal.deadline) === 'high' ? 'text-red-500' : 
                    getUrgencyLevel(goal.deadline) === 'medium' ? 'text-yellow-500' : 
                    'text-green-500'
                  }`} />
                  <span className="text-muted-foreground">
                    {formatDate(goal.deadline)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

const GoalsGrid = memo(({ goals }: GoalsGridProps) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {goals.map(goal => (
      <GoalProgressCard key={goal.id} goal={goal} />
    ))}
  </div>
));

// Memoized metrics grid component
interface MetricsGridProps {
  metrics: Metric[];
  title: string;
  category: string;
}

const MetricsGrid = memo(({ metrics, title, category }: MetricsGridProps) => (
  <MetricsCard title={title} metrics={metrics} category={category} />
));

// Burn Rate Card Component
interface BurnRateCardProps {
  monthlyRate: number;
}

const BurnRateCard = memo(({ monthlyRate }: BurnRateCardProps) => {
  // Calculate derived values
  const weeklyRate = (monthlyRate / 4).toFixed(2);
  const dailyRate = (monthlyRate / 30).toFixed(2);
  
  // Calculate yearly rate
  const yearlyRate = monthlyRate * 12;
  
  return (
    <motion.div 
      className="mb-8 bg-card rounded-lg border p-6 shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center mb-5">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="bg-red-500/20 p-3 rounded-full mr-4">
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Revenue Targets</h3>
            <p className="text-sm text-muted-foreground max-w-md">Minimum revenue needed to exceed expenses</p>
          </div>
        </div>
        <div className="ml-auto mt-2 sm:mt-0 flex items-center">
          <div className="bg-amber-500/10 py-1 px-3 rounded-full flex items-center">
            <AlertCircle className="h-4 w-4 text-amber-500 mr-1.5" />
            <span className="text-xs font-medium text-amber-500">Critical for business growth</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex flex-col items-center mb-3">
              <p className="text-muted-foreground text-sm font-medium">Yearly</p>
              <p className="text-2xl font-bold mt-1">${yearlyRate.toLocaleString()}</p>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ width: '100%' }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Annual revenue target</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex flex-col items-center mb-3">
              <p className="text-muted-foreground text-sm font-medium">Monthly</p>
              <p className="text-2xl font-bold mt-1">${monthlyRate.toLocaleString()}</p>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-500"
                style={{ width: '100%' }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Monthly revenue target</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex flex-col items-center mb-3">
              <p className="text-muted-foreground text-sm font-medium">Weekly</p>
              <p className="text-2xl font-bold mt-1">${weeklyRate}</p>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500"
                style={{ width: '75%' }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Weekly revenue target</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card border hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex flex-col items-center">
            <div className="flex flex-col items-center mb-3">
              <p className="text-muted-foreground text-sm font-medium">Daily</p>
              <p className="text-2xl font-bold mt-1">${dailyRate}</p>
            </div>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-amber-500"
                style={{ width: '50%' }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Daily revenue target</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Business Growth Strategy</p>
            <p className="text-sm text-muted-foreground">Focus on exceeding these targets consistently to achieve sustainable growth and profitability.</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

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
  
  // Memoize handlers to avoid unnecessary re-renders
  const handleRefreshData = useCallback(async () => {
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
  }, [
    refetchGoals, refetchGrowthMetrics, refetchRevenueMetrics, 
    refetchGoalStatuses, refetchWeeks, currentWeekId, 
    refetchWeek, refetchTasks, toast
  ]);
  
  const handlePreviousWeek = useCallback(() => {
    if (weeks.length > 0 && currentWeekId) {
      const currentIndex = weeks.findIndex(week => week.id === currentWeekId);
      if (currentIndex > 0) {
        setCurrentWeekId(weeks[currentIndex - 1].id);
      }
    }
  }, [weeks, currentWeekId]);
  
  const handleNextWeek = useCallback(() => {
    if (weeks.length > 0 && currentWeekId) {
      const currentIndex = weeks.findIndex(week => week.id === currentWeekId);
      if (currentIndex < weeks.length - 1) {
        setCurrentWeekId(weeks[currentIndex + 1].id);
      }
    }
  }, [weeks, currentWeekId]);
  
  // Memoize computed values
  const isLoading = useMemo(() => 
    isLoadingGoals || 
    isLoadingGrowthMetrics || 
    isLoadingRevenueMetrics || 
    isLoadingGoalStatuses || 
    isLoadingWeeks ||
    (currentWeekId && (isLoadingWeek || isLoadingTasks)),
    [
      isLoadingGoals, isLoadingGrowthMetrics, isLoadingRevenueMetrics,
      isLoadingGoalStatuses, isLoadingWeeks, currentWeekId,
      isLoadingWeek, isLoadingTasks
    ]
  );
  
  // Check if there's any data to display - memoized to prevent recalculations
  const hasAnyData = useMemo(() => 
    goals.length > 0 || growthMetrics.length > 0 || revenueMetrics.length > 0 || weeks.length > 0,
    [goals.length, growthMetrics.length, revenueMetrics.length, weeks.length]
  );
  
  // State for celebration effects
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Handler for triggering celebration
  const handleTriggerCelebration = useCallback(() => {
    setShowCelebration(true);
  }, []);
  
  // Handle celebration completion
  const handleCelebrationComplete = useCallback(() => {
    setShowCelebration(false);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative cosmic-bg">
      {/* SimpleNav for consistent navigation */}
      <SimpleNav />
      
      {/* 3D Animated Background */}
      <Animated3DBackground 
        color="#10b981" 
        particleCount={150}
        speed={0.05}
        interactive={true}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/70 via-black/40 to-black/60 pointer-events-none"></div>
      
      {/* Custom cursor effect */}
      <CursorEffect 
        cursorSize={16}
        trailCount={8}
        color="#10b981"
        glowColor="rgba(16, 185, 129, 0.3)"
        glowSize={40}
      />
      
      {/* Celebration effect */}
      <Celebration 
        isActive={showCelebration}
        duration={6000}
        onComplete={handleCelebrationComplete}
      />
      
      <main className="flex-1 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 entrance-animation">
          {/* Page Header */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center">
                <motion.div 
                  className="relative aura-pulse mr-3"
                  initial={{ rotate: -10, scale: 0.8, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                >
                  <Rocket className="h-8 w-8 text-green-400 float-effect" />
                </motion.div>
                <motion.h1 
                  className="text-3xl font-bold text-white text-glow typing-animation"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  2025 Goals Dashboard
                </motion.h1>
              </div>
              <motion.div 
                className="flex items-center space-x-3"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="bg-gray-900/80 rounded-md shadow-sm border border-green-600 p-2 hidden sm:block gradient-border neon-glow">
                  <span className="text-sm text-green-400">Last updated:</span>
                  <span className="text-sm font-medium text-white ml-1">{lastUpdated}</span>
                </div>
                <AnimatedButton 
                  variant="outline"
                  onClick={handleRefreshData} 
                  disabled={isRefreshing}
                  animation="pulse"
                  className="border-green-500 text-green-400 hover:bg-gray-800 hover:border-green-400 transition-colors neon-glow"
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
                </AnimatedButton>
              </motion.div>
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
              {/* Stats Overview */}
              <motion.div 
                className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1,
                      delayChildren: 0.3
                    }
                  }
                }}
              >
                <StatCard 
                  icon={<Target className="h-8 w-8" />}
                  value={goals.length}
                  label="Active Goals"
                  delay={0.1}
                />
                
                <StatCard 
                  icon={<BarChart3 className="h-8 w-8" />}
                  value={(growthMetrics.length + revenueMetrics.length)}
                  label="Key Metrics"
                  delay={0.2}
                />
                
                <StatCard 
                  icon={<ListTodo className="h-8 w-8" />}
                  value={weekTasks.length}
                  label="Execution Tasks"
                  delay={0.3}
                />
                
                <StatCard 
                  icon={<Calendar className="h-8 w-8" />}
                  value={weeks.length}
                  label="Planning Weeks"
                  delay={0.4}
                />
              </motion.div>
            
              {/* Action Bar - Using memoized component */}
              <ActionBar />
              
              {/* Burn Rate Section */}
              <BurnRateCard monthlyRate={4000} />

              {/* Main Goals Progress */}
              <section className="mb-8">
                <div className="flex flex-col xs:flex-row justify-between xs:items-center gap-3 xs:gap-0 mb-4">
                  <h2 className="text-xl font-semibold text-green-400 text-glow flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    <span className="mr-2">Main Goals Progress</span>
                    <span className="text-xs px-2 py-0.5 bg-green-900/40 rounded-full text-green-300 font-normal">Track your key objectives</span>
                  </h2>
                </div>
                
                {isLoading ? (
                  <GoalsSkeleton />
                ) : goals.length > 0 ? (
                  <GoalsGrid goals={goals} />
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
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-green-400 text-glow flex items-center mb-4">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  <span className="mr-2">Performance Tracking</span>
                  <span className="text-xs px-2 py-0.5 bg-green-900/40 rounded-full text-green-300 font-normal">Track metrics & execution</span>
                </h2>
              </div>
              
              <Tabs defaultValue="metrics" className="w-full mb-8">
                <TabsList className="grid grid-cols-2 max-w-md mb-6 bg-gray-900/70 border border-green-800 rounded-lg overflow-hidden p-1 gradient-border">
                  <TabsTrigger 
                    value="metrics" 
                    className="flex-1 py-2 px-3 data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 data-[state=active]:text-glow data-[state=active]:neon-glow transition-all"
                  >
                    <div className="relative group flex items-center justify-center">
                      <BarChart3 className="h-4 w-4 mr-2 float-effect-fast" />
                      <span className="text-sm whitespace-nowrap">Metrics Dashboard</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 group-data-[state=active]:w-full transition-all duration-300"></span>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="execution" 
                    className="flex-1 py-2 px-3 data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 data-[state=active]:text-glow data-[state=active]:neon-glow transition-all"
                  >
                    <div className="relative group flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 mr-2 float-effect-fast" />
                      <span className="text-sm whitespace-nowrap">Execution Tracker</span>
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-400 group-data-[state=active]:w-full transition-all duration-300"></span>
                    </div>
                  </TabsTrigger>
                </TabsList>
                
                {/* Metrics Tab Content */}
                <TabsContent value="metrics" className="mt-0">
                  {/* Advanced Metrics Dashboard */}
                  {isLoading ? (
                    <div className="bg-gray-900 rounded-lg shadow-sm border border-green-600 p-6 animate-pulse mb-8">
                      <div className="h-5 bg-gray-800 rounded w-1/3 mb-4"></div>
                      <div className="h-64 bg-gray-800 rounded w-full mb-4"></div>
                      <div className="grid grid-cols-3 gap-4">
                        {[1, 2, 3].map((_, i) => (
                          <div key={i} className="h-20 bg-gray-800 rounded w-full"></div>
                        ))}
                      </div>
                    </div>
                  ) : goals.length > 0 || growthMetrics.length > 0 || revenueMetrics.length > 0 ? (
                    <MetricsDashboard 
                      goals={goals}
                      metrics={[...growthMetrics, ...revenueMetrics]}
                      title="Performance Analytics Dashboard"
                      description="Comprehensive analysis of your goals and KPIs with advanced visualization"
                    />
                  ) : (
                    <EmptyState 
                      title="No Metrics Data Available"
                      description="Add goals and metrics to see advanced analytics visualizations"
                      icon="chart"
                      className="py-12 mb-8"
                      addLink="/add-goal"
                      addText="Add First Goal"
                    />
                  )}

                  {/* Legacy Metrics View */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8">
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
                        <MetricsGrid 
                          title="Growth Metrics" 
                          metrics={growthMetrics} 
                          category="growth" 
                        />
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
                        <MetricsGrid 
                          title="Revenue Metrics" 
                          metrics={revenueMetrics} 
                          category="revenue" 
                        />
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
                    <span className="mr-2">Achievement Stats</span>
                    <span className="text-xs px-2 py-0.5 bg-green-900/40 rounded-full text-green-300 font-normal">Your progress at a glance</span>
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
            <motion.section 
              className="mt-12 relative"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/10 blur-3xl float-effect-slow"></div>
              <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/5 blur-3xl float-effect"></div>
              
              <h2 className="text-lg font-semibold text-green-400 text-glow mb-4 flex items-center">
                <Rocket className="h-5 w-5 mr-2 float-effect" />
                Getting Started Resources
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <motion.div 
                  className="bg-gray-900/70 backdrop-blur-sm border border-green-600 rounded-lg p-4 sm:p-5 gradient-border glow-card relative overflow-hidden group"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 via-green-500/5 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                  <div className="relative">
                    <h3 className="text-green-400 font-medium mb-2 text-glow flex items-center">
                      <Target className="h-4 w-4 mr-2 float-effect-fast" />
                      Add Your First Goal
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Define your 2025 targets with measurable goals to track progress over time.
                    </p>
                    <Link to="/add-goal">
                      <Button variant="outline" size="sm" className="w-full border-green-600 text-green-400 neon-glow iridescent-hover">
                        Start <ChevronRight className="ml-1 h-4 w-4 float-effect-fast" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-900/70 backdrop-blur-sm border border-green-600 rounded-lg p-4 sm:p-5 gradient-border glow-card relative overflow-hidden group"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 via-green-500/5 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                  <div className="relative">
                    <h3 className="text-green-400 font-medium mb-2 text-glow flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2 float-effect-fast" />
                      Track Key Metrics
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Monitor important KPIs related to growth, revenue, and performance.
                    </p>
                    <Link to="/add-metric">
                      <Button variant="outline" size="sm" className="w-full border-green-600 text-green-400 neon-glow iridescent-hover">
                        View Metrics <ChevronRight className="ml-1 h-4 w-4 float-effect-fast" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-gray-900/70 backdrop-blur-sm border border-green-600 rounded-lg p-4 sm:p-5 sm:col-span-2 lg:col-span-1 gradient-border glow-card relative overflow-hidden group"
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <div className="absolute -inset-1 bg-gradient-to-r from-green-600/20 via-green-500/5 to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700 blur-xl"></div>
                  <div className="relative">
                    <h3 className="text-green-400 font-medium mb-2 text-glow flex items-center">
                      <ListTodo className="h-4 w-4 mr-2 float-effect-fast" />
                      Plan Weekly Tasks
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Break down your goals into actionable weekly tasks for execution tracking.
                    </p>
                    <Link to="/add-task">
                      <Button variant="outline" size="sm" className="w-full border-green-600 text-green-400 neon-glow iridescent-hover">
                        Add Tasks <ChevronRight className="ml-1 h-4 w-4 float-effect-fast" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </motion.section>
          )}
        </div>
      </main>
      
      {/* Footer removed and replaced with consistent navigation */}
    </div>
  );
};

export default Dashboard;
