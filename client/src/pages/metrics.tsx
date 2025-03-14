import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SimpleNav } from "@/components/layout/simple-nav";
import { useToast } from "@/hooks/use-toast";
import { Metric } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/empty-state";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  BarChart, 
  TrendingUp, 
  DollarSign,
  RefreshCw,
  PlusCircle,
  ArrowUpRight,
  Users,
  ArrowDownRight,
  Building,
  BarChart4,
  FileText,
  Edit,
  Trash2
} from "lucide-react";
import { AnimatedProgress } from "@/components/ui/animated-progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Metrics() {
  const { toast } = useToast();
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false);
  const [metricCategory, setMetricCategory] = useState<"growth" | "revenue">("growth");
  const [newMetric, setNewMetric] = useState({
    name: "",
    value: "0",
    previousValue: "",
    trend: 0,
    trendDirection: "stable",
    category: "growth",
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

  // Add metric mutation
  const addMetric = useMutation({
    mutationFn: async (metric: typeof newMetric) => {
      return apiRequest('POST', '/api/metrics', metric);
    },
    onSuccess: () => {
      toast({
        title: 'Metric added',
        description: 'Your new metric has been added successfully.',
      });
      setIsAddMetricOpen(false);
      refetchGrowthMetrics();
      refetchRevenueMetrics();
      setNewMetric({
        name: "",
        value: "0",
        previousValue: "",
        trend: 0,
        trendDirection: "stable",
        category: "growth",
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to add metric: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Refresh metrics mutation
  const refreshMetrics = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/metrics/refresh');
    },
    onSuccess: () => {
      toast({
        title: 'Metrics refreshed',
        description: 'All metrics have been updated successfully.',
      });
      refetchGrowthMetrics();
      refetchRevenueMetrics();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to refresh metrics: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  const handleAddMetric = () => {
    if (!newMetric.name || parseFloat(newMetric.value) <= 0) {
      toast({
        title: 'Missing fields',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    addMetric.mutate(newMetric);
  };

  const handleRefreshMetrics = () => {
    refreshMetrics.mutate();
  };

  const MetricCard = ({ metric }: { metric: Metric }) => {
    // Parse values for display and calculation
    const currentValue = parseFloat(metric.value) || 0;
    const previousValue = parseFloat(metric.previousValue || "0") || 0;
    
    // Calculate progress (assuming previous value as baseline if available)
    const target = previousValue > 0 ? previousValue * 1.2 : currentValue * 2; // Example target calculation
    const progress = Math.min(Math.round((currentValue / target) * 100), 100);
    
    // Determine if improving based on trend direction
    const isImproving = metric.trendDirection === "up";
    
    // Calculate change percentage
    const changePercentage = previousValue > 0 
      ? Math.round(((currentValue - previousValue) / previousValue) * 100) 
      : 0;
    
    return (
      <Card className="bg-card border-border hover:border-primary/50 transition-all duration-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-base font-medium">{metric.name}</CardTitle>
            <div className={`flex items-center ${isImproving ? 'text-green-500' : 'text-red-500'}`}>
              {isImproving ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
              <span className="text-xs ml-1">{isImproving ? '+' : ''}{changePercentage}%</span>
            </div>
          </div>
          <CardDescription className="text-xs">
            Last updated: {new Date().toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-baseline mb-2">
            <div className="text-2xl font-bold">
              {currentValue.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">
              Target: {target.toLocaleString()}
            </div>
          </div>
          <AnimatedProgress 
            value={progress} 
            maxValue={100}
            className="w-full"
            indicatorClassName={`${progress >= 75 ? 'bg-green-500' : progress >= 50 ? 'bg-yellow-500' : 'bg-orange-500'}`}
            showPercentage={true}
            height="h-2"
          />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SimpleNav />
      
      <main className="container py-8 pt-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center">
              <BarChart4 className="mr-2 h-6 w-6 text-primary" />
              Performance Metrics
            </h1>
            <p className="text-muted-foreground">
              Track and manage key performance indicators
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefreshMetrics}
              disabled={refreshMetrics.isPending}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
            
            <Dialog open={isAddMetricOpen} onOpenChange={setIsAddMetricOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Metric
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Metric</DialogTitle>
                  <DialogDescription>
                    Create a new KPI to track your performance
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="metric-name">Metric Name</Label>
                    <Input 
                      id="metric-name" 
                      placeholder="e.g., Monthly Active Users" 
                      value={newMetric.name}
                      onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="current-value">Current Value</Label>
                      <Input 
                        id="current-value" 
                        type="number" 
                        value={parseFloat(newMetric.value) || 0}
                        onChange={(e) => setNewMetric({ ...newMetric, value: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="prev-value">Previous Value (optional)</Label>
                      <Input 
                        id="prev-value" 
                        type="number" 
                        value={parseFloat(newMetric.previousValue || "0") || 0}
                        onChange={(e) => setNewMetric({ ...newMetric, previousValue: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="trend-direction">Trend Direction</Label>
                      <Select 
                        defaultValue={newMetric.trendDirection}
                        onValueChange={(value) => setNewMetric({ ...newMetric, trendDirection: value })}
                      >
                        <SelectTrigger id="trend-direction">
                          <SelectValue placeholder="Trend direction" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="up">Improving (Up)</SelectItem>
                          <SelectItem value="down">Declining (Down)</SelectItem>
                          <SelectItem value="stable">Stable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select 
                        defaultValue={newMetric.category}
                        onValueChange={(value) => setNewMetric({ ...newMetric, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="growth">Growth</SelectItem>
                          <SelectItem value="revenue">Revenue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddMetricOpen(false)}>Cancel</Button>
                  <Button onClick={handleAddMetric} disabled={addMetric.isPending}>
                    {addMetric.isPending ? "Adding..." : "Add Metric"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Tabs defaultValue="growth" onValueChange={(value) => setMetricCategory(value as any)}>
          <TabsList className="w-full max-w-md mb-6">
            <TabsTrigger value="growth" className="flex-1">
              <TrendingUp className="mr-2 h-4 w-4" />
              Growth Metrics
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex-1">
              <DollarSign className="mr-2 h-4 w-4" />
              Revenue Metrics
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="growth">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingGrowthMetrics ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="bg-card border-border animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/3 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-baseline mb-2">
                        <div className="h-7 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </div>
                      <div className="h-2 bg-muted rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))
              ) : growthMetrics.length > 0 ? (
                growthMetrics.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState
                    title="No Growth Metrics"
                    description="Add your first growth metric to start tracking"
                    icon="chart"
                    addText="Add Growth Metric"
                    addLink="#"
                    className="h-48"
                  />
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="revenue">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingRevenueMetrics ? (
                Array(3).fill(0).map((_, i) => (
                  <Card key={i} className="bg-card border-border animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-5 bg-muted rounded w-2/3"></div>
                      <div className="h-3 bg-muted rounded w-1/3 mt-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-baseline mb-2">
                        <div className="h-7 bg-muted rounded w-1/4"></div>
                        <div className="h-4 bg-muted rounded w-1/3"></div>
                      </div>
                      <div className="h-2 bg-muted rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))
              ) : revenueMetrics.length > 0 ? (
                revenueMetrics.map((metric) => (
                  <MetricCard key={metric.id} metric={metric} />
                ))
              ) : (
                <div className="col-span-full">
                  <EmptyState
                    title="No Revenue Metrics"
                    description="Add your first revenue metric to start tracking"
                    icon="chart"
                    addText="Add Revenue Metric"
                    addLink="#"
                    className="h-48"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Metrics Insights Section */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Metrics Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Key Indicators Summary</CardTitle>
                <CardDescription>Overview of your current performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                      <TrendingUp size={16} />
                    </div>
                    <span>Growth Metrics</span>
                  </div>
                  <span className="font-semibold">{growthMetrics.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary mr-3">
                      <DollarSign size={16} />
                    </div>
                    <span>Revenue Metrics</span>
                  </div>
                  <span className="font-semibold">{revenueMetrics.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mr-3">
                      <ArrowUpRight size={16} />
                    </div>
                    <span>On Target</span>
                  </div>
                  <span className="font-semibold">
                    {[...growthMetrics, ...revenueMetrics].filter(m => {
                      const currentValue = parseFloat(m.value) || 0;
                      const previousValue = parseFloat(m.previousValue || "0") || 0;
                      // Calculate a target based on previous value
                      const target = previousValue > 0 ? previousValue * 1.2 : currentValue * 2; 
                      return currentValue >= (target * 0.9);
                    }).length}
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
                <CardDescription>Common tasks for metric management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => setIsAddMetricOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Metric
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleRefreshMetrics}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Refresh All Metrics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Download Metrics Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}