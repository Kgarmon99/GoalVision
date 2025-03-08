import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Rocket, Star, Trophy, CheckCircle, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedComponent } from '@/components/ui/animated-component';
import { AnimatedButton } from '@/components/ui/animated-button';

interface GoalCelebrationProps {
  goalName: string;
  progressPercentage: number;
  username?: string;
  isOpen: boolean;
  onClose: () => void;
}

export function GoalCelebration({ 
  goalName, 
  progressPercentage, 
  username = "Team", 
  isOpen, 
  onClose 
}: GoalCelebrationProps) {
  const [windowDimension, setWindowDimension] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [confettiRunning, setConfettiRunning] = useState(true);
  const [showFireworks, setShowFireworks] = useState(false);
  const [activeIcon, setActiveIcon] = useState(0);

  // Array of celebration icons
  const celebrationIcons = [
    <Trophy className="h-10 w-10 text-yellow-400" />,
    <Star className="h-10 w-10 text-yellow-400" />,
    <Award className="h-10 w-10 text-green-400" />,
    <CheckCircle className="h-10 w-10 text-green-500" />,
    <Sparkles className="h-10 w-10 text-purple-400" />,
    <Rocket className="h-10 w-10 text-blue-400" />
  ];

  // Detect window size
  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Rotate through celebration icons
  useEffect(() => {
    if (isOpen) {
      const iconInterval = setInterval(() => {
        setActiveIcon(prev => (prev + 1) % celebrationIcons.length);
      }, 1500);
      return () => clearInterval(iconInterval);
    }
  }, [isOpen, celebrationIcons.length]);

  // Manage confetti and animations
  useEffect(() => {
    if (isOpen) {
      setConfettiRunning(true);
      // Show fireworks for 100% completion
      if (progressPercentage >= 100) {
        setTimeout(() => {
          setShowFireworks(true);
        }, 500);
      }
      
      const timer = setTimeout(() => {
        setConfettiRunning(false);
      }, progressPercentage >= 100 ? 8000 : 5000); // Longer celebration for 100% completion
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, progressPercentage]);

  if (!isOpen) return null;

  // Generate a personalized message based on progress percentage
  const getMessage = () => {
    if (progressPercentage >= 100) {
      return `Congratulations, ${username}! You have achieved your "${goalName}" goal!`;
    } else if (progressPercentage >= 75) {
      return `Amazing progress, ${username}! You're ${progressPercentage}% of the way to your "${goalName}" goal.`;
    } else if (progressPercentage >= 50) {
      return `Great work, ${username}! You're more than halfway (${progressPercentage}%) to your "${goalName}" goal.`;
    } else if (progressPercentage >= 25) {
      return `Good progress, ${username}! You're ${progressPercentage}% of the way to your "${goalName}" goal.`;
    } else {
      return `You've started on your "${goalName}" goal! Keep going, ${username}!`;
    }
  };

  // Special styles for different achievement levels
  const getAchievementStyles = () => {
    if (progressPercentage >= 100) {
      return "border-yellow-500 shadow-yellow-500/30 from-yellow-950 to-green-950";
    } else if (progressPercentage >= 75) {
      return "border-green-500 shadow-green-500/30 from-green-950 to-blue-950";
    } else if (progressPercentage >= 50) {
      return "border-blue-500 shadow-blue-500/30 from-blue-950 to-purple-950";
    } else {
      return "border-purple-500 shadow-purple-500/30 from-purple-950 to-green-950";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {confettiRunning && (
            <ReactConfetti
              width={windowDimension.width}
              height={windowDimension.height}
              recycle={confettiRunning}
              numberOfPieces={progressPercentage >= 100 ? 300 : 200}
              gravity={0.15}
              colors={progressPercentage >= 100 
                ? ['#EAB308', '#10B981', '#3B82F6', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6'] 
                : ['#10B981', '#3B82F6', '#6366F1', '#F59E0B']}
              tweenDuration={5000}
            />
          )}
          
          {/* Fireworks effect for 100% completion */}
          {showFireworks && progressPercentage >= 100 && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="firework" style={{ top: '20%', left: '20%' }}></div>
              <div className="firework" style={{ top: '40%', left: '70%' }}></div>
              <div className="firework" style={{ top: '70%', left: '30%' }}></div>
              <div className="firework delay-1" style={{ top: '30%', left: '60%' }}></div>
              <div className="firework delay-2" style={{ top: '60%', left: '80%' }}></div>
            </div>
          )}
          
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="w-full max-w-md relative"
          >
            <Card className={`w-full border-2 bg-gradient-to-br ${getAchievementStyles()} shadow-lg shadow-primary/20 relative overflow-hidden celebration-card`}>
              {/* Animated sparkling border */}
              <div className="sparkle-border"></div>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="absolute right-2 top-2 h-8 w-8 p-0 text-gray-400 hover:text-white z-10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
              
              <CardHeader className="pb-1 pt-6">
                <AnimatedComponent animation="bounceIn" duration={0.7}>
                  <CardTitle className="text-center text-2xl text-yellow-400 font-bold drop-shadow-glow">
                    {progressPercentage >= 100 
                      ? "🏆 Goal Achieved! 🏆" 
                      : "🎯 Achievement Unlocked!"}
                  </CardTitle>
                </AnimatedComponent>
              </CardHeader>
              
              <CardContent className="pb-6">
                <div className="flex flex-col items-center space-y-4">
                  {/* Achievement circle with rotating icons */}
                  <AnimatedComponent 
                    animation="pulseIn" 
                    duration={2} 
                    iterationCount="infinite"
                    className="relative"
                  >
                    <motion.div 
                      className={`my-4 flex h-28 w-28 items-center justify-center rounded-full 
                        bg-gradient-to-br from-gray-900 to-gray-800 border-2 
                        ${progressPercentage >= 100 ? 'border-yellow-500' : 'border-green-500'} 
                        shadow-lg relative overflow-hidden`}
                      initial={{ rotate: 0 }}
                      animate={{ rotate: progressPercentage >= 100 ? 360 : 0 }}
                      transition={{ duration: progressPercentage >= 100 ? 20 : 0, repeat: Infinity, ease: "linear" }}
                    >
                      {/* Percentage display */}
                      <motion.span 
                        className={`text-3xl font-bold ${progressPercentage >= 100 ? 'text-yellow-400' : 'text-green-400'} drop-shadow-glow z-10`}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {progressPercentage}%
                      </motion.span>
                      
                      {/* Background circular rays */}
                      {progressPercentage >= 100 && (
                        <div className="absolute inset-0 achievement-rays"></div>
                      )}
                    </motion.div>
                    
                    {/* Orbiting icon */}
                    <motion.div
                      className="absolute"
                      initial={{ rotate: 0, scale: 1 }}
                      animate={{ 
                        rotate: 360,
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                        scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                      style={{ 
                        width: '120px', 
                        height: '120px',
                        top: '50%',
                        left: '50%',
                        marginLeft: '-60px',
                        marginTop: '-60px'
                      }}
                    >
                      <div className="absolute top-0 left-[calc(50%-16px)]">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={activeIcon}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                          >
                            {celebrationIcons[activeIcon]}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  </AnimatedComponent>
                  
                  {/* Achievement message */}
                  <AnimatedComponent animation="fadeIn" duration={0.7} delay={0.3}>
                    <motion.p 
                      className="text-center text-white font-medium px-4 text-glow"
                      initial={{ opacity: 0.8 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
                    >
                      {getMessage()}
                    </motion.p>
                  </AnimatedComponent>
                  
                  {/* Action buttons */}
                  <motion.div 
                    className="flex justify-center mt-4 gap-3"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <AnimatedButton 
                      variant="outline" 
                      size="sm" 
                      animation="pulse"
                      className={`${progressPercentage >= 100 ? 'border-yellow-500 text-yellow-400' : 'border-green-500 text-green-400'} hover:bg-gray-800 w-32 font-medium`}
                      onClick={onClose}
                    >
                      Continue
                    </AnimatedButton>
                    
                    <AnimatedButton 
                      size="sm" 
                      animation="shine"
                      className={`${progressPercentage >= 100 ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white w-32 font-medium`}
                      asChild
                    >
                      <a href="/add-task">Plan Next Steps</a>
                    </AnimatedButton>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}