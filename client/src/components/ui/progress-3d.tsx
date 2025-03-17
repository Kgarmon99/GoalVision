import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
import "../ui/3d-effects.css";
import { useEffect, useState } from "react";

interface Progress3DProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorClassName?: string;
  showValue?: boolean;
  valueClassName?: string;
  height?: string;
  glowEffect?: boolean;
  pulseEffect?: boolean;
  showParticles?: boolean;
  showLabel?: boolean;
  labelText?: string;
  labelClassName?: string;
  particleCount?: number;
  extreme3D?: boolean;
}

const Progress3D = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  Progress3DProps
>(({ 
  className, 
  value = 0, 
  indicatorClassName, 
  showValue = false, 
  valueClassName,
  height = "h-3",
  glowEffect = true,
  pulseEffect = false,
  showParticles = false,
  showLabel = false,
  labelText,
  labelClassName,
  particleCount = 3,
  extreme3D = true,
  ...props 
}, ref) => {
  const numberValue = Number(value);
  const [animatedValue, setAnimatedValue] = useState(0);
  
  // Animate value changes
  useEffect(() => {
    const duration = 1000; // Animation duration in ms
    const start = animatedValue;
    const end = numberValue;
    const range = end - start;
    const increment = range / (duration / 16); // Assuming 60fps
    const startTime = Date.now();
    
    const animateValue = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      
      if (elapsed >= duration) {
        setAnimatedValue(end);
        return;
      }
      
      setAnimatedValue(start + (increment * elapsed));
      requestAnimationFrame(animateValue);
    };
    
    const animationFrame = requestAnimationFrame(animateValue);
    
    return () => cancelAnimationFrame(animationFrame);
  }, [numberValue]);
  
  // Generate color based on progress value
  const getProgressColor = (value: number) => {
    if (value >= 75) return "bg-gradient-to-r from-green-600 via-green-500 to-emerald-400";
    if (value >= 50) return "bg-gradient-to-r from-yellow-600 via-yellow-500 to-amber-400";
    if (value >= 25) return "bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400";
    return "bg-gradient-to-r from-red-700 via-red-600 to-red-400";
  };
  
  // Apply glow effect based on progress value
  const getGlowEffect = (value: number) => {
    if (!glowEffect) return "";
    
    if (value >= 75) return "shadow-lg shadow-green-500/40";
    if (value >= 50) return "shadow-md shadow-yellow-500/40";
    if (value >= 25) return "shadow-md shadow-orange-500/40";
    return "shadow-md shadow-red-600/40";
  };
  
  // Apply pulse animation for certain thresholds
  const getPulseEffect = (value: number) => {
    if (!pulseEffect) return "";
    
    if (value >= 100) return "animate-pulse";
    if (value <= 10) return "animate-pulse";
    return "";
  };
  
  // Generate random particles for enhanced visual effect
  const renderParticles = () => {
    if (!showParticles) return null;
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: particleCount }).map((_, index) => {
          const randomTop = Math.random() * 100;
          const randomLeft = Math.min(numberValue, Math.random() * numberValue);
          const randomSize = 1 + Math.random() * 2;
          const randomDuration = 1 + Math.random() * 2;
          
          return (
            <div 
              key={index}
              className="absolute rounded-full bg-white"
              style={{
                top: `${randomTop}%`,
                left: `${randomLeft}%`,
                width: `${randomSize}px`,
                height: `${randomSize}px`,
                opacity: 0.6,
                animation: `particleGlow ${randomDuration}s infinite alternate ease-in-out`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          );
        })}
      </div>
    );
  };
  
  // Extreme 3D light refraction effects - Pokemon-styled enhanced version
  const renderLightRefractions = () => {
    // Make it always visible for maximum 3D effect
    return (
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Increased number of light refractions for more dramatic effect */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div 
            key={i}
            className="absolute inset-0 mix-blend-overlay"
            style={{ 
              clipPath: `inset(0 ${100 - numberValue}% 0 0)`,
              background: `radial-gradient(circle at ${15 + i * 20}% 50%, rgba(255, 255, 255, 1) 0%, transparent ${4 + i * 6}%)`,
              opacity: 0.6,
              transform: `translateZ(${8 + i * 3}px)`, // More extreme Z-positioning
            }}
          />
        ))}
        
        {/* Add horizontal light streaks for additional dimensional effect */}
        <div 
          className="absolute h-[3px] top-1/2 transform -translate-y-1/2 z-10"
          style={{
            width: `${numberValue}%`,
            background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.9), transparent)',
            transform: 'translateZ(20px) rotateX(5deg)',
            boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)'
          }}
        />
      </div>
    );
  };
  
  return (
    <div className="relative mb-4 perspective-1000">
      {(showLabel && labelText) && (
        <div className={cn(
          "text-sm font-medium mb-1 text-gray-300",
          labelClassName
        )}>
          {labelText}
        </div>
      )}
      
      <div className={cn(
        "relative",
        extreme3D ? "transform-gpu rotate3d(1, 0, 0, 2deg)" : ""
      )}>
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            "relative overflow-visible rounded-full bg-gray-900",
            "progress-3d",
            height,
            className
          )}
          {...props}
        >
          {renderParticles()}
          
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full w-full flex-1 transition-all",
              "progress-indicator",
              getProgressColor(numberValue),
              getGlowEffect(numberValue),
              getPulseEffect(numberValue),
              indicatorClassName
            )}
            style={{ 
              transform: `translateX(-${100 - (numberValue || 0)}%)`,
              transformStyle: 'preserve-3d',
            }}
          >
            {/* Enhanced shine effect on top of indicator */}
            <div 
              className="absolute inset-0 opacity-50"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.4) 0%, transparent 50%)',
                borderRadius: 'inherit'
              }}
            />
          </ProgressPrimitive.Indicator>
          
          {renderLightRefractions()}
        </ProgressPrimitive.Root>
        
        {/* Shadow under the progress bar for enhanced 3D effect - no blur */}
        <div 
          className="absolute w-full h-3 bottom-[-8px] left-0 rounded-full opacity-50 z-[-1]"
          style={{ 
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
            transform: 'scaleY(0.3) rotateX(40deg) translateZ(-10px)',
            transformOrigin: 'center bottom',
            boxShadow: '0 10px 15px rgba(0,0,0,0.5)'
          }}
        />
        
        {/* Multi-layered shadows for enhanced 3D effect */}
        <div 
          className="absolute w-[95%] h-2 bottom-[-12px] left-[2.5%] rounded-full opacity-40 z-[-2]"
          style={{ 
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
            transform: 'scaleY(0.2) rotateX(50deg) translateZ(-15px)',
            transformOrigin: 'center bottom'
          }}
        />
        
        {showValue && (
          <div 
            className={cn(
              "absolute font-medium right-2 top-1/2 transform -translate-y-1/2 z-10 px-1.5",
              "text-3d text-white text-glow text-xs",
              valueClassName
            )}
            style={{
              textShadow: '0 0 5px rgba(255,255,255,0.5)'
            }}
          >
            {`${Math.round(animatedValue)}%`}
          </div>
        )}
        
        {/* 3D marker at current progress - no blur, extreme depth */}
        {extreme3D && numberValue > 5 && numberValue < 98 && (
          <div 
            className="absolute top-1/2 transform -translate-y-1/2 w-1.5 h-6 rounded-full bg-white/80 pointer-events-none"
            style={{ 
              left: `${numberValue}%`,
              boxShadow: '0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.4)',
              transform: 'translateY(-50%) translateZ(25px)', // More extreme depth
              border: '1px solid rgba(255,255,255,0.9)'
            }}
          />
        )}
      </div>
      
      {/* Visual perspective grid lines (Pokémon style) */}
      {extreme3D && (
        <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden">
          {Array.from({ length: 10 }).map((_, i) => (
            <div 
              key={i}
              className="absolute bg-white/40"
              style={{
                height: '1px',
                width: '100%',
                top: `${(i+1) * 10}%`,
                transform: `rotateX(${70 - i*5}deg) translateZ(${i*2}px)`,
                opacity: 0.5 - i * 0.05
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

Progress3D.displayName = "Progress3D";

export { Progress3D };