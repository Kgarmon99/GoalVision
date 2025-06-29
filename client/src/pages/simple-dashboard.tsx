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
  DollarSign
} from "lucide-react";
import { Goal, Prospect } from "@shared/schema";
import { useState, useCallback } from "react";
import { format } from "date-fns";

const SimpleDashboard = () => {
  const { toast } = useToast();
  const [lastUpdated, setLastUpdated] = useState(format(new Date(), "MMMM d, yyyy 'at' h:mm a"));
  const [isRefreshing, setIsRefreshing] = useState(false);
  
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

  return (
    <div className="min-h-screen flex flex-col bg-black text-white relative cosmic-bg">
      {/* SimpleNav for consistent navigation */}
      <SimpleNav />
      
      {/* Galaxy Grid Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900"></div>
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        <div className="absolute inset-0 bg-gradient-radial from-green-900/10 via-transparent to-transparent"></div>
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
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-green-400 mb-2">
                  2025 Goals Dashboard
                </h1>
                <p className="text-gray-300">Stay focused on what matters most</p>
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
            <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-600/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="bg-yellow-500/20 p-3 rounded-full mr-4">
                    <Star className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-yellow-400">Most Important Thing Today</h2>
                    <p className="text-sm text-gray-300">Your #1 priority task to focus on</p>
                  </div>
                </div>
                <div className="bg-gray-800/50 rounded-lg p-4 border border-yellow-600/30">
                  <div className="flex items-center justify-between">
                    <span className="text-lg text-white">Close Shelby County Schools Deal</span>
                    <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-black">
                      Mark Complete
                    </Button>
                  </div>
                  <p className="text-sm text-gray-400 mt-2">Follow up on budget approval and finalize contract terms</p>
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
                <Target className="h-6 w-6 text-green-400 mr-3" />
                <h2 className="text-2xl font-bold text-green-400">Three Main Goals</h2>
              </div>
              <Button variant="outline" className="border-green-500 text-green-400 hover:bg-gray-800">
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
            <Card className="bg-gradient-to-br from-red-900/30 to-orange-900/30 border-red-600/50 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center mb-6">
                  <div className="bg-red-500/20 p-3 rounded-full mr-4">
                    <TrendingDown className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-red-400">Annual Burn Rate</h2>
                    <p className="text-sm text-gray-300">$250k yearly projection breakdown</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Talent - 50% */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                          <Users className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Talent</h3>
                          <p className="text-xs text-gray-400">50% of budget</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">$125k</div>
                      <div className="text-sm text-gray-400">Staff salaries & benefits</div>
                    </CardContent>
                  </Card>

                  {/* Sales & Marketing - 20% */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-green-500/20 p-2 rounded-full mr-3">
                          <Briefcase className="h-5 w-5 text-green-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Sales & Marketing</h3>
                          <p className="text-xs text-gray-400">20% of budget</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-green-400">$50k</div>
                      <div className="text-sm text-gray-400">Customer acquisition</div>
                    </CardContent>
                  </Card>

                  {/* Legal Fees - 15% */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-purple-500/20 p-2 rounded-full mr-3">
                          <Scale className="h-5 w-5 text-purple-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Legal Fees</h3>
                          <p className="text-xs text-gray-400">15% of budget</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-purple-400">$37.5k</div>
                      <div className="text-sm text-gray-400">Compliance & contracts</div>
                    </CardContent>
                  </Card>

                  {/* Development - 15% */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center mb-3">
                        <div className="bg-yellow-500/20 p-2 rounded-full mr-3">
                          <Code className="h-5 w-5 text-yellow-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">Development</h3>
                          <p className="text-xs text-gray-400">15% of budget</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-yellow-400">$37.5k</div>
                      <div className="text-sm text-gray-400">Product & infrastructure</div>
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
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">Daily</div>
                      <div className="text-lg font-bold text-red-400">${(250000 / 365).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    </div>
                    
                    {/* Weekly */}
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">Weekly</div>
                      <div className="text-lg font-bold text-red-400">${(250000 / 52).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    </div>
                    
                    {/* Monthly */}
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">Monthly</div>
                      <div className="text-lg font-bold text-red-400">${(250000 / 12).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    </div>
                    
                    {/* Quarterly */}
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">Quarterly</div>
                      <div className="text-lg font-bold text-red-400">${(250000 / 4).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    </div>
                    
                    {/* Bi-Annual */}
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                      <div className="text-xs text-gray-400 mb-1">Bi-Annual</div>
                      <div className="text-lg font-bold text-red-400">${(250000 / 2).toLocaleString('en-US', { maximumFractionDigits: 0 })}</div>
                    </div>
                    
                    {/* Yearly */}
                    <div className="bg-gray-800/50 rounded-lg p-3 border border-red-600/50">
                      <div className="text-xs text-red-300 mb-1">Yearly</div>
                      <div className="text-lg font-bold text-red-400">$250,000</div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-400 mt-4">Based on $250k yearly burn rate - monitor expenses to maintain runway and optimize efficiency</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default SimpleDashboard;