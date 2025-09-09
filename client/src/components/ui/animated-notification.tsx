import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react";

export type NotificationType = "success" | "error" | "warning" | "info";
export type NotificationPosition = "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";

interface AnimatedNotificationProps {
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number; // in milliseconds, 0 means persist indefinitely
  onClose?: () => void;
  position?: NotificationPosition;
  showIcon?: boolean;
  showClose?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

const getIcon = (type: NotificationType) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "error":
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getPositionStyles = (position: NotificationPosition): React.CSSProperties => {
  switch (position) {
    case "top-right":
      return { top: "1rem", right: "1rem" };
    case "top-left":
      return { top: "1rem", left: "1rem" };
    case "bottom-right":
      return { bottom: "1rem", right: "1rem" };
    case "bottom-left":
      return { bottom: "1rem", left: "1rem" };
    case "top-center":
      return { top: "1rem", left: "50%", transform: "translateX(-50%)" };
    case "bottom-center":
      return { bottom: "1rem", left: "50%", transform: "translateX(-50%)" };
  }
};

const getEntranceAnimation = (position: NotificationPosition) => {
  if (position.includes("top")) {
    return { y: -50, opacity: 0 };
  }
  if (position.includes("bottom")) {
    return { y: 50, opacity: 0 };
  }
  return { opacity: 0 };
};

const getTypeStyles = (type: NotificationType) => {
  switch (type) {
    case "success":
      return "border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20";
    case "error":
      return "border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20";
    case "warning":
      return "border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20";
    case "info":
      return "border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20";
  }
};

export function AnimatedNotification({
  type,
  title,
  message,
  duration = 5000,
  onClose,
  position = "top-right",
  showIcon = true,
  showClose = true,
  actionLabel,
  onAction
}: AnimatedNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  // Set up auto-dismiss
  useEffect(() => {
    let timer: number;
    if (duration > 0) {
      timer = window.setTimeout(() => {
        setIsVisible(false);
      }, duration);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [duration]);

  // Handle actual close
  const handleClose = () => {
    setIsVisible(false);
  };

  // After exit animation completes
  const handleAnimationComplete = () => {
    if (!isVisible && onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed z-50" style={getPositionStyles(position)}>
      <AnimatePresence onExitComplete={handleAnimationComplete}>
        {isVisible && (
          <motion.div
            initial={getEntranceAnimation(position)}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="w-80 shadow-lg rounded-md overflow-hidden"
          >
            <Card className={`${getTypeStyles(type)} dark:bg-gray-900 shadow-xl`}>
              <div className="p-4">
                <div className="flex items-start">
                  {showIcon && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex-shrink-0 mr-3"
                    >
                      {getIcon(type)}
                    </motion.div>
                  )}
                  <div className="flex-1 ml-2">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
                    {message && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-1 text-xs text-gray-500 dark:text-gray-400"
                      >
                        {message}
                      </motion.p>
                    )}
                    
                    {actionLabel && onAction && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-3"
                      >
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={onAction}
                          className="text-xs h-7 px-2"
                        >
                          {actionLabel}
                        </Button>
                      </motion.div>
                    )}
                  </div>
                  
                  {showClose && (
                    <button
                      onClick={handleClose}
                      className="flex-shrink-0 ml-1"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Progress bar for auto-dismiss */}
              {duration > 0 && (
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                  className={`h-0.5 ${
                    type === "success" ? "bg-green-500" :
                    type === "error" ? "bg-red-500" :
                    type === "warning" ? "bg-yellow-500" :
                    "bg-blue-500"
                  }`}
                />
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}