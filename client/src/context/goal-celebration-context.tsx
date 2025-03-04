import React, { createContext, useContext, ReactNode } from 'react';
import { useGoalCelebration } from '../hooks/use-goal-celebration';
import { GoalCelebration } from '../components/goal-celebration';

interface GoalCelebrationContextType {
  triggerCelebration: (data: {
    goalName: string;
    progressPercentage: number;
    username?: string;
  }) => void;
}

const GoalCelebrationContext = createContext<GoalCelebrationContextType | undefined>(undefined);

export function useGoalCelebrationContext() {
  const context = useContext(GoalCelebrationContext);
  if (context === undefined) {
    throw new Error('useGoalCelebrationContext must be used within a GoalCelebrationProvider');
  }
  return context;
}

interface GoalCelebrationProviderProps {
  children: ReactNode;
}

export function GoalCelebrationProvider({ children }: GoalCelebrationProviderProps) {
  const {
    isOpen,
    celebrationData,
    triggerCelebration,
    closeCelebration,
  } = useGoalCelebration();

  return (
    <GoalCelebrationContext.Provider value={{ triggerCelebration }}>
      {children}
      <GoalCelebration
        goalName={celebrationData.goalName}
        progressPercentage={celebrationData.progressPercentage}
        username={celebrationData.username}
        isOpen={isOpen}
        onClose={closeCelebration}
      />
    </GoalCelebrationContext.Provider>
  );
}