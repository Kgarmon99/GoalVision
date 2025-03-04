import React, { useState, useEffect } from 'react';
import ReactConfetti from 'react-confetti';
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  // Stop confetti after 5 seconds
  useEffect(() => {
    if (isOpen) {
      setConfettiRunning(true);
      const timer = setTimeout(() => {
        setConfettiRunning(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      {confettiRunning && (
        <ReactConfetti
          width={windowDimension.width}
          height={windowDimension.height}
          recycle={confettiRunning}
          numberOfPieces={200}
          gravity={0.15}
          colors={['#10B981', '#3B82F6', '#6366F1', '#F59E0B', '#EF4444']}
        />
      )}
      
      <Card className="w-full max-w-md border border-green-500 bg-gray-900 shadow-lg shadow-green-500/20 relative overflow-hidden">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute right-2 top-2 h-8 w-8 p-0 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader className="pb-2 pt-6">
          <CardTitle className="text-center text-green-400">Achievement Unlocked!</CardTitle>
        </CardHeader>
        
        <CardContent className="pb-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="my-4 flex h-24 w-24 items-center justify-center rounded-full bg-green-900/40 border-2 border-green-500">
              <span className="text-3xl font-bold text-green-400">{progressPercentage}%</span>
            </div>
            
            <p className="text-center text-white font-medium px-4">{getMessage()}</p>
            
            <div className="flex justify-center mt-4 gap-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-500 text-green-400 hover:bg-green-900/40 w-32"
                onClick={onClose}
              >
                Continue
              </Button>
              <Button 
                size="sm" 
                className="bg-green-600 hover:bg-green-700 text-white w-32"
                asChild
              >
                <a href="/add-task">Add Next Task</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}