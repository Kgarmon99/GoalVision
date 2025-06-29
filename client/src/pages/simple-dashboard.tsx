import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { SimpleNav } from "@/components/layout/simple-nav";
import { GoalProgressCard } from "@/components/goal-progress-card";
import { TopProspects } from "@/components/top-prospects";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { 
  Star, 
  Target,
  CheckCircle,
  Plus,
  RefreshCcw,
  TrendingDown,
  Users,
  Briefcase,
  Scale,
  Code,
  DollarSign,
  Edit,
  Check,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Goal, Prospect } from "@shared/schema";
import { useState, useCallback, useEffect } from "react";
import { format } from "date-fns";

const SimpleDashboard = () => {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(format(new Date(), "MMMM d, yyyy 'at' h:mm a"));
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Priority task state
  const [priorityTask, setPriorityTask] = useState({
    title: "Close Shelby County Schools Deal",
    description: "Follow up on budget approval and finalize contract terms",
    completed: false
  });
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskTitle, setEditTaskTitle] = useState(priorityTask.title);
  const [editTaskDescription, setEditTaskDescription] = useState(priorityTask.description);
  
  // Motivational quotes
  const motivationalQuotes = [
    "The best time to plant a tree was 20 years ago. The second best time is now. - Chinese Proverb",
    "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill", 
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Innovation distinguishes between a leader and a follower. - Steve Jobs",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it.",
    "The harder you work for something, the greater you'll feel when you achieve it."
  ];
  
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  
  // Rotate quotes every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % motivationalQuotes.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [motivationalQuotes.length]);
  
  // Fetch goals
  const { 
    data: goals = [], 
    isLoading: isLoadingGoals,
    refetch: refetchGoals
  } = useQuery<Goal[]>({
    queryKey: ['/api/goals'],
  });
  
  // Fetch top prospects
  const { 
    data: prospects = [], 
    isLoading: isLoadingProspects,
    refetch: refetchProspects
  } = useQuery<Prospect[]>({
    queryKey: ['/api/prospects/top/10'],
  });
  
  // Get top 3 most important goals
  const topThreeGoals = goals.slice(0, 3);
  const isLoading = isLoadingGoals || isLoadingProspects;
  
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

  // Priority task handlers
  const handleMarkComplete = useCallback(() => {
    setPriorityTask(prev => ({ ...prev, completed: !prev.completed }));
    toast({
      title: priorityTask.completed ? "Task reopened" : "Task completed!",
      description: priorityTask.completed ? "Task marked as incomplete" : "Great job! Task marked as complete.",
    });
  }, [priorityTask.completed, toast]);

  const handleEditTask = useCallback(() => {
    setIsEditingTask(true);
    setEditTaskTitle(priorityTask.title);
    setEditTaskDescription(priorityTask.description);
  }, [priorityTask.title, priorityTask.description]);

  const handleSaveTask = useCallback(() => {
    setPriorityTask(prev => ({
      ...prev,
      title: editTaskTitle,
      description: editTaskDescription
    }));
    setIsEditingTask(false);
    toast({
      title: "Task updated",
      description: "Priority task has been updated successfully.",
    });
  }, [editTaskTitle, editTaskDescription, toast]);

  const handleCancelEdit = useCallback(() => {
    setIsEditingTask(false);
    setEditTaskTitle(priorityTask.title);
    setEditTaskDescription(priorityTask.description);
  }, [priorityTask.title, priorityTask.description]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative cosmic-bg">
      {/* SimpleNav for consistent navigation */}
      <SimpleNav />
      
      {/* Electric Galaxy Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-gray-950 to-black"></div>
        
        {/* Electric grid overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))'
        }}></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Electric lines */}
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-green-400/20 to-transparent animate-pulse"></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        {/* Corner glow effects */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-400/10 to-transparent rounded-full blur-xl"></div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <img 
                  src="/moneybot-logo.png" 
                  alt="MoneyBot Logo" 
                  className="h-12 w-12 drop-shadow-lg"
                />
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">
                    MoneyBot Dashboard
                  </h1>
                  <p className="text-gray-300">Kentucky School Prospect Tracker</p>
                  <div className="mt-2 p-2 bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-lg border border-yellow-500/30">
                    <p className="text-yellow-300 font-semibold text-sm">🎯 Mission: Become the #1 Global Financial Brand</p>
                    <p className="text-yellow-200/80 text-xs italic">"Success is not final, failure is not fatal: it is the courage to continue that counts." - Churchill</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-gray-900/80 rounded-md shadow-sm border border-green-600 p-2 hidden sm:block">
                  <span className="text-sm text-green-400">Last updated:</span>
                  <span className="text-sm font-medium text-white ml-1">{lastUpdated}</span>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleRefreshData} 
                  disabled={isRefreshing}
                  className="border-green-500 text-green-400 hover:bg-gray-800 hover:border-green-400"
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
              </div>
            </div>
          </motion.div>

          {/* Priority Task Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Card className="relative bg-gradient-to-br from-yellow-900/40 to-orange-900/40 border-yellow-500/60 shadow-2xl backdrop-blur-sm overflow-hidden group hover:border-yellow-400/80 transition-all duration-300">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]"></div>
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-500/30 p-3 rounded-full mr-4 shadow-lg shadow-yellow-500/20 ring-1 ring-yellow-500/30">
                    <Star className="h-6 w-6 text-yellow-300 drop-shadow-lg filter" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-yellow-300 drop-shadow-lg">Most Important Thing Today</h2>
                    <p className="text-sm text-gray-300/90">Your #1 priority task to focus on</p>
                    <p className="text-xs text-yellow-200/70 italic mt-1">"Focus is the ultimate leverage in business." - Gary Vaynerchuk</p>
                  </div>
                  <img 
                    src="/moneybot-logo.png" 
                    alt="MoneyBot" 
                    className="h-8 w-8 opacity-60 drop-shadow-lg"
                  />
                </div>
                <div className="bg-black/30 rounded-lg p-4 border border-yellow-500/40 backdrop-blur-sm shadow-inner">
                  {isEditingTask ? (
                    // Edit mode
                    <div className="space-y-3">
                      <Input
                        value={editTaskTitle}
                        onChange={(e) => setEditTaskTitle(e.target.value)}
                        className="bg-black/50 border-yellow-500/60 text-white placeholder-gray-400 focus:border-yellow-400"
                        placeholder="Task title..."
                      />
                      <Textarea
                        value={editTaskDescription}
                        onChange={(e) => setEditTaskDescription(e.target.value)}
                        className="bg-black/50 border-yellow-500/60 text-white placeholder-gray-400 focus:border-yellow-400 min-h-[60px]"
                        placeholder="Task description..."
                      />
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleSaveTask}
                          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white font-semibold shadow-lg hover:shadow-green-500/25 transition-all duration-200"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="border-gray-500/60 text-gray-300 hover:bg-gray-800/50 hover:border-gray-400"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-medium transition-all duration-200 ${
                            priorityTask.completed 
                              ? "text-gray-400 line-through" 
                              : "text-white"
                          }`}>
                            {priorityTask.title}
                          </span>
                          {priorityTask.completed && (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={handleEditTask}
                            className="text-yellow-400 hover:bg-yellow-500/10 hover:text-yellow-300 p-2"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={handleMarkComplete}
                            className={`font-semibold shadow-lg transition-all duration-200 ${
                              priorityTask.completed
                                ? "bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white hover:shadow-gray-500/25"
                                : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black hover:shadow-yellow-500/25"
                            }`}
                          >
                            {priorityTask.completed ? "Reopen" : "Mark Complete"}
                          </Button>
                        </div>
                      </div>
                      <p className={`text-sm mt-2 transition-all duration-200 ${
                        priorityTask.completed 
                          ? "text-gray-500 line-through" 
                          : "text-gray-300/80"
                      }`}>
                        {priorityTask.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Three Main Goals Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="bg-green-500/20 p-2 rounded-full mr-3 shadow-lg shadow-green-500/20 ring-1 ring-green-500/30">
                  <Target className="h-6 w-6 text-green-300 drop-shadow-lg" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-green-300 drop-shadow-lg">Three Main Goals</h2>
                  <p className="text-xs text-green-200/70 italic">"A goal is a dream with a deadline." - Napoleon Hill</p>
                </div>
                <img 
                  src="/moneybot-logo.png" 
                  alt="MoneyBot" 
                  className="h-6 w-6 opacity-50 ml-3 drop-shadow-lg"
                />
              </div>
              <Button variant="outline" className="border-green-500/60 text-green-300 hover:bg-green-900/20 hover:border-green-400/80 backdrop-blur-sm shadow-lg hover:shadow-green-500/25 transition-all duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[1, 2, 3].map((_, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 p-6 h-48 animate-pulse">
                    <div className="h-4 bg-gray-700 rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-2 bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : topThreeGoals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {topThreeGoals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <GoalProgressCard goal={goal} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="border-dashed border-gray-600 bg-gray-900/30">
                <CardContent className="p-8 text-center">
                  <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">No Goals Yet</h3>
                  <p className="text-gray-500 mb-4">Add your first goal to start tracking your progress</p>
                  <Button variant="outline" className="border-green-500 text-green-400 hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Goal
                  </Button>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Kentucky School Prospects Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0 }}
          >
            <TopProspects prospects={prospects} maxItems={10} />
          </motion.div>

          {/* Burn Rate Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            <Card className="relative bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/60 shadow-2xl backdrop-blur-sm overflow-hidden group hover:border-red-400/80 transition-all duration-300">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="absolute inset-0 shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]"></div>
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center mb-6">
                  <div className="bg-red-500/30 p-3 rounded-full mr-4 shadow-lg shadow-red-500/20 ring-1 ring-red-500/30">
                    <TrendingDown className="h-6 w-6 text-red-300 drop-shadow-lg" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-red-300 drop-shadow-lg">Annual Burn Rate</h2>
                    <p className="text-sm text-gray-300/90">$250k yearly projection breakdown</p>
                    <p className="text-xs text-red-200/70 italic mt-1">"Every dollar invested is a step closer to empire." - MoneyBot</p>
                  </div>
                  <img 
                    src="/moneybot-logo.png" 
                    alt="MoneyBot" 
                    className="h-8 w-8 opacity-60 drop-shadow-lg"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Talent - 50% */}
                  <Card className="bg-black/40 border-blue-500/60 backdrop-blur-sm hover:border-blue-400/80 transition-all duration-200 group shadow-lg hover:shadow-blue-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-500/30 p-2 rounded-full mr-3 shadow-md shadow-blue-500/20 ring-1 ring-blue-500/30">
                          <Users className="h-5 w-5 text-blue-300 drop-shadow-lg" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Talent</h3>
                          <p className="text-xs text-gray-300/80">50% of budget</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-300 drop-shadow-lg">$125k</div>
                      <div className="text-sm text-gray-300/80">Staff salaries & benefits</div>
                    </CardContent>
                  </Card>

                  {/* Sales & Marketing - 20% */}
                  <Card className="bg-black/40 border-green-500/60 backdrop-blur-sm hover:border-green-400/80 transition-all duration-200 group shadow-lg hover:shadow-green-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-green-500/30 p-2 rounded-full mr-3 shadow-md shadow-green-500/20 ring-1 ring-green-500/30">
                          <Briefcase className="h-5 w-5 text-green-300 drop-shadow-lg" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Sales & Marketing</h3>
                          <p className="text-xs text-gray-300/80">20% of budget</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-300 drop-shadow-lg">$50k</div>
                      <div className="text-sm text-gray-300/80">Customer acquisition</div>
                    </CardContent>
                  </Card>

                  {/* Legal Fees - 15% */}
                  <Card className="bg-black/40 border-purple-500/60 backdrop-blur-sm hover:border-purple-400/80 transition-all duration-200 group shadow-lg hover:shadow-purple-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-purple-500/30 p-2 rounded-full mr-3 shadow-md shadow-purple-500/20 ring-1 ring-purple-500/30">
                          <Scale className="h-5 w-5 text-purple-300 drop-shadow-lg" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Legal Fees</h3>
                          <p className="text-xs text-gray-300/80">15% of budget</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-300 drop-shadow-lg">$37.5k</div>
                      <div className="text-sm text-gray-300/80">Compliance & contracts</div>
                    </CardContent>
                  </Card>

                  {/* Development - 15% */}
                  <Card className="bg-black/40 border-yellow-500/60 backdrop-blur-sm hover:border-yellow-400/80 transition-all duration-200 group shadow-lg hover:shadow-yellow-500/20">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-yellow-500/30 p-2 rounded-full mr-3 shadow-md shadow-yellow-500/20 ring-1 ring-yellow-500/30">
                          <Code className="h-5 w-5 text-yellow-300 drop-shadow-lg" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Development</h3>
                          <p className="text-xs text-gray-300/80">15% of budget</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-yellow-300 drop-shadow-lg">$37.5k</div>
                      <div className="text-sm text-gray-300/80">Product & infrastructure</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Burn Rate Calculations */}
                <div className="mt-6 pt-4 border-t border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 text-red-400 mr-2" />
                    Burn Rate Breakdown
                  </h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {/* Daily */}
                    <div className="bg-black/40 border-gray-500/60 rounded-lg p-3 backdrop-blur-sm hover:border-gray-400/80 transition-all duration-200 shadow-md hover:shadow-gray-500/10">
                      <div className="text-xs text-gray-300/80 mb-1">Daily</div>
                      <div className="text-lg font-bold text-red-300 drop-shadow-lg">${(250000 / 365).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    </div>
                    
                    {/* Weekly */}
                    <div className="bg-black/40 border-gray-500/60 rounded-lg p-3 backdrop-blur-sm hover:border-gray-400/80 transition-all duration-200 shadow-md hover:shadow-gray-500/10">
                      <div className="text-xs text-gray-300/80 mb-1">Weekly</div>
                      <div className="text-lg font-bold text-red-300 drop-shadow-lg">${(250000 / 52).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    </div>
                    
                    {/* Monthly */}
                    <div className="bg-black/40 border-gray-500/60 rounded-lg p-3 backdrop-blur-sm hover:border-gray-400/80 transition-all duration-200 shadow-md hover:shadow-gray-500/10">
                      <div className="text-xs text-gray-300/80 mb-1">Monthly</div>
                      <div className="text-lg font-bold text-red-300 drop-shadow-lg">${(250000 / 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    </div>
                    
                    {/* Quarterly */}
                    <div className="bg-black/40 border-gray-500/60 rounded-lg p-3 backdrop-blur-sm hover:border-gray-400/80 transition-all duration-200 shadow-md hover:shadow-gray-500/10">
                      <div className="text-xs text-gray-300/80 mb-1">Quarterly</div>
                      <div className="text-lg font-bold text-red-300 drop-shadow-lg">${(250000 / 4).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    </div>
                    
                    {/* Bi-Annual */}
                    <div className="bg-black/40 border-gray-500/60 rounded-lg p-3 backdrop-blur-sm hover:border-gray-400/80 transition-all duration-200 shadow-md hover:shadow-gray-500/10">
                      <div className="text-xs text-gray-300/80 mb-1">Bi-Annual</div>
                      <div className="text-lg font-bold text-red-300 drop-shadow-lg">${(250000 / 2).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    </div>
                    
                    {/* Yearly */}
                    <div className="bg-black/40 border-red-500/60 rounded-lg p-3 backdrop-blur-sm ring-1 ring-red-500/30 shadow-lg shadow-red-500/20">
                      <div className="text-xs text-red-300 mb-1">Yearly</div>
                      <div className="text-lg font-bold text-red-300 drop-shadow-lg">$250,000</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-4">Based on $250k yearly burn rate - monitor expenses to maintain runway and optimize efficiency</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </main>
      
      {/* Bottom right watermark */}
      <div className="fixed bottom-4 right-4 z-20">
        <img 
          src="/moneybot-logo.png" 
          alt="MoneyBot" 
          className="h-8 w-8 opacity-30 hover:opacity-60 transition-opacity duration-300 drop-shadow-lg"
        />
      </div>
    </div>
  );
};

export default SimpleDashboard;