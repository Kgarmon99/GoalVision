import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Goal, Metric, GoalStatus } from '@shared/schema';
import { apiRequest, queryClient } from '../lib/queryClient';
import { AnimatedProgressChart } from '../components/animated-progress-chart';
import { useToast } from '../hooks/use-toast';
import { useGoalCelebration } from '../hooks/use-goal-celebration';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  TrendingUp, 
  Filter, 
  ArrowUpRight, 
  Zap,
  LayoutGrid,
  LayoutList,
  Target,
  Calendar,
  Clock,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  ChevronsUpDown,
  Share2,
  Download,
  Printer,
  Save,
  Settings,
  MoreHorizontal,
  Sliders,
  Watch as TimeIcon,
  PieChart,
  LineChart,
  BellRing,
  Info,
  Menu,
  CircleOff,
  Sparkles,
  Search,
  RefreshCw,
  SlidersHorizontal,
  Star,
  ChevronRight,
  FileText,
  X,
  PlusCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';

import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Empty } from '../components/ui/empty';
import { AnimatedButton } from '../components/ui/animated-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { Switch } from '../components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { 
  Command, 
  CommandDialog, 
  CommandEmpty, 
  CommandGroup, 
  CommandInput, 
  CommandItem, 
  CommandList, 
  CommandSeparator, 
  CommandShortcut 
} from '../components/ui/command';
import { ParticleEffect } from '../components/ui/particle-effect';
import { CursorEffect } from '../components/ui/cursor-effect';
import { AnimatedComponent } from '../components/ui/animated-component';
import { getDaysUntil, getDaysUntilDescription, formatDate, getUrgencyLevel } from '../utils/date-utils';

// Container variants for animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Item variants for animations
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
      mass: 0.5
    }
  }
};

// Chart layouts
type LayoutType = 'grid' | 'list';

// Advanced filtering options
type FilterOption = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

// Goal status options for filtering
const STATUS_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'All Goals', icon: <Target size={14} /> },
  { key: 'on-track', label: 'On Track', icon: <CheckCircle2 size={14} /> },
  { key: 'needs-attention', label: 'Needs Attention', icon: <AlertTriangle size={14} /> },
  { key: 'off-track', label: 'Off Track', icon: <CircleOff size={14} /> },
  { key: 'completed', label: 'Completed', icon: <CheckCircle2 size={14} /> },
];

// Time periods for tracking progress
const TIME_PERIODS: FilterOption[] = [
  { key: 'all', label: 'All Time', icon: <Calendar size={14} /> },
  { key: 'this-week', label: 'This Week', icon: <Clock size={14} /> },
  { key: 'this-month', label: 'This Month', icon: <Calendar size={14} /> },
  { key: 'this-quarter', label: 'This Quarter', icon: <Calendar size={14} /> },
  { key: 'this-year', label: 'This Year', icon: <Calendar size={14} /> },
];

// View options for different perspectives
const VIEW_OPTIONS: FilterOption[] = [
  { key: 'progress', label: 'Progress View', icon: <TrendingUp size={14} /> },
  { key: 'forecast', label: 'Forecast View', icon: <ArrowUpRight size={14} /> },
  { key: 'comparison', label: 'Comparison View', icon: <BarChart size={14} /> },
  { key: 'timeline', label: 'Timeline View', icon: <TimeIcon size={14} /> },
];

