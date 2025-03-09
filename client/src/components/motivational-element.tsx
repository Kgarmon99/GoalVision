
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Target } from "lucide-react";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { Button } from "@/components/ui/button";

export function MotivationalElement() {
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  
  if (dismissed) return null;
  
  const quotes = [
    "Focus on the process, not the outcome.",
    "The key to greatness is to be locked in at all times.",
    "Success is not a destination, it's a journey.",
    "Discipline is choosing between what you want now and what you want most.",
    "When adversity hits, your mind has to prevail.",
    "Commitment is doing the thing you said you'd do long after the mood you said it in has left.",
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  
  return (
    <AnimatedComponent
      animation="fadeIn"
      duration={0.5}
      className="w-full"
    >
      <Card className="relative bg-black border-gray-800 overflow-hidden hover:border-green-800 transition-all duration-300">
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 right-2 z-10 p-1 h-6 w-6 bg-black/30 hover:bg-black/50 text-gray-400"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardContent className="p-0 cursor-pointer" onClick={() => setExpanded(!expanded)}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-0"></div>
            <img 
              src="/lebron-locked-in.webp" 
              alt="Motivational image" 
              className="h-32 w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 p-4 text-white z-10 w-full">
              <p className="text-sm font-semibold text-white">LOCKED IN</p>
              <p className="text-xs text-green-400 flex items-center mt-1">
                Find your focus
                <ArrowRight className="h-3 w-3 ml-1" />
              </p>
            </div>
          </div>
          
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 py-3 text-gray-300 text-sm"
              >
                <div className="mb-2 font-medium text-green-400">{randomQuote}</div>
                <p className="text-xs text-gray-400">
                  Reaching your goals requires the same level of focus and determination shown by the greatest athletes.
                  Stay locked in on what matters most. Ignore distractions. Execute your plan consistently.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </AnimatedComponent>
  );
}
