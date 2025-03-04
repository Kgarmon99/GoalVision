import { useState } from 'react';

interface GoalCelebrationData {
  goalName: string;
  progressPercentage: number;
  username?: string;
}

export function useGoalCelebration() {
  const [isOpen, setIsOpen] = useState(false);
  const [celebrationData, setCelebrationData] = useState<GoalCelebrationData>({
    goalName: '',
    progressPercentage: 0,
    username: 'Team',
  });

  const triggerCelebration = (data: GoalCelebrationData) => {
    setCelebrationData(data);
    setIsOpen(true);
  };

  const closeCelebration = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    celebrationData,
    triggerCelebration,
    closeCelebration,
  };
}