export default function GoalVisualizations() {
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'target' | 'deadline' | 'status'>('progress');
  const [layout, setLayout] = useState<LayoutType>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timePeriod, setTimePeriod] = useState<string>('all');
  const [viewMode, setViewMode] = useState<string>('progress');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  const [showCommands, setShowCommands] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  // State for goal analytics
  const [forecastEnabled, setForecastEnabled] = useState(true);
  const [comparisonsEnabled, setComparisonsEnabled] = useState(true);
  const [showOnlyImportant, setShowOnlyImportant] = useState(false);
  const [showOnlyBehind, setShowOnlyBehind] = useState(false);
  const [defaultChartType, setDefaultChartType] = useState('radial');
  
  // Get toast hook for notifications
  const { toast } = useToast();
  // Get goal celebration hook
  const { triggerCelebration } = useGoalCelebration();

  // Fetch all goals
  const { 
    data: goals = [], 
    isLoading: goalsLoading, 
    error: goalsError,
    refetch: refetchGoals
  } = useQuery({ 
    queryKey: ['/api/goals'],
    staleTime: 30000 // 30 seconds
  });
  
  // Fetch goal statuses for better insights
  const {
    data: goalStatuses = [],
    isLoading: statusesLoading,
    error: statusesError
  } = useQuery({
    queryKey: ['/api/goal-statuses'],
    staleTime: 30000
  });
  
  // Determine if we're loading data
  const isLoading = goalsLoading || statusesLoading;
  const error = goalsError || statusesError;

  // Calculate goal metrics for insights
  const goalMetrics = useMemo(() => {
    const allGoals = [...(goals as Goal[])];
    const statuses = [...(goalStatuses as GoalStatus[])];
    
    // Calculate overall progress
    const totalGoals = allGoals.length;
    const completedGoals = allGoals.filter((goal: Goal) => (goal.current / goal.target) >= 1).length;
    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0;
    
    // Goal status distribution
    const statusCounts = {
      'on-track': 0,
      'needs-attention': 0,
      'off-track': 0,
      'completed': completedGoals,
    };
    
    // Map statuses to goals
    const statusMap = new Map<number, string>();
    statuses.forEach(status => {
      statusMap.set(status.goalId, status.status);
      statusCounts[status.status as keyof typeof statusCounts] = 
        (statusCounts[status.status as keyof typeof statusCounts] || 0) + 1;
    });
    
    // Find goals that need attention (off-track or deadline approaching)
    const goalsNeedingAttention = (allGoals as Goal[]).filter((goal: Goal) => {
      const status = statusMap.get(goal.id);
      const progressRatio = goal.current / goal.target;
      
      // Check if off-track or needs attention based on status
      if (status === 'off-track' || status === 'needs-attention') {
        return true;
      }
      
      // Check if deadline is approaching
      if (goal.deadline) {
        const daysUntil = getDaysUntil(goal.deadline);
        // If less than 14 days left but progress is < 80%, flag it
        if (daysUntil > 0 && daysUntil < 14 && progressRatio < 0.8) {
          return true;
        }
      }
      
      return false;
    });
    
    // Find most and least progressed goals
    const sortedByProgress = (allGoals as Goal[]).sort((a: Goal, b: Goal) => {
      const progressA = a.current / a.target;
      const progressB = b.current / b.target;
      return progressB - progressA;
    });
    
    const topPerformingGoals = sortedByProgress.slice(0, 3);
    const underperformingGoals = [...sortedByProgress].reverse().slice(0, 3);
    
    // Forecast time to completion for in-progress goals
    const forecasts = (allGoals as Goal[]).map((goal: Goal) => {
      if (goal.current >= goal.target) {
        return { goalId: goal.id, completed: true, daysToCompletion: 0 };
      }
      
      // Simple linear forecast - assumes constant progress rate
      const progressPerDay = goal.current / 30; // Assume 30 days of progress so far
      const remaining = goal.target - goal.current;
      const daysToCompletion = progressPerDay > 0 ? Math.ceil(remaining / progressPerDay) : Infinity;
      
      return { 
        goalId: goal.id, 
        completed: false, 
        daysToCompletion,
        willMeetDeadline: goal.deadline ? getDaysUntil(goal.deadline) > daysToCompletion : true
      };
    });
    
    return {
      totalGoals,
      completedGoals,
      completionRate,
      statusCounts,
      statusMap,
      goalsNeedingAttention,
      topPerformingGoals,
      underperformingGoals,
      forecasts
    };
  }, [goals, goalStatuses]);

  // Handle search and sort logic with advanced filtering
  const filteredAndSortedGoals = useMemo(() => {
    let result = [...(goals as Goal[])];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(goal => 
        goal.name.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'completed') {
        // Handle completed goals based on progress
        result = result.filter(goal => (goal.current / goal.target) >= 1);
      } else {
        // Filter by status from the goalStatuses data
        const filteredGoalIds = (goalStatuses as GoalStatus[])
          .filter(status => status.status === statusFilter)
          .map(status => status.goalId);
        
        result = result.filter(goal => filteredGoalIds.includes(goal.id));
      }
    }
    
    // Apply time period filter if needed
    if (timePeriod !== 'all') {
      // This would filter goals based on creation date or update date
      // For demo purposes, we're not implementing this filter
    }
    
    // Apply advanced filters
    if (showOnlyImportant) {
      // Filter only goals with high importance (could be based on a priority field)
      // For demo purposes, we'll consider goals with larger targets as more important
      result = result.filter(goal => goal.target > 1000);
    }
    
    if (showOnlyBehind) {
      // Filter only goals that are behind schedule
      result = result.filter(goal => {
        const progressPercent = (goal.current / goal.target) * 100;
        // Consider behind if less than 50% complete
        return progressPercent < 50;
      });
    }
    
    // Apply sorting with enhanced options
    result.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        
        case 'progress':
          const progressA = (a.target && a.current) ? (a.current / a.target) : 0;
          const progressB = (b.target && b.current) ? (b.current / b.target) : 0;
          return progressB - progressA; // Highest progress first
        
        case 'target':
          return (b.target || 0) - (a.target || 0); // Highest target first
          
        case 'deadline':
          // Sort by deadline (closest deadline first)
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return getDaysUntil(a.deadline) - getDaysUntil(b.deadline);
          
        case 'status':
          // Sort by status (on-track first, then needs-attention, then off-track)
          const statusA = goalMetrics.statusMap.get(a.id) || '';
          const statusB = goalMetrics.statusMap.get(b.id) || '';
          // Define status order for sorting
          const statusOrder: {[key: string]: number} = {
            'on-track': 0,
            'needs-attention': 1,
            'off-track': 2,
            '': 3
          };
          return statusOrder[statusA] - statusOrder[statusB];
          
        default:
          return 0;
      }
    });
    
    return result;
  }, [goals, goalStatuses, searchQuery, sortBy, statusFilter, timePeriod, showOnlyImportant, showOnlyBehind, goalMetrics]);

  // Update goal mutation
  const updateGoalMutation = useMutation({
    mutationFn: async (goalData: { id: number; current: number }) => {
      return apiRequest('PATCH', `/api/goals/${goalData.id}`, {
        current: goalData.current,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals'] });
      toast({
        title: 'Goal updated',
        description: 'The goal progress has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error updating goal',
        description: error.message || 'Something went wrong.',
        variant: 'destructive',
      });
    },
  });

  // Show error if data fetch failed
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Error Loading Data</h2>
        <p className="text-muted-foreground mb-4">
          Failed to load goal visualization data. Please try again.
        </p>
        <Button 
          onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/goals'] })}
          variant="default"
        >
          Retry
        </Button>
      </div>
    );
  }

  // Command keyboard shortcut handler
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCommands(true);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  
  return (
    <div className="space-y-8 px-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <div className="flex items-center gap-3">
              <Target className="h-8 w-8 text-primary" />
              Goal Visualizations
            </div>
          </h1>
          <p className="text-muted-foreground mt-1">
            Interactive and animated visualizations of your goal progress
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowCommands(true)}
            className="hidden md:flex items-center gap-2"
          >
            <Search size={16} />
            <span>Search...</span>
            <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => refetchGoals()}
                >
                  <RefreshCw size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Refresh Data</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <SlidersHorizontal size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Advanced Filters</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button 
            variant={layout === 'grid' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => setLayout('grid')}
          >
            <LayoutGrid size={16} />
          </Button>
          <Button 
            variant={layout === 'list' ? 'default' : 'outline'} 
            size="icon"
            onClick={() => setLayout('list')}
          >
            <LayoutList size={16} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>View Options</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setShowInsights(!showInsights)}>
                {showInsights ? 'Hide Insights' : 'Show Insights'}
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/add-goal">Add New Goal</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Download size={16} className="mr-2" />
                Export Data
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Printer size={16} className="mr-2" />
                Print Report
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Goal Dashboard Insights */}
      {showInsights && !isLoading && (
        <Card className="bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100 overflow-hidden border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Goal Insights Dashboard
            </CardTitle>
            <CardDescription className="text-gray-400">
              Advanced analytics and performance metrics for your goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {/* Overall Completion Rate */}
              <div className="bg-gray-800/30 rounded-lg p-4 backdrop-blur-sm border border-gray-800/50">
                <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                  <Target size={14} />
                  Overall Completion
                </div>
                <div className="text-3xl font-bold">
                  {goalMetrics.completionRate.toFixed(0)}%
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {goalMetrics.completedGoals} of {goalMetrics.totalGoals} goals completed
                </div>
              </div>
              
              {/* Goals Needing Attention */}
              <div className="bg-gray-800/30 rounded-lg p-4 backdrop-blur-sm border border-gray-800/50">
                <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  Needs Attention
                </div>
                <div className="text-3xl font-bold">
                  {goalMetrics.goalsNeedingAttention.length}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {goalMetrics.goalsNeedingAttention.length > 0 ? 
                    'Goals that need your focus' : 
                    'All goals are on track'}
                </div>
              </div>
              
              {/* Top Performing */}
              <div className="bg-gray-800/30 rounded-lg p-4 backdrop-blur-sm border border-gray-800/50">
                <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-500" />
                  Top Performer
                </div>
                <div className="text-xl font-bold truncate max-w-full">
                  {goalMetrics.topPerformingGoals[0]?.name || 'N/A'}
                </div>
                <div className="mt-2 text-xs text-gray-400">
                  {goalMetrics.topPerformingGoals[0] ? 
                    `${((goalMetrics.topPerformingGoals[0].current / goalMetrics.topPerformingGoals[0].target) * 100).toFixed(0)}% complete` : 
                    'No goals to analyze'}
                </div>
              </div>
              
              {/* Forecast */}
              <div className="bg-gray-800/30 rounded-lg p-4 backdrop-blur-sm border border-gray-800/50">
                <div className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                  <Clock size={14} className="text-blue-400" />
                  Time Forecast
                </div>
                {goalMetrics.forecasts[0] && !goalMetrics.forecasts[0].completed ? (
                  <>
                    <div className="text-xl font-bold">
                      {goalMetrics.forecasts[0].daysToCompletion} days
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Est. time to complete nearest goal
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold">N/A</div>
                    <div className="mt-2 text-xs text-gray-400">
                      No in-progress goals to forecast
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    
      {/* Advanced Filters Panel */}
      <AnimatePresence>
        {showAdvancedFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="mb-6 overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter size={18} />
                  Advanced Filtering Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Status Filter */}
                  <div>
                    <div className="text-sm font-medium mb-2">Goal Status</div>
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map(option => (
                          <SelectItem key={option.key} value={option.key}>
                            <div className="flex items-center gap-2">
                              {option.icon}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Time Period Filter */}
                  <div>
                    <div className="text-sm font-medium mb-2">Time Period</div>
                    <Select
                      value={timePeriod}
                      onValueChange={setTimePeriod}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Period" />
                      </SelectTrigger>
                      <SelectContent>
                        {TIME_PERIODS.map(option => (
                          <SelectItem key={option.key} value={option.key}>
                            <div className="flex items-center gap-2">
                              {option.icon}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* View Mode */}
                  <div>
                    <div className="text-sm font-medium mb-2">View Mode</div>
                    <Select
                      value={viewMode}
                      onValueChange={setViewMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select View" />
                      </SelectTrigger>
                      <SelectContent>
                        {VIEW_OPTIONS.map(option => (
                          <SelectItem key={option.key} value={option.key}>
                            <div className="flex items-center gap-2">
                              {option.icon}
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Advanced Sorting Options */}
                  <div>
                    <div className="text-sm font-medium mb-2">Sort By</div>
                    <Select
                      value={sortBy}
                      onValueChange={(value) => setSortBy(value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="progress">Progress</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="target">Target Value</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {/* Additional Filter Options */}
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="important-only" 
                      checked={showOnlyImportant}
                      onCheckedChange={(checked) => setShowOnlyImportant(checked === true)}
                    />
                    <label
                      htmlFor="important-only"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show only high-value goals
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="behind-only" 
                      checked={showOnlyBehind}
                      onCheckedChange={(checked) => setShowOnlyBehind(checked === true)}
                    />
                    <label
                      htmlFor="behind-only"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Show only goals behind schedule
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="forecast-switch"
                      checked={forecastEnabled}
                      onCheckedChange={setForecastEnabled}
                    />
                    <label
                      htmlFor="forecast-switch"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Enable forecasting
                    </label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between py-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setStatusFilter('all');
                    setTimePeriod('all');
                    setViewMode('progress');
                    setSortBy('progress');
                    setShowOnlyImportant(false);
                    setShowOnlyBehind(false);
                    setForecastEnabled(true);
                  }}
                >
                  Reset Filters
                </Button>
                <Button
                  onClick={() => setShowAdvancedFilters(false)}
                  size="sm"
                >
                  Apply Filters
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Main Search Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center bg-background/60 backdrop-blur-sm border rounded-md flex-1 max-w-full md:max-w-md">
          <Search className="ml-3 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder="Search goals by name, status, or metrics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
          {searchQuery && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-2" 
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Quick Status Filters */}
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map(option => (
            <Button
              key={option.key}
              variant={statusFilter === option.key ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(option.key)}
              className="h-8"
            >
              <div className="flex items-center gap-2">
                {option.icon}
                <span className="hidden md:inline">{option.label}</span>
              </div>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Goal visualizations */}
      {isLoading ? (
        <div className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-1/2 mb-2" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAndSortedGoals.length > 0 ? (
        <motion.div 
          className={`grid gap-6 ${layout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredAndSortedGoals.map((goal) => (
            <motion.div 
              key={goal.id} 
              variants={itemVariants}
              whileHover={{ 
                y: -5, 
                transition: { duration: 0.2 } 
              }}
            >
              <AnimatedProgressChart 
                goal={goal} 
                defaultChartType={(forecastEnabled && viewMode === 'forecast') ? 'forecast' : 
                                  (viewMode === 'radar') ? 'radar' :
                                  (viewMode === 'comparison') ? 'combo' :
                                  (layout === 'grid') ? 'radial' : 'area'}
                showControls={true}
                enableParticles={true}
                className={layout === 'list' ? 'max-w-full' : ''}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="py-12">
          <Empty
            icon={<BarChart className="h-12 w-12 text-muted-foreground" />}
            title="No Goals Found"
            description={
              searchQuery || statusFilter !== 'all'
                ? `No goals match your current filters`
                : "You don't have any goals set up yet."
            }
            action={
              searchQuery || statusFilter !== 'all' ? (
                <Button onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}>
                  Clear Filters
                </Button>
              ) : (
                <AnimatedButton 
                  asChild 
                  animation="bounce"
                >
                  <Button asChild>
                    <a href="/add-goal">Add Your First Goal</a>
                  </Button>
                </AnimatedButton>
              )
            }
          />
        </div>
      )}
      
      {/* Command palette */}
      <CommandDialog open={showCommands} onOpenChange={setShowCommands}>
        <CommandInput placeholder="Search goals, commands, and options..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Goals">
            {(goals as Goal[]).slice(0, 5).map(goal => (
              <CommandItem 
                key={goal.id}
                onSelect={() => {
                  setSelectedGoalId(goal.id);
                  setShowCommands(false);
                }}
              >
                <Target className="mr-2 h-4 w-4" />
                <span>{goal.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {((goal.current / goal.target) * 100).toFixed(0)}% complete
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => {
              setLayout(layout === 'grid' ? 'list' : 'grid');
              setShowCommands(false);
            }}>
              {layout === 'grid' ? (
                <>
                  <LayoutList className="mr-2 h-4 w-4" />
                  <span>Switch to List View</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  <span>Switch to Grid View</span>
                </>
              )}
            </CommandItem>
            <CommandItem onSelect={() => {
              setShowAdvancedFilters(!showAdvancedFilters);
              setShowCommands(false);
            }}>
              <Filter className="mr-2 h-4 w-4" />
              <span>{showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters</span>
            </CommandItem>
            <CommandItem onSelect={() => {
              window.location.href = '/add-goal';
            }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Add New Goal</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="View Options">
            {VIEW_OPTIONS.map(option => (
              <CommandItem 
                key={option.key}
                onSelect={() => {
                  setViewMode(option.key);
                  setShowCommands(false);
                }}
              >
                <div className="mr-2 h-4 w-4 flex items-center justify-center">
                  {option.icon}
                </div>
                <span>{option.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}