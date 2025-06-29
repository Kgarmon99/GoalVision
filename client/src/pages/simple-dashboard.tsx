import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
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
  
  // Rotate quotes every 10 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prev => (prev + 1) % motivationalQuotes.length);
    }, 600000); // 10 minutes = 600,000 milliseconds
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
    const celebrationQuotes = [
      "🎉 Victory! Another step closer to empire!",
      "🚀 Excellence achieved! The #1 global brand is within reach!",
      "💎 Outstanding work! Champions finish what they start!",
      "⚡ Momentum building! Success breeds success!",
      "🏆 Another win! The world's best are defined by daily victories!"
    ];
    
    toast({
      title: priorityTask.completed ? "Task reopened" : celebrationQuotes[Math.floor(Math.random() * celebrationQuotes.length)],
      description: priorityTask.completed ? "Task marked as incomplete" : "Keep this energy - greatness is a daily habit!",
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
    <div className="min-h-screen flex flex-col relative overflow-hidden text-slate-800" style={{
      background: 'linear-gradient(135deg, #e8f4f8 0%, #f0f8ff 25%, #ffffff 50%, #f8fcff 75%, #e6f3ff 100%)'
    }}>

      
      {/* Natural Light Background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Soft natural light rays */}
        <div className="absolute inset-0" style={{
          background: `
            radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 50%),
            radial-gradient(circle at 80% 30%, rgba(173, 216, 230, 0.3) 0%, transparent 60%),
            radial-gradient(circle at 60% 80%, rgba(240, 248, 255, 0.4) 0%, transparent 70%)
          `
        }}></div>
        
        {/* Subtle floating particles like dust in natural light */}
        <div className="absolute top-1/4 left-1/6 w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-blue-100/80 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 left-1/2 w-1.5 h-1.5 bg-white/40 rounded-full animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute top-3/4 right-1/2 w-0.5 h-0.5 bg-sky-100/60 rounded-full animate-pulse" style={{ animationDelay: '6s' }}></div>
        
        {/* Soft light diffusion areas */}
        <div className="absolute top-1/4 right-1/3 w-40 h-40 bg-gradient-to-r from-white/15 to-blue-50/25 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 left-1/4 w-32 h-32 bg-gradient-to-r from-sky-50/20 to-white/15 rounded-full blur-3xl"></div>
        
        {/* Corner natural light effects */}
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-white/25 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-blue-50/25 to-transparent rounded-full blur-3xl"></div>
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
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent mb-2" style={{
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    MoneyBot Dashboard
                  </h1>
                  <p className="text-slate-600">Kentucky School Prospect Tracker</p>
                  <div className="mt-2 p-3 rounded-xl" style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}>
                    <p className="text-amber-700 font-semibold text-sm">🎯 Mission: Become the #1 Global Financial Brand</p>
                    <p className="text-slate-600 text-xs italic mt-1">"Success is not final, failure is not fatal: it is the courage to continue that counts." - Churchill</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 hidden sm:block rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.6)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                }}>
                  <span className="text-sm text-amber-600">🏆 Building Empire:</span>
                  <span className="text-sm font-bold text-amber-700 ml-1">Global Financial Dominance</span>
                </div>
                <div className="p-3 hidden md:block rounded-lg" style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                }}>
                  <span className="text-sm text-emerald-600">Last updated:</span>
                  <span className="text-sm font-medium text-slate-700 ml-1">{lastUpdated}</span>
                </div>
                <Button 
                  variant="outline"
                  onClick={handleRefreshData} 
                  disabled={isRefreshing}
                  className="text-emerald-700 hover:text-emerald-800 transition-all duration-200 border-0"
                  style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}
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
            <Card className="relative overflow-hidden group transition-all duration-300" style={{
              background: 'rgba(255, 255, 255, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
            }}>
              {/* Natural light reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-blue-50/10 opacity-60"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
              
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center mb-4">
                  <div className="p-3 rounded-full mr-4" style={{
                    background: 'rgba(255, 255, 255, 0.6)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.5)'
                  }}>
                    <Star className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-700">Most Important Thing Today</h2>
                    <p className="text-sm text-slate-600">Your #1 priority task to focus on</p>
                    <p className="text-xs text-amber-600 italic mt-1">"Focus is the ultimate leverage in business." - Gary Vaynerchuk</p>
                  </div>
                  <img 
                    src="/moneybot-logo.png" 
                    alt="MoneyBot" 
                    className="h-8 w-8 opacity-60 drop-shadow-lg"
                  />
                </div>
                <div className="rounded-lg p-4" style={{
                  background: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.05)'
                }}>
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
      
      {/* Floating motivational quote */}
      <motion.div 
        className="fixed bottom-20 right-4 z-20 max-w-xs"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        key={currentQuoteIndex}
      >
        <div className="bg-gradient-to-r from-purple-900/80 to-blue-900/80 backdrop-blur-sm border border-purple-500/40 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-purple-200 italic leading-relaxed">
            "{motivationalQuotes[currentQuoteIndex]}"
          </p>
          <div className="mt-2 w-full bg-purple-800/50 rounded-full h-1">
            <motion.div 
              className="h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 600, ease: "linear" }}
            />
          </div>
        </div>
      </motion.div>

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