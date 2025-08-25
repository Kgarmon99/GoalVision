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
    label: 'FOCUS MODE',
    icon: Target,
    color: 'from-green-500 to-green-600',
    bgColor: 'from-green-900/40 to-emerald-900/40',
    borderColor: 'border-green-500/60',
    glowColor: 'shadow-green-500/20'
  },
  'short-break': {
    label: 'QUICK BREAK',
    icon: Coffee,
    color: 'from-orange-500 to-orange-600',
    bgColor: 'from-orange-900/40 to-yellow-900/40',
    borderColor: 'border-orange-500/60',
    glowColor: 'shadow-orange-500/20'
  },
  'long-break': {
    label: 'LONG BREAK',
    icon: Coffee,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'from-blue-900/40 to-indigo-900/40',
    borderColor: 'border-blue-500/60',
    glowColor: 'shadow-blue-500/20'
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
      <Card className={`relative bg-gradient-to-br ${currentConfig.bgColor} ${currentConfig.borderColor} shadow-2xl backdrop-blur-sm overflow-hidden group hover:border-opacity-80 transition-all duration-300`}>
        {/* Cyberpunk glow effects */}
        <div className={`absolute inset-0 bg-gradient-to-br ${currentConfig.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
        <div className={`absolute inset-0 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]`}></div>
        
        <CardHeader className="pb-3 relative z-10">
          <CardTitle className="flex items-center justify-between text-lg text-white drop-shadow-lg">
            <div className="flex items-center gap-2">
              <div className={`bg-gradient-to-r ${currentConfig.color} p-2 rounded-full ${currentConfig.glowColor} shadow-lg ring-1 ring-white/20`}>
                <currentConfig.icon className="h-4 w-4 text-white drop-shadow-lg" />
              </div>
              FOCUS SYSTEM
            </div>
            <img 
              src="/moneybot-logo.png" 
              alt="MoneyBot" 
              className="h-6 w-6 opacity-60 drop-shadow-lg"
            />
          </CardTitle>
          <p className="text-xs text-gray-300/80 italic">
            "Deep work is the ability to focus without distraction." - Cal Newport
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4 relative z-10">
          {/* Mode Status */}
          <div className="text-center space-y-2">
            <div className={`bg-black/40 border ${currentConfig.borderColor} rounded-lg p-3 backdrop-blur-sm shadow-inner`}>
              <Badge variant="secondary" className={`bg-gradient-to-r ${currentConfig.color} text-white border-0 mb-2 font-bold text-xs tracking-wider`}>
                {currentConfig.label}
              </Badge>
              <div className="text-5xl font-mono font-bold text-white drop-shadow-lg">
                {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
              </div>
            </div>

            {/* Cyberpunk Progress Bar */}
            <div className="relative">
              <div className="bg-gray-800 rounded-full h-2 relative overflow-hidden border border-gray-600">
                <motion.div 
                  className={`bg-gradient-to-r ${currentConfig.color} h-full rounded-full relative`}
                  style={{ width: `${progress}%` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </motion.div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            <Button
              onClick={startPause}
              className={`flex-1 bg-gradient-to-r ${currentConfig.color} hover:opacity-90 text-white font-bold shadow-lg ${currentConfig.glowColor} transition-all duration-200`}
              size="sm"
            >
              {timer.isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  PAUSE
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  START
                </>
              )}
            </Button>
            <Button
              onClick={reset}
              variant="outline"
              size="sm"
              disabled={timer.isRunning}
              className="border-gray-500/60 text-gray-300 hover:bg-gray-800/50 hover:border-gray-400"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>

          {/* Mode Quick Switch */}
          <div className="grid grid-cols-3 gap-1">
            {Object.entries(MODE_CONFIG).map(([mode, config]) => (
              <Button
                key={mode}
                variant={timer.mode === mode ? "default" : "ghost"}
                size="sm"
                onClick={() => switchMode(mode as TimerMode)}
                className={`text-xs transition-all duration-200 ${
                  timer.mode === mode 
                    ? `bg-gradient-to-r ${config.color} text-white ${config.glowColor} shadow-lg` 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
                disabled={timer.isRunning}
              >
                <config.icon className="h-3 w-3 mr-1" />
                {mode === 'work' ? 'FOCUS' : mode === 'short-break' ? 'BREAK' : 'LONG'}
              </Button>
            ))}
          </div>

          {/* Stats Display */}
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-black/40 border border-gray-600/60 rounded-lg p-2 backdrop-blur-sm">
              <div className="text-xs text-gray-400 mb-1">SESSIONS</div>
              <div className="text-lg font-bold text-green-400 drop-shadow-lg">
                {timer.completedSessions}
              </div>
            </div>
            <div className="bg-black/40 border border-gray-600/60 rounded-lg p-2 backdrop-blur-sm">
              <div className="text-xs text-gray-400 mb-1">FOCUSED</div>
              <div className="text-lg font-bold text-orange-400 drop-shadow-lg">
                {timer.completedSessions * 25}m
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}