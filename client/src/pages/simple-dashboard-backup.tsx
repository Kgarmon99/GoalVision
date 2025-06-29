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
  const [lastUpdated, setLastUpdated] = useState(format(new Date(), 'HH:mm'));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [priorityTask, setPriorityTask] = useState({
    title: "Close Western Kentucky University Deal",
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
  const { data: goals = [], isLoading, refetch: refetchGoals } = useQuery({
    queryKey: ['/api/goals'],
  });

  // Fetch prospects  
  const { data: prospects = [], refetch: refetchProspects } = useQuery({
    queryKey: ['/api/prospects/top/10'],
  });

  const topThreeGoals = goals.slice(0, 3);

  const handleRefreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refetchGoals(), refetchProspects()]);
      setLastUpdated(format(new Date(), 'HH:mm'));
      toast({
        title: "Data refreshed",
        description: "All dashboard data has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Refresh failed",
        description: "There was an error updating the data. Please try again.",
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
  }, []);

  const handleSaveTask = useCallback(() => {
    setPriorityTask(prev => ({
      ...prev,
      title: editTaskTitle.trim() || prev.title,
      description: editTaskDescription.trim() || prev.description
    }));
    setIsEditingTask(false);
    toast({
      title: "Task updated",
      description: "Your priority task has been saved successfully.",
    });
  }, [editTaskTitle, editTaskDescription, toast]);

  const handleCancelEdit = useCallback(() => {
    setEditTaskTitle(priorityTask.title);
    setEditTaskDescription(priorityTask.description);
    setIsEditingTask(false);
  }, [priorityTask.title, priorityTask.description]);

  // Update edit state when priority task changes
  useEffect(() => {
    setEditTaskTitle(priorityTask.title);
    setEditTaskDescription(priorityTask.description);
  }, [priorityTask.title, priorityTask.description]);

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative cosmic-bg" style={{
      perspective: '1000px'
    }}>
      
      {/* Electric Galaxy Background with 3D Effects */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-gray-950 to-black"></div>
        
        {/* Electric grid overlay with 3D effects */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))',
          transform: 'translateZ(10px)'
        }}></div>
        
        {/* Glowing orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse" style={{
          transform: 'translateZ(20px)',
          boxShadow: '0 0 100px rgba(16, 185, 129, 0.2)'
        }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{ 
          animationDelay: '2s',
          transform: 'translateZ(15px)',
          boxShadow: '0 0 80px rgba(59, 130, 246, 0.2)'
        }}></div>
        
        {/* Electric lines */}
        <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-green-400/20 to-transparent animate-pulse" style={{
          transform: 'translateZ(5px)',
          filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))'
        }}></div>
        <div className="absolute top-1/3 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-400/20 to-transparent animate-pulse" style={{ 
          animationDelay: '1s',
          transform: 'translateZ(5px)',
          filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.8))'
        }}></div>
        
        {/* Corner glow effects */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-400/10 to-transparent rounded-full blur-xl"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-blue-400/10 to-transparent rounded-full blur-xl"></div>
      </div>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          
          {/* 3D Header with Beautiful Lighting */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: -20, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ 
              transformStyle: 'preserve-3d',
              filter: 'drop-shadow(0 20px 40px rgba(0, 0, 0, 0.3))'
            }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" style={{
              transform: 'translateZ(20px)',
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '20px',
              padding: '24px',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              boxShadow: `
                inset 0 1px 0 rgba(255, 255, 255, 0.1),
                0 10px 30px rgba(0, 0, 0, 0.3),
                0 0 60px rgba(16, 185, 129, 0.1)
              `
            }}>
              <div className="flex items-center gap-4">
                <div style={{
                  transform: 'translateZ(15px)',
                  filter: 'drop-shadow(0 8px 16px rgba(16, 185, 129, 0.4))'
                }}>
                  <img 
                    src="/moneybot-logo.png" 
                    alt="MoneyBot Logo" 
                    className="h-14 w-14"
                    style={{
                      filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.6)) brightness(1.2)',
                      animation: 'float 6s ease-in-out infinite'
                    }}
                  />
                </div>
                <div style={{ transform: 'translateZ(10px)' }}>
                  <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #34d399 50%, #6ee7b7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 4px 8px rgba(16, 185, 129, 0.3))',
                    textShadow: '0 0 30px rgba(16, 185, 129, 0.5)'
                  }}>
                    MoneyBot Dashboard
                  </h1>
                  <p className="text-gray-300 mb-3" style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
                  }}>Kentucky School Prospect Tracker</p>
                  <div className="p-3 rounded-xl" style={{
                    background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(251, 191, 36, 0.15) 100%)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    transform: 'translateZ(5px)',
                    boxShadow: `
                      inset 0 1px 0 rgba(255, 255, 255, 0.1),
                      0 4px 12px rgba(234, 179, 8, 0.2),
                      0 0 30px rgba(234, 179, 8, 0.1)
                    `
                  }}>
                    <p className="font-semibold text-sm" style={{
                      background: 'linear-gradient(135deg, #eab308 0%, #fbbf24 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      filter: 'drop-shadow(0 2px 4px rgba(234, 179, 8, 0.3))'
                    }}>🎯 Mission: Become the #1 Global Financial Brand</p>
                    <p className="text-xs italic mt-1" style={{
                      color: 'rgba(251, 191, 36, 0.8)',
                      filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))'
                    }}>"Success is not final, failure is not fatal: it is the courage to continue that counts." - Churchill</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4" style={{ transform: 'translateZ(10px)' }}>
                <div className="rounded-xl p-3 hidden sm:block" style={{
                  background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.2) 0%, rgba(251, 146, 60, 0.15) 100%)',
                  border: '1px solid rgba(234, 179, 8, 0.3)',
                  transform: 'translateZ(8px)',
                  boxShadow: `
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 6px 18px rgba(234, 179, 8, 0.2),
                    0 0 40px rgba(234, 179, 8, 0.1)
                  `,
                  backdropFilter: 'blur(10px)'
                }}>
                  <span className="text-sm" style={{
                    background: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>🏆 Building Empire:</span>
                  <span className="text-sm font-bold ml-1" style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    filter: 'drop-shadow(0 2px 4px rgba(234, 179, 8, 0.3))'
                  }}>Global Financial Dominance</span>
                </div>
                <div className="rounded-xl p-3 hidden md:block" style={{
                  background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 58, 78, 0.6) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  transform: 'translateZ(8px)',
                  boxShadow: `
                    inset 0 1px 0 rgba(255, 255, 255, 0.1),
                    0 6px 18px rgba(16, 185, 129, 0.2),
                    0 0 40px rgba(16, 185, 129, 0.1)
                  `,
                  backdropFilter: 'blur(10px)'
                }}>
                  <span className="text-sm" style={{
                    color: '#10b981',
                    filter: 'drop-shadow(0 2px 4px rgba(16, 185, 129, 0.3))'
                  }}>Last updated:</span>
                  <span className="text-sm font-medium text-white ml-1" style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))'
                  }}>{lastUpdated}</span>
                </div>
                <div style={{
                  transform: 'translateZ(12px)',
                  filter: 'drop-shadow(0 8px 16px rgba(16, 185, 129, 0.2))'
                }}>
                  <Button 
                    variant="outline"
                    onClick={handleRefreshData} 
                    disabled={isRefreshing}
                    className="rounded-xl border-2 transition-all duration-300 hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%)',
                      borderColor: 'rgba(16, 185, 129, 0.6)',
                      color: '#10b981',
                      backdropFilter: 'blur(10px)',
                      boxShadow: `
                        inset 0 1px 0 rgba(255, 255, 255, 0.1),
                        0 4px 12px rgba(16, 185, 129, 0.2),
                        0 0 30px rgba(16, 185, 129, 0.1)
                      `
                    }}
                  >
                    {isRefreshing ? (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-1 animate-spin" style={{
                          filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))'
                        }} />
                        <span className="hidden sm:inline">Refreshing...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="h-4 w-4 mr-1" style={{
                          filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))'
                        }} />
                        <span className="hidden sm:inline">Refresh</span>
                      </>
                    )}
                  </Button>
                </div>
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
                          className="bg-green-600 hover:bg-green-700 text-white border-green-500"
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={handleCancelEdit}
                          className="border-gray-500 text-gray-300 hover:bg-gray-800"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className={`text-lg font-semibold ${priorityTask.completed ? 'text-green-400 line-through' : 'text-white'}`}>
                          {priorityTask.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={handleEditTask}
                            className="border-yellow-500/60 text-yellow-300 hover:bg-yellow-900/20"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={handleMarkComplete}
                            className={priorityTask.completed ? 
                              "bg-gray-600 hover:bg-gray-700 text-white" : 
                              "bg-green-600 hover:bg-green-700 text-white"
                            }
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {priorityTask.completed ? 'Reopen' : 'Complete'}
                          </Button>
                        </div>
                      </div>
                      <p className={`text-sm ${priorityTask.completed ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                        {priorityTask.description}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Goals and Prospects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Goals Section */}
            <div className="lg:col-span-2">
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
                <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <Target className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">No Goals Yet</h3>
                    <p className="text-gray-500 mb-4">Start by creating your first goal to track your progress</p>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Goal
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Prospects Section */}
            <div>
              <TopProspects prospects={prospects} />
            </div>
          </div>

          {/* Burn Rate Section */}
          <motion.div 
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
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
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-black/30 rounded-lg p-4 border border-red-500/40 backdrop-blur-sm text-center">
                    <Users className="h-6 w-6 text-red-300 mx-auto mb-2 drop-shadow-lg" />
                    <div className="text-2xl font-bold text-white drop-shadow-lg">$125k</div>
                    <div className="text-sm text-red-200/80">Talent (50%)</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-red-500/40 backdrop-blur-sm text-center">
                    <Briefcase className="h-6 w-6 text-red-300 mx-auto mb-2 drop-shadow-lg" />
                    <div className="text-2xl font-bold text-white drop-shadow-lg">$50k</div>
                    <div className="text-sm text-red-200/80">Sales/Marketing (20%)</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-red-500/40 backdrop-blur-sm text-center">
                    <Scale className="h-6 w-6 text-red-300 mx-auto mb-2 drop-shadow-lg" />
                    <div className="text-2xl font-bold text-white drop-shadow-lg">$37.5k</div>
                    <div className="text-sm text-red-200/80">Legal (15%)</div>
                  </div>
                  <div className="bg-black/30 rounded-lg p-4 border border-red-500/40 backdrop-blur-sm text-center">
                    <Code className="h-6 w-6 text-red-300 mx-auto mb-2 drop-shadow-lg" />
                    <div className="text-2xl font-bold text-white drop-shadow-lg">$37.5k</div>
                    <div className="text-sm text-red-200/80">Development (15%)</div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gradient-to-r from-green-900/30 to-blue-900/30 rounded-lg border border-green-500/40">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-400 mr-2 drop-shadow-lg" />
                    <span className="text-green-300 font-semibold">Monthly Target: $20.8k</span>
                    <span className="text-gray-400 ml-2">• Weekly: $5.2k • Daily: $685</span>
                  </div>
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