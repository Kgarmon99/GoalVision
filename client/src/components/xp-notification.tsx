import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Trophy, Award } from "lucide-react";

interface XpNotificationProps {
  xpAmount: number;
  description: string;
  eventType: string;
  show: boolean;
  onClose: () => void;
}

export function XpNotification({ xpAmount, description, eventType, show, onClose }: XpNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  const getIcon = () => {
    if (eventType === 'goal_completed') return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (eventType === 'achievement') return <Award className="h-6 w-6 text-purple-500" />;
    return <Zap className="h-6 w-6 text-primary" />;
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ type: "spring", damping: 15 }}
          className="fixed top-24 right-8 z-50 glass-premium border-2 border-primary/60 rounded-xl p-4 shadow-2xl min-w-[300px]"
          style={{
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 0 60px rgba(16, 185, 129, 0.3)'
          }}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0] }}
              transition={{ duration: 0.5 }}
            >
              {getIcon()}
            </motion.div>
            <div className="flex-1">
              <p className="text-white font-semibold">{description}</p>
              <p className="text-primary font-bold text-lg">+{xpAmount} XP</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
