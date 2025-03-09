
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, X, Target } from "lucide-react";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { Button } from "@/components/ui/button";

// Inline static image
const MOTIVATIONAL_IMAGE_BASE64 = "data:image/jpeg;base64,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";

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
              src={MOTIVATIONAL_IMAGE_BASE64}
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
