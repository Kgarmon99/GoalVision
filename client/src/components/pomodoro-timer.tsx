import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Clock, Coffee, Target } from "lucide-react";
import { motion } from "framer-motion";

export interface PomodoroTimerProps {
  onComplete?: () => void;
  className?: string;
}

type TimerMode = 'work' | 'short-break' | 'long-break';

interface TimerState {
  minutes: number;
  seconds: number;
  isRunning: boolean;
  mode: TimerMode;
  completedSessions: number;
}

const TIMER_DURATIONS = {
  work: 25 * 60, // 25 minutes
  'short-break': 5 * 60, // 5 minutes
  'long-break': 15 * 60, // 15 minutes
};

const MODE_CONFIG = {
  work: {
    label: 'Focus Time',
    icon: Target,
    color: 'bg-red-500',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200'
  },
  'short-break': {
    label: 'Short Break',
    icon: Coffee,
    color: 'bg-green-500',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200'
  },
  'long-break': {
    label: 'Long Break',
    icon: Coffee,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200'
  }
};

export function PomodoroTimer({ onComplete, className = "" }: PomodoroTimerProps) {
  const [timer, setTimer] = useState<TimerState>({
    minutes: 25,
    seconds: 0,
    isRunning: false,
    mode: 'work',
    completedSessions: 0
  });

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const notificationPermissionRef = useRef<boolean>(false);

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          notificationPermissionRef.current = permission === 'granted';
        });
      } else {
        notificationPermissionRef.current = Notification.permission === 'granted';
      }
    } else {
      notificationPermissionRef.current = false;
    }
  }, []);

  // Save timer state to localStorage
  useEffect(() => {
    localStorage.setItem('pomodoro-timer', JSON.stringify(timer));
  }, [timer]);

  // Load timer state from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('pomodoro-timer');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Only restore if it's from today
        const savedDate = localStorage.getItem('pomodoro-date');
        const today = new Date().toDateString();
        if (savedDate === today) {
          setTimer(prev => ({ ...prev, ...parsed, isRunning: false }));
        } else {
          localStorage.setItem('pomodoro-date', today);
        }
      } catch (e) {
        console.log('Could not restore timer state');
      }
    }
  }, []);

  // Timer countdown effect
  useEffect(() => {
    if (timer.isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer(prev => {
          const totalSeconds = prev.minutes * 60 + prev.seconds;
          
          if (totalSeconds <= 1) {
            // Timer finished
            playNotification();
            const newCompletedSessions = prev.mode === 'work' ? prev.completedSessions + 1 : prev.completedSessions;
            const nextMode = getNextMode(prev.mode, newCompletedSessions);
            const duration = TIMER_DURATIONS[nextMode];
            
            if (prev.mode === 'work' && onComplete) {
              onComplete();
            }
            
            return {
              ...prev,
              minutes: Math.floor(duration / 60),
              seconds: duration % 60,
              isRunning: false,
              mode: nextMode,
              completedSessions: newCompletedSessions
            };
          }
          
          const newTotal = totalSeconds - 1;
          return {
            ...prev,
            minutes: Math.floor(newTotal / 60),
            seconds: newTotal % 60
          };
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timer.isRunning, onComplete]);

  const getNextMode = (currentMode: TimerMode, completedSessions: number): TimerMode => {
    if (currentMode === 'work') {
      return completedSessions % 4 === 0 ? 'long-break' : 'short-break';
    }
    return 'work';
  };

  const playNotification = () => {
    // Browser notification
    if (typeof window !== 'undefined' && 'Notification' in window && notificationPermissionRef.current) {
      try {
        new Notification('Pomodoro Timer', {
          body: timer.mode === 'work' ? 'Great focus session! Time for a break.' : 'Break time over! Ready to focus?',
          icon: '/favicon.ico'
        });
      } catch (e) {
        // Silent fail if notification creation fails
      }
    }

    // Audio notification (optional - browser beep)
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBzmN0/DNfSsGKXzI8N2QQQ');
        audio.play().catch(() => {
          // Silent fail if audio doesn't work
        });
      } catch (e) {
        // Silent fail
      }
    }
  };

  const startPause = () => {
    setTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
  };

  const reset = () => {
    setTimer(prev => {
      const duration = TIMER_DURATIONS[prev.mode];
      return {
        ...prev,
        minutes: Math.floor(duration / 60),
        seconds: duration % 60,
        isRunning: false
      };
    });
  };

  const switchMode = (mode: TimerMode) => {
    const duration = TIMER_DURATIONS[mode];
    setTimer(prev => ({
      ...prev,
      mode,
      minutes: Math.floor(duration / 60),
      seconds: duration % 60,
      isRunning: false
    }));
  };

  const currentConfig = MODE_CONFIG[timer.mode];
  const totalSeconds = TIMER_DURATIONS[timer.mode];
  const currentSeconds = timer.minutes * 60 + timer.seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      <Card className={`${currentConfig.bgColor} ${currentConfig.borderColor} border-2`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <currentConfig.icon className="h-5 w-5" />
            Pomodoro Focus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mode Selector */}
          <div className="flex gap-1">
            {Object.entries(MODE_CONFIG).map(([mode, config]) => (
              <Button
                key={mode}
                variant={timer.mode === mode ? "default" : "outline"}
                size="sm"
                onClick={() => switchMode(mode as TimerMode)}
                className="flex-1 text-xs"
                disabled={timer.isRunning}
              >
                <config.icon className="h-3 w-3 mr-1" />
                {mode === 'work' ? 'Focus' : mode === 'short-break' ? 'Break' : 'Long'}
              </Button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="text-center space-y-3">
            <div className="space-y-1">
              <Badge variant="secondary" className="text-xs">
                {currentConfig.label}
              </Badge>
              <div className="text-4xl font-mono font-bold text-gray-800">
                {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
              </div>
            </div>

            {/* Progress Bar */}
            <Progress 
              value={progress} 
              className="h-2"
            />
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={startPause}
              className={`flex-1 ${currentConfig.color} hover:opacity-90`}
              size="sm"
            >
              {timer.isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </>
              )}
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              size="sm"
              disabled={timer.isRunning}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Sessions Counter */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Sessions Today: {timer.completedSessions}
            </div>
            <div className="text-xs">
              {timer.completedSessions > 0 && (
                <span className="text-green-600 font-medium">
                  {timer.completedSessions * 25} min focused
                </span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}