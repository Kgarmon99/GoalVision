import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Goal } from '@shared/schema';
import { apiRequest, queryClient } from '../lib/queryClient';
import { AnimatedProgressChart } from '../components/animated-progress-chart';
import { useToast } from '../hooks/use-toast';
import { useGoalCelebration } from '../hooks/use-goal-celebration';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  TrendingUp, 
  Filter, 
  ArrowUpRight, 
  Zap,
  LayoutGrid,
  LayoutList,
  Target
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Skeleton } from '../components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Empty } from '../components/ui/empty';
import { AnimatedButton } from '../components/ui/animated-button';

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

export default function GoalVisualizations() {
  // State for filtering and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'progress' | 'target'>('progress');
  const [layout, setLayout] = useState<LayoutType>('grid');
  
  // Get toast hook for notifications
  const { toast } = useToast();
  // Get goal celebration hook
  const { triggerCelebration } = useGoalCelebration();

  // Fetch all goals
  const { 
    data: goals = [], 
    isLoading, 
    error 
  } = useQuery({ 
    queryKey: ['/api/goals'],
    staleTime: 30000 // 30 seconds
  });

  // Handle search and sort logic
  const filteredAndSortedGoals = React.useMemo(() => {
    let result = [...(goals as Goal[])];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(goal => 
        goal.name.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
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
        default:
          return 0;
      }
    });
    
    return result;
  }, [goals, searchQuery, sortBy]);

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

  return (
    <div className="space-y-6 p-6">
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
            variant={layout === 'grid' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setLayout('grid')}
            className="w-10 p-0"
          >
            <LayoutGrid size={18} />
          </Button>
          <Button 
            variant={layout === 'list' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setLayout('list')}
            className="w-10 p-0"
          >
            <LayoutList size={18} />
          </Button>
        </div>
      </div>
      
      {/* Filters and sorting */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center bg-background/60 backdrop-blur-sm border rounded-md flex-1 max-w-md">
          <Input
            placeholder="Search goals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-0 focus-visible:ring-0"
          />
        </div>
        
        <div className="flex gap-2 items-center">
          <span className="text-sm text-muted-foreground">Sort by:</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as 'name' | 'progress' | 'target')}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="progress">Progress</SelectItem>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="target">Target Value</SelectItem>
            </SelectContent>
          </Select>
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
                defaultChartType={layout === 'grid' ? 'radial' : 'area'}
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
              searchQuery
                ? `No goals match your search "${searchQuery}"`
                : "You don't have any goals set up yet."
            }
            action={
              searchQuery ? (
                <Button onClick={() => setSearchQuery('')}>
                  Clear Search
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
    </div>
  );
}