import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SimpleNav } from "@/components/layout/simple-nav";
import { GoalProgressCard } from "@/components/goal-progress-card";
import MetricsCard from "@/components/metrics-card";
import StatusIndicator from "@/components/status-indicator";
import { SimpleMetricsDashboard } from "@/components/simple-metrics-dashboard";
import { TopProspects } from "@/components/top-prospects";
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
import { Card3D, Card3DContent, Card3DTitle, Icon3D, Value3D, Text3D, Badge3D } from "@/components/ui/card-3d";
import { Button3D } from "@/components/ui/button-3d";
import { Progress3D } from "@/components/ui/progress-3d";
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
  Clock,
  AlertCircle,
  TrendingDown
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Goal, Metric, GoalStatus, Prospect } from "@shared/schema";
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

const StatCard = memo(({ icon, value, label }: StatCardProps) => (
  <div className="bg-card rounded-lg border border-border shadow-sm p-4 flex flex-col items-center hover:shadow-md transition-all duration-200">
    <div className="text-primary mb-2 bg-primary/10 p-3 rounded-full">
      {icon}
    </div>
    <h3 className="text-2xl font-bold">{value}</h3>
    <p className="text-muted-foreground text-sm">{label}</p>
  </div>
));

// Memoized action bar to prevent unnecessary re-renders with 3D buttons
const ActionBar = memo(() => {
  return (
    <div className="mb-6 bg-card rounded-lg border border-border shadow-sm p-4 flex flex-wrap gap-4 justify-end items-center">
      <div className="flex gap-3 flex-wrap">
        <Link href="/add-progress">
          <Button3D 
            variant="outline" 
            size="sm" 
            className="gap-2"
            title="Update your progress on existing goals"
            iconLeft={<PlusCircle className="h-4 w-4" />}
            glow={true}
          >
            Update Progress
          </Button3D>
        </Link>
        <Link href="/add-goal">
          <Button3D 
            variant="outline" 
            size="sm" 
            className="gap-2"
            title="Add a new goal to track"
            iconLeft={<Plus className="h-4 w-4" />}
            glow={true}
          >
            Add Goal
          </Button3D>
        </Link>
      </div>
    </div>
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
    <div className="mb-8 bg-card rounded-lg border p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center mb-5">
        <div className="flex items-center mb-2 sm:mb-0">
          <div className="bg-red-500/20 p-3 rounded-full mr-4">
            <TrendingDown className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Burn Rate</h3>
            <p className="text-sm text-muted-foreground max-w-md">Current spending and expense tracking</p>
          </div>
        </div>
        <div className="ml-auto mt-2 sm:mt-0 flex items-center">
          <div className="bg-amber-500/10 py-1 px-3 rounded-full flex items-center">
            <AlertCircle className="h-4 w-4 text-amber-500 mr-1.5" />
            <span className="text-xs font-medium text-amber-500">Critical expense tracking</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 dashboard-3d">
        <Card3D className="bg-card border" intensity="medium" floatEffect={true}>
          <Card3DContent className="p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full">
                <Icon3D>
                  <DollarSign className="h-5 w-5 text-red-500" />
                </Icon3D>
              </div>
              <Badge3D className="text-xs font-medium px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full">
                Daily
              </Badge3D>
            </div>
            <Value3D className="text-2xl font-bold mt-1">${dailyRate}</Value3D>
            <div className="mt-2 flex items-center justify-between">
              <Text3D className="text-xs text-muted-foreground">Per day spending</Text3D>
              <Text3D className="text-xs font-medium text-red-500">-${dailyRate}/day</Text3D>
            </div>
          </Card3DContent>
        </Card3D>
        
        <Card3D className="bg-card border" intensity="medium" floatEffect={true}>
          <Card3DContent className="p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-amber-50 dark:bg-amber-900/20 p-2 rounded-full">
                <Icon3D>
                  <DollarSign className="h-5 w-5 text-amber-500" />
                </Icon3D>
              </div>
              <Badge3D className="text-xs font-medium px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-full">
                Weekly
              </Badge3D>
            </div>
            <Value3D className="text-2xl font-bold mt-1">${weeklyRate}</Value3D>
            <div className="mt-2 flex items-center justify-between">
              <Text3D className="text-xs text-muted-foreground">Weekly projection</Text3D>
              <Text3D className="text-xs font-medium text-amber-500">-${weeklyRate}/week</Text3D>
            </div>
          </Card3DContent>
        </Card3D>
        
        <Card3D className="bg-card border" intensity="medium" floatEffect={true}>
          <Card3DContent className="p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-full">
                <Icon3D>
                  <DollarSign className="h-5 w-5 text-orange-500" />
                </Icon3D>
              </div>
              <Badge3D className="text-xs font-medium px-2 py-1 bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 rounded-full">
                Monthly
              </Badge3D>
            </div>
            <Value3D className="text-2xl font-bold mt-1">${monthlyRate.toLocaleString()}</Value3D>
            <div className="mt-2 flex items-center justify-between">
              <Text3D className="text-xs text-muted-foreground">Current burn rate</Text3D>
              <Text3D className="text-xs font-medium text-orange-500">-${monthlyRate.toLocaleString()}/month</Text3D>
            </div>
          </Card3DContent>
        </Card3D>
        
        <Card3D className="bg-card border" intensity="medium" floatEffect={true}>
          <Card3DContent className="p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded-full">
                <Icon3D>
                  <DollarSign className="h-5 w-5 text-red-600" />
                </Icon3D>
              </div>
              <Badge3D className="text-xs font-medium px-2 py-1 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-full">
                Yearly
              </Badge3D>
            </div>
            <Value3D className="text-2xl font-bold mt-1">${yearlyRate.toLocaleString()}</Value3D>
            <div className="mt-2 flex items-center justify-between">
              <Text3D className="text-xs text-muted-foreground">Annual projection</Text3D>
              <Text3D className="text-xs font-medium text-red-600">-${yearlyRate.toLocaleString()}/year</Text3D>
            </div>
          </Card3DContent>
        </Card3D>
      </div>
      
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border">
        <div className="flex items-center gap-3">
          <div className="bg-primary/20 p-2 rounded-full">
            <Flame className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Expense Management</p>
            <p className="text-sm text-muted-foreground">Monitor expenses closely to extend runway and optimize operational efficiency.</p>
          </div>
        </div>
      </div>
    </div>
  );
});

