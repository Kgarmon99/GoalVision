import React, { useState, useRef, MouseEvent } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import "../ui/3d-effects.css";

interface Card3DProps {
  className?: string;
  children: React.ReactNode;
  rotateEffect?: boolean;
  floatEffect?: boolean;
  intensity?: 'low' | 'medium' | 'high';
  onClick?: () => void;
}

export function Card3D({
  className,
  children,
  rotateEffect = true,
  floatEffect = false,
  intensity = 'medium',
  onClick
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Intensity multipliers
  const intensityValues = {
    low: 0.5,
    medium: 1,
    high: 1.5
  };

  const intensityMultiplier = intensityValues[intensity];
  const maxRotation = 8 * intensityMultiplier; // Maximum rotation angle in degrees

  const handleMouseMove = (e: MouseEvent) => {
    if (!rotateEffect || !cardRef.current) return;

    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    
    // Calculate mouse position relative to the card center
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Calculate rotation based on mouse position
    const rotateY = ((e.clientX - centerX) / (rect.width / 2)) * maxRotation;
    const rotateX = -((e.clientY - centerY) / (rect.height / 2)) * maxRotation;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setRotation({ x: 0, y: 0 });
  };

  const baseClassNames = cn(
    "card-3d",
    floatEffect && "float-3d",
    className
  );

  const contentStyle = {
    transform: isHovering && rotateEffect 
      ? `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`
      : 'rotateX(0deg) rotateY(0deg)',
    transition: isHovering ? 'transform 0.1s ease-out' : 'transform 0.3s ease-out'
  };

  return (
    <div
      className={baseClassNames}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={contentStyle}
    >
      {children}
    </div>
  );
}

// Specialized components with 3D effects
export function Card3DHeader({ className, ...props }: React.ComponentProps<typeof CardHeader>) {
  return (
    <CardHeader className={cn("card-content-3d", className)} {...props} />
  );
}

export function Card3DTitle({ className, ...props }: React.ComponentProps<typeof CardTitle>) {
  return (
    <CardTitle className={cn("card-title-3d", className)} {...props} />
  );
}

export function Card3DDescription({ className, ...props }: React.ComponentProps<typeof CardDescription>) {
  return (
    <CardDescription className={cn("card-description-3d", className)} {...props} />
  );
}

export function Card3DContent({ className, ...props }: React.ComponentProps<typeof CardContent>) {
  return (
    <CardContent className={cn("card-content-3d", className)} {...props} />
  );
}

export function Card3DFooter({ className, ...props }: React.ComponentProps<typeof CardFooter>) {
  return (
    <CardFooter className={cn("card-content-3d", className)} {...props} />
  );
}

export function Icon3D({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("icon-3d", className)}>
      {children}
    </div>
  );
}

export function Text3D({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("text-3d", className)}>
      {children}
    </div>
  );
}

export function Value3D({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("card-value-3d", className)}>
      {children}
    </div>
  );
}

export function Badge3D({ className, children }: { className?: string, children: React.ReactNode }) {
  return (
    <div className={cn("badge-3d", className)}>
      {children}
    </div>
  );
}