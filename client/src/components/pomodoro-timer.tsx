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
    // Smart notification messages
    const messages = {
      'work-complete': {
        title: '🎯 Focus Session Complete!',
        body: 'Amazing work! You earned a break. Your brain needs rest to stay sharp.',
      },
      'break-complete': {
        title: '⚡ Break Over!',
        body: 'Refreshed and ready? Time to dive back into deep work.',
      }
    };

    const messageKey = timer.mode === 'work' ? 'work-complete' : 'break-complete';
    const message = messages[messageKey];

    // Browser notification
    if (typeof window !== 'undefined' && 'Notification' in window && notificationPermissionRef.current) {
      try {
        new Notification(message.title, {
          body: message.body,
          icon: '/moneybot-logo.png',
          tag: 'pomodoro-timer',
          requireInteraction: false
        });
      } catch (e) {
        // Silent fail if notification creation fails
      }
    }

    // Subtle success sound
    if (typeof window !== 'undefined') {
      try {
        // Create a simple success tone
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Success chord progression
        const frequencies = timer.mode === 'work' ? [523, 659, 784] : [392, 494, 588]; // C-E-G major vs G-B-D
        let delay = 0;
        
        frequencies.forEach(freq => {
          setTimeout(() => {
            const osc = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc.connect(gain);
            gain.connect(audioContext.destination);
            
            osc.frequency.value = freq;
            osc.type = 'sine';
            
            gain.gain.setValueAtTime(0.1, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            osc.start();
            osc.stop(audioContext.currentTime + 0.3);
          }, delay);
          delay += 100;
        });
      } catch (e) {
        // Silent fail - fallback to simple beep
        try {
          const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAcBzmN0/DNfSsGKXzI8N2QQQ');
          audio.volume = 0.3;
          audio.play().catch(() => {});
        } catch (fallbackError) {
          // Complete silent fail
        }
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

  // Smart contextual tips
  const getContextualTip = () => {
    if (timer.isRunning) {
      if (timer.mode === 'work') {
        if (progress < 25) return "🧠 Deep work begins now";
        if (progress < 50) return "⚡ You're in the zone";
        if (progress < 75) return "🎯 Stay focused, almost there";
        return "🔥 Final push, you've got this";
      } else {
        if (progress < 50) return "😌 Let your mind rest";
        return "⚡ Getting recharged";
      }
    } else {
      if (timer.mode === 'work') {
        return timer.completedSessions === 0 
          ? "🚀 Ready for your first focus session?"
          : "💪 Ready for another deep work session?";
      } else {
        return "☕ Take a well-deserved break";
      }
    }
  };

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
        
        <CardContent className="space-y-3 relative z-10">
          {/* Large Timer Display */}
          <div className="text-center">
            <div className={`bg-black/40 border ${currentConfig.borderColor} rounded-lg p-4 backdrop-blur-sm shadow-inner relative overflow-hidden`}>
              {/* Animated background pulse */}
              {timer.isRunning && (
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-r ${currentConfig.color} opacity-5`}
                  animate={{ opacity: [0.05, 0.15, 0.05] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              
              <div className="relative z-10">
                <Badge variant="secondary" className={`bg-gradient-to-r ${currentConfig.color} text-white border-0 mb-3 font-bold text-sm tracking-wider`}>
                  {currentConfig.label}
                </Badge>
                
                {/* Massive timer display */}
                <div className="text-6xl font-mono font-bold text-white drop-shadow-lg mb-2">
                  {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
                </div>
                
                {/* Smart contextual tip */}
                <div className="text-sm text-gray-300 font-medium">
                  {getContextualTip()}
                </div>
              </div>
            </div>

            {/* Intuitive Progress Ring */}
            <div className="relative w-32 h-32 mx-auto my-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                {/* Background ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="rgb(55, 65, 81)"
                  strokeWidth="8"
                  fill="none"
                  className="opacity-30"
                />
                {/* Progress ring */}
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke={`url(#gradient-${timer.mode})`}
                  strokeWidth="8"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * progress / 100)}
                  initial={{ strokeDashoffset: 283 }}
                  animate={{ strokeDashoffset: 283 - (283 * progress / 100) }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="drop-shadow-lg"
                />
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="gradient-work" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(34, 197, 94)" />
                    <stop offset="100%" stopColor="rgb(22, 163, 74)" />
                  </linearGradient>
                  <linearGradient id="gradient-short-break" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(249, 115, 22)" />
                    <stop offset="100%" stopColor="rgb(234, 88, 12)" />
                  </linearGradient>
                  <linearGradient id="gradient-long-break" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="rgb(59, 130, 246)" />
                    <stop offset="100%" stopColor="rgb(37, 99, 235)" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* Center percentage */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-white drop-shadow-lg">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          </div>

          {/* One-Click Action */}
          <Button
            onClick={startPause}
            className={`w-full h-12 bg-gradient-to-r ${currentConfig.color} hover:opacity-90 text-white font-bold text-lg shadow-lg ${currentConfig.glowColor} transition-all duration-200 relative overflow-hidden group`}
          >
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            
            <div className="relative z-10 flex items-center justify-center">
              {timer.isRunning ? (
                <>
                  <Pause className="h-6 w-6 mr-3" />
                  PAUSE SESSION
                </>
              ) : (
                <>
                  <Play className="h-6 w-6 mr-3" />
                  {timer.mode === 'work' ? 'START FOCUSING' : 'START BREAK'}
                </>
              )}
            </div>
          </Button>

          {/* Quick Actions Row */}
          <div className="flex gap-2">
            <Button
              onClick={reset}
              variant="outline"
              size="sm"
              disabled={timer.isRunning}
              className="flex-1 border-gray-500/60 text-gray-300 hover:bg-gray-800/50 hover:border-gray-400 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-2" />
              RESET
            </Button>
            
            <Button
              onClick={() => {
                const nextMode = timer.mode === 'work' ? 'short-break' : 'work';
                switchMode(nextMode);
              }}
              variant="outline"
              size="sm"
              disabled={timer.isRunning}
              className="flex-1 border-gray-500/60 text-gray-300 hover:bg-gray-800/50 hover:border-gray-400 text-xs"
            >
              {timer.mode === 'work' ? (
                <>
                  <Coffee className="h-3 w-3 mr-2" />
                  BREAK
                </>
              ) : (
                <>
                  <Target className="h-3 w-3 mr-2" />
                  FOCUS
                </>
              )}
            </Button>
          </div>

          {/* Compact Stats */}
          <div className="flex justify-between text-center pt-2 border-t border-gray-700/50">
            <div>
              <div className="text-xs text-gray-400">Today</div>
              <div className="text-sm font-bold text-green-400">
                {timer.completedSessions} sessions
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Focus Time</div>
              <div className="text-sm font-bold text-orange-400">
                {timer.completedSessions * 25}m
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400">Mode</div>
              <div className="text-sm font-bold text-white">
                {timer.mode === 'work' ? 'Focus' : 'Break'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}