const Dashboard = () => {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(format(new Date(), "MMMM d, yyyy 'at' h:mm a"));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [shouldShowQuickStart, setShouldShowQuickStart] = useState(false);
  
  // Fetch goals
  const { 
    data: goals = [], 
    isLoading: isLoadingGoals,
    refetch: refetchGoals
  } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Only keep essential data fetching
  
  // Fetch top prospects
  const { 
    data: prospects = [], 
    isLoading: isLoadingProspects,
    refetch: refetchProspects
  } = useQuery<Prospect[]>({
    queryKey: ['/api/prospects/top/10'],
  });
  
  // Check if we should show the quick start guide - show when no goals
  useEffect(() => {
    // Show when data has been reset (no goals)
    if (!isLoadingGoals && goals.length === 0) {
      setShouldShowQuickStart(true);
    } else {
      setShouldShowQuickStart(false);
    }
  }, [isLoadingGoals, goals]);
  
  // Simplified refresh handler
  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    
    try {
      await Promise.all([
        refetchGoals(), 
        refetchProspects(),
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
  }, [refetchGoals, refetchProspects, toast]);
  
  // Simplified state management
  const isLoading = isLoadingGoals || isLoadingProspects;
  const hasAnyData = goals.length > 0;
  
  // Get top 3 most important goals
  const topThreeGoals = goals.slice(0, 3);
  
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
                className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
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
                  icon={<CheckCircle className="h-8 w-8" />}
                  value={goals.filter(goal => (goal.current / goal.target) >= 0.75).length}
                  label="On Track Goals"
                  delay={0.3}
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
              
              {/* Dashboard Tabs - Metrics */}
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-green-400 text-glow flex items-center mb-4">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  <span className="mr-2">Goal Progress</span>
                  <span className="text-xs px-2 py-0.5 bg-green-900/40 rounded-full text-green-300 font-normal">See how your goals are doing</span>
                </h2>
              </div>
              
              <Tabs defaultValue="metrics" className="w-full mb-8">
                <TabsList className="grid grid-cols-1 max-w-md mb-6 bg-gray-900/70 border border-green-800 rounded-lg overflow-hidden p-1 gradient-border">
                  <TabsTrigger 
                    value="metrics" 
                    className="flex-1 py-2 px-3 data-[state=active]:bg-gray-800 data-[state=active]:text-green-400 data-[state=active]:text-glow data-[state=active]:neon-glow transition-all"
                  >
                    <div className="relative group flex items-center justify-center">
                      <DollarSign className="h-4 w-4 mr-2 float-effect-fast" />
                      <span className="text-sm whitespace-nowrap">Money & Growth</span>
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
                    <SimpleMetricsDashboard 
                      goals={goals}
                      metrics={[...growthMetrics, ...revenueMetrics]}
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
                          description="Add metrics to track revenue goals"
                          icon="chart"
                          className="h-full"
                        />
                      )}
                    </div>
                    
                    {/* Goal Statuses */}
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
                      ) : goalStatuses.length > 0 ? (
                        <div className="bg-card rounded-lg shadow-sm border p-3 sm:p-4 h-full">
                          <div className="flex items-center mb-4">
                            <div className="bg-primary/10 p-2 rounded-full mr-2">
                              <Target className="h-4 w-4 text-primary" />
                            </div>
                            <h3 className="font-medium">Goal Status</h3>
                          </div>
                          <StatusIndicator statuses={goalStatuses} />
                        </div>
                      ) : (
                        <EmptyState 
                          title="No Goal Statuses" 
                          description="Add goals to track status"
                          icon="chart"
                          className="h-full"
                        />
                      )}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Top Prospects Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-green-400 text-glow flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    <span className="mr-2">Top Prospects</span>
                    <span className="text-xs px-2 py-0.5 bg-green-900/40 rounded-full text-green-300 font-normal">High potential opportunities</span>
                  </h2>
                  <Button variant="ghost" className="border border-green-600/20 hover:bg-green-900/20">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
                    {[1, 2, 3, 4].map((_, index) => (
                      <div key={index} className="bg-card rounded-lg shadow-sm border border-border p-4 h-28">
                        <div className="flex items-center space-x-3">
                          <div className="rounded-full bg-muted h-10 w-10"></div>
                          <div>
                            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
                            <div className="h-3 bg-muted rounded w-16"></div>
                          </div>
                        </div>
                        <div className="mt-3">
                          <div className="h-3 bg-muted rounded w-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <TopProspects prospects={prospects} maxItems={10} />
                )}
              </div>
              
              {/* Global Impact Call to Action */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-lg shadow-lg border border-green-700 p-6 md:p-8 relative overflow-hidden hover:shadow-green-900/20 transition-all duration-300">
                  <div className="absolute inset-0 bg-grid-white/[0.02] opacity-50"></div>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
                  <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-green-500 to-transparent"></div>
                  <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-green-500 to-transparent"></div>
                  
                  <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                        <Trophy className="h-6 w-6 text-yellow-500 mr-3" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Go Global</span>
                      </h3>
                      <p className="text-gray-300 max-w-2xl">
                        See how your goal progress compares globally. Connect with other achievers tracking similar objectives around the world.
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <Link href="/global-impact">
                        <Button3D
                          glow={true}
                          className="bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-500 hover:to-emerald-600 border-green-500 text-white shadow-lg shadow-green-900/30"
                          iconRight={<ArrowUpRight className="h-4 w-4 ml-2" />}
                        >
                          Explore Global Impact
                        </Button3D>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;