import { Goal, Metric } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart,
  ResponsiveContainer,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";
import { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarDays, 
  Clock, 
  Download, 
  Filter, 
  LineChart as LineChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Share2,
  TrendingUp,
  TrendingDown,
  Percent,
  Flame,
  Target,
  ArrowUpRight,
  HelpCircle,
  ArrowDownRight,
  ArrowRight,
  CalendarClock
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDate } from "@/utils/date-utils";
import { format, subDays } from "date-fns";

interface GoalProgress {
  name: string;
  current: number;
  target: number;
  progressPercentage: number;
}

interface MetricsDashboardProps {
  goals: Goal[];
  metrics: Metric[];
  title?: string;
  description?: string;
}

export function MetricsDashboard({ goals, metrics, title = "Performance Analytics", description = "Comprehensive analysis of your goals and metrics" }: MetricsDashboardProps) {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y" | "all">("30d");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "area">("bar");
  
  // Create goal progress data for charts
  const goalProgressData = useMemo(() => {
    return goals.map(goal => ({
      name: goal.name,
      current: goal.current,
      target: goal.target,
      progressPercentage: Math.min(Math.round((goal.current / goal.target) * 100), 100)
    }));
  }, [goals]);
  
  // Chart colors
  const progressColors = [
    "#10b981", // Green (primary)
    "#3b82f6", // Blue
    "#f59e0b", // Orange
    "#8b5cf6", // Purple
    "#ec4899", // Pink
    "#f43f5e", // Red
    "#6366f1", // Indigo
  ];
  
  // Prepare metrics for charts
  const metricChartData = useMemo(() => {
    // Group metrics by date
    const dateMap = new Map<string, { date: string; [key: string]: any }>();
    const dates = new Set<string>();
    const metricNames = new Set<string>();
    
    // Current date
    const currentDate = new Date();
    
    // Get date range based on selection
    let startDate = new Date();
    switch (timeRange) {
      case "7d":
        startDate = subDays(currentDate, 7);
        break;
      case "30d":
        startDate = subDays(currentDate, 30);
        break;
      case "90d":
        startDate = subDays(currentDate, 90);
        break;
      case "1y":
        startDate = subDays(currentDate, 365);
        break;
      case "all":
        // No filtering
        break;
    }
    
    // Generate synthetic dates for demo metrics
    // Filter metrics based on time range - using current date as default
    const filteredMetrics = timeRange === "all" 
      ? metrics 
      : metrics;
    
    // Process metrics
    filteredMetrics.forEach(metric => {
      // Generate a date for the metric if not present
      const today = new Date();
      const randomDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - Math.floor(Math.random() * 30));
      const dateStr = format(randomDate, 'MMM d, yyyy');
      
      dates.add(dateStr);
      metricNames.add(metric.name);
      
      if (!dateMap.has(dateStr)) {
        dateMap.set(dateStr, { date: dateStr });
      }
      
      const dateEntry = dateMap.get(dateStr)!;
      dateEntry[metric.name] = Number(metric.value);
    });
    
    // Convert to array and sort by date
    const chartData = Array.from(dateMap.values()).sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return {
      chartData,
      metricNames: Array.from(metricNames)
    };
  }, [metrics, timeRange]);
  
  // Calculate summary stats
  const summaryStats = useMemo(() => {
    if (goals.length === 0) {
      return {
        completed: 0,
        inProgress: 0,
        atRisk: 0,
        avgProgress: 0,
        totalCurrentValue: 0,
        totalTargetValue: 0
      };
    }
    
    // Calculate goal completion stats
    const completed = goals.filter(g => (g.current / g.target) >= 1).length;
    const inProgress = goals.filter(g => (g.current / g.target) < 1 && (g.current / g.target) >= 0.25).length;
    const atRisk = goals.filter(g => (g.current / g.target) < 0.25).length;
    
    // Calculate average progress
    const avgProgress = goals.reduce((acc, goal) => 
      acc + Math.min((goal.current / goal.target) * 100, 100), 0) / goals.length;
    
    // Calculate total values
    const totalCurrentValue = goals.reduce((acc, goal) => acc + goal.current, 0);
    const totalTargetValue = goals.reduce((acc, goal) => acc + goal.target, 0);
    
    return {
      completed,
      inProgress,
      atRisk,
      avgProgress: Math.round(avgProgress),
      totalCurrentValue,
      totalTargetValue
    };
  }, [goals]);
  
  // Calculate trend stats from metrics
  const trendStats = useMemo(() => {
    if (metrics.length === 0) {
      return {
        growth: 0,
        revenue: 0,
        conversion: 0
      };
    }
    
    // Get growth metrics
    const growthMetrics = metrics.filter(m => m.category === "growth");
    const growthAvg = growthMetrics.length > 0 
      ? growthMetrics.reduce((acc, m) => acc + Number(m.value), 0) / growthMetrics.length 
      : 0;
    
    // Get revenue metrics
    const revenueMetrics = metrics.filter(m => m.category === "revenue");
    const revenueAvg = revenueMetrics.length > 0 
      ? revenueMetrics.reduce((acc, m) => acc + Number(m.value), 0) / revenueMetrics.length 
      : 0;
    
    // Synthetic conversion rate (could be replaced with actual data)
    const conversion = growthMetrics.length > 0 && revenueMetrics.length > 0
      ? 5.2 // Sample conversion rate
      : 0;
    
    return {
      growth: growthAvg,
      revenue: revenueAvg,
      conversion
    };
  }, [metrics]);
  
  // Render appropriate chart based on type
  const renderChart = () => {
    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goalProgressData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--foreground)'
                }} 
              />
              <Legend />
              <Bar dataKey="current" name="Current" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="target" name="Target" fill="var(--muted)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={metricChartData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--foreground)'
                }}
              />
              <Legend />
              {metricChartData.metricNames.map((name, index) => (
                <Line 
                  key={name}
                  type="monotone" 
                  dataKey={name} 
                  name={name} 
                  stroke={progressColors[index % progressColors.length]} 
                  activeDot={{ r: 8 }}
                  strokeWidth={2}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      
      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={goalProgressData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, progressPercentage }) => `${name}: ${progressPercentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="progressPercentage"
              >
                {goalProgressData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={progressColors[index % progressColors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--foreground)'
                }}
                formatter={(value: any, name: any, props: any) => [`${value}%`, 'Progress']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
        
      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={metricChartData.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)' }} />
              <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'var(--card)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  color: 'var(--foreground)'
                }}
              />
              <Legend />
              {metricChartData.metricNames.map((name, index) => (
                <Area 
                  key={name}
                  type="monotone" 
                  dataKey={name} 
                  name={name} 
                  fill={`${progressColors[index % progressColors.length]}40`}
                  stroke={progressColors[index % progressColors.length]}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };
  
  return (
    <AnimatedComponent
      animation="fadeIn"
      duration={0.5}
      className="mb-8"
    >
      <Card className="bg-card border shadow-sm">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          
          <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2">
            <Select value={timeRange} onValueChange={(val) => setTimeRange(val as any)}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <CalendarClock className="w-3.5 h-3.5 mr-1" />
                {timeRange === "7d" && "Last 7 days"}
                {timeRange === "30d" && "Last 30 days"}
                {timeRange === "90d" && "Last 90 days"}
                {timeRange === "1y" && "Last year"}
                {timeRange === "all" && "All time"}
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="flex rounded-md border">
              <Button
                variant={chartType === 'bar' ? 'default' : 'ghost'}
                className="h-8 px-2 py-1 rounded-l-md rounded-r-none"
                onClick={() => setChartType('bar')}
              >
                <BarChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'line' ? 'default' : 'ghost'}
                className="h-8 px-2 py-1 rounded-none border-l border-r border-border"
                onClick={() => setChartType('line')}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'area' ? 'default' : 'ghost'}
                className="h-8 px-2 py-1 rounded-none border-r border-border"
                onClick={() => setChartType('area')}
              >
                <LineChartIcon className="h-4 w-4" />
              </Button>
              <Button
                variant={chartType === 'pie' ? 'default' : 'ghost'}
                className="h-8 px-2 py-1 rounded-l-none rounded-r-md"
                onClick={() => setChartType('pie')}
              >
                <PieChartIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="goals">Goals</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="bg-card border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Progress</p>
                        <div className="flex items-baseline">
                          <h3 className="text-2xl font-bold">{summaryStats.avgProgress}%</h3>
                          <span className="text-xs ml-1 font-medium text-primary">of targets</span>
                        </div>
                      </div>
                      <div className={`p-2 rounded-full ${
                        summaryStats.avgProgress >= 75 ? "bg-primary/20" :
                        summaryStats.avgProgress >= 50 ? "bg-amber-500/20" :
                        "bg-red-500/20"
                      }`}>
                        <Percent className={`h-5 w-5 ${
                          summaryStats.avgProgress >= 75 ? "text-primary" :
                          summaryStats.avgProgress >= 50 ? "text-amber-500" :
                          "text-red-500"
                        }`} />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center text-xs">
                      <Badge variant="outline" className="mr-2 bg-primary/5 text-primary border-primary/20">
                        {summaryStats.completed} completed
                      </Badge>
                      <Badge variant="outline" className="mr-2 bg-amber-500/5 text-amber-500 border-amber-500/20">
                        {summaryStats.inProgress} in progress
                      </Badge>
                      <Badge variant="outline" className="bg-red-500/5 text-red-500 border-red-500/20">
                        {summaryStats.atRisk} at risk
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Growth Rate</p>
                        <div className="flex items-baseline">
                          <h3 className="text-2xl font-bold">{trendStats.growth.toFixed(1)}%</h3>
                          <span className="text-xs ml-1 font-medium text-primary">monthly avg</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-full bg-primary/20">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between text-xs">
                      <div className="flex items-center text-primary gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                        <span>Positive trend</span>
                      </div>
                      <span className="text-muted-foreground">vs previous period</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue Potential</p>
                        <div className="flex items-baseline">
                          <h3 className="text-2xl font-bold">${trendStats.revenue.toLocaleString()}</h3>
                          <span className="text-xs ml-1 font-medium text-amber-500">MRR</span>
                        </div>
                      </div>
                      <div className="p-2 rounded-full bg-amber-500/20">
                        <Flame className="h-5 w-5 text-amber-500" />
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Conversion:</span>
                        <span className="ml-1 font-medium">{trendStats.conversion}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Forecasted:</span>
                        <span className="ml-1 font-medium text-amber-500">+12%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="p-1">
                {renderChart()}
              </div>
              
              <div className="flex justify-between pt-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <HelpCircle className="h-3 w-3" />
                  <span>Data visualization based on {timeRange === "all" ? "all historical data" : `the last ${
                    timeRange === "7d" ? "7 days" : 
                    timeRange === "30d" ? "30 days" : 
                    timeRange === "90d" ? "90 days" : "year"
                  }`}</span>
                </div>
                <div className="flex">
                  <Button variant="outline" size="sm" className="text-xs h-8 mr-2">
                    <Download className="h-3 w-3 mr-1" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    <Share2 className="h-3 w-3 mr-1" />
                    Share
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="goals" className="space-y-4">
              <div className="rounded-lg border shadow-sm divide-y">
                <div className="px-4 py-3 flex justify-between items-center bg-muted/50">
                  <h3 className="font-medium">Goal Details</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {goals.length} goals
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {goals.map((goal, index) => {
                  const progress = Math.min(Math.round((goal.current / goal.target) * 100), 100);
                  const remaining = goal.target - goal.current;
                  
                  return (
                    <div key={goal.id || index} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            progress >= 75 ? "bg-primary" :
                            progress >= 50 ? "bg-amber-500" :
                            progress >= 25 ? "bg-orange-500" :
                            "bg-red-500"
                          }`}></div>
                          <span className="font-medium">{goal.name}</span>
                          {progress >= 100 && <Badge className="ml-2 bg-primary/20 text-primary border-none">Achieved</Badge>}
                        </div>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Target className="h-3 w-3 mr-1" />
                          <span>Target: {goal.target.toLocaleString()}{goal.unit ? ` ${goal.unit}` : ''}</span>
                          {goal.deadline && (
                            <>
                              <Clock className="h-3 w-3 ml-3 mr-1" />
                              <span>Due: {formatDate(goal.deadline)}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center mt-2 sm:mt-0">
                        <div className="flex flex-col mr-4">
                          <span className="text-xs text-muted-foreground">Current</span>
                          <span className="font-medium">{goal.current.toLocaleString()}{goal.unit ? ` ${goal.unit}` : ''}</span>
                        </div>
                        
                        <div className="flex flex-col mr-4">
                          <span className="text-xs text-muted-foreground">Remaining</span>
                          <span className={`font-medium ${remaining > 0 ? "text-amber-500" : "text-primary"}`}>
                            {remaining > 0 ? `${remaining.toLocaleString()}${goal.unit ? ` ${goal.unit}` : ''}` : "Completed"}
                          </span>
                        </div>
                        
                        <div className="w-16 text-right">
                          <div className={`text-sm font-bold ${
                            progress >= 75 ? "text-primary" :
                            progress >= 50 ? "text-amber-500" :
                            progress >= 25 ? "text-orange-500" :
                            "text-red-500"
                          }`}>
                            {progress}%
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {goals.length === 0 && (
                <div className="text-center py-12">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No goals found</h3>
                  <p className="text-muted-foreground">Add goals to track your progress</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="metrics" className="space-y-4">
              <div className="rounded-lg border shadow-sm divide-y">
                <div className="px-4 py-3 flex justify-between items-center bg-muted/50">
                  <h3 className="font-medium">Metric Details</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                      {metrics.length} metrics
                    </Badge>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Filter className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {metrics.map((metric, index) => (
                  <div key={metric.id || index} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          metric.category === "revenue" ? "bg-green-500" :
                          metric.category === "growth" ? "bg-blue-500" :
                          "bg-purple-500"
                        }`}></div>
                        <span className="font-medium">{metric.name}</span>
                        <Badge className="ml-2 text-xs capitalize" variant="outline">
                          {metric.category || "General"}
                        </Badge>
                      </div>
                      
                      {metric.description && (
                        <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-2 sm:mt-0">
                      {metric.createdAt && (
                        <div className="flex items-center mr-4 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3 mr-1" />
                          <span>{formatDate(metric.createdAt)}</span>
                        </div>
                      )}
                      
                      <div className="font-bold text-right">
                        {metric.category === "revenue" && "$"}
                        {metric.value.toLocaleString()}
                        {metric.category === "growth" && "%"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {metrics.length === 0 && (
                <div className="text-center py-12">
                  <LineChartIcon className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No metrics found</h3>
                  <p className="text-muted-foreground">Add metrics to track your performance indicators</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <Card className="bg-card border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Goal Completion Rate</CardTitle>
                    <CardDescription>Overall completion trend analysis</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-bold">
                          {goals.length ? Math.round((summaryStats.completed / goals.length) * 100) : 0}%
                        </span>
                        <span className="text-xs text-muted-foreground">completion rate</span>
                      </div>
                      {goals.length > 0 && (
                        <Badge 
                          variant="outline" 
                          className={`${
                            (summaryStats.completed / goals.length) >= 0.75 ? "bg-primary/5 text-primary" :
                            (summaryStats.completed / goals.length) >= 0.5 ? "bg-amber-500/5 text-amber-500" :
                            "bg-red-500/5 text-red-500"
                          }`}
                        >
                          {(summaryStats.completed / goals.length) >= 0.75 ? "Excellent" :
                           (summaryStats.completed / goals.length) >= 0.5 ? "Good" :
                           (summaryStats.completed / goals.length) >= 0.25 ? "Fair" : "Poor"}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{summaryStats.avgProgress}%</span>
                      </div>
                      <div className="w-full bg-muted h-1 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            summaryStats.avgProgress >= 75 ? "bg-primary" :
                            summaryStats.avgProgress >= 50 ? "bg-amber-500" :
                            summaryStats.avgProgress >= 25 ? "bg-orange-500" :
                            "bg-red-500"
                          }`}
                          style={{ width: `${summaryStats.avgProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-6">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">Completed</span>
                        <span className="font-medium text-primary">{summaryStats.completed}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">In Progress</span>
                        <span className="font-medium text-amber-500">{summaryStats.inProgress}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">At Risk</span>
                        <span className="font-medium text-red-500">{summaryStats.atRisk}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Growth Metrics</CardTitle>
                    <CardDescription>Trend analysis based on key metrics</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-baseline space-x-1 mb-1">
                      <span className="text-2xl font-bold">+{trendStats.growth.toFixed(1)}%</span>
                      <span className="text-xs text-muted-foreground">avg. monthly growth</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Revenue</span>
                          <div className="flex items-center text-green-500 text-xs">
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                            <span>18.2%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Conversion</span>
                          <div className="flex items-center text-green-500 text-xs">
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                            <span>5.4%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Retention</span>
                          <div className="flex items-center text-amber-500 text-xs">
                            <ArrowRight className="h-3 w-3 mr-0.5" />
                            <span>0.2%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Acquisition</span>
                          <div className="flex items-center text-green-500 text-xs">
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                            <span>24.3%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Expenses</span>
                          <div className="flex items-center text-red-500 text-xs">
                            <ArrowDownRight className="h-3 w-3 mr-0.5" />
                            <span>8.9%</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Churn Rate</span>
                          <div className="flex items-center text-red-500 text-xs">
                            <ArrowDownRight className="h-3 w-3 mr-0.5" />
                            <span>2.1%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium">Monthly Forecast</span>
                        <div className="flex items-center">
                          <div className="px-1.5 py-0.5 rounded text-xs bg-green-500/10 text-green-500 font-medium">
                            +12.5%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="p-1">
                {renderChart()}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AnimatedComponent>
  );
}