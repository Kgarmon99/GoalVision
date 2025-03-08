import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface CursorEffectProps {
  cursorSize?: number;
  trailCount?: number;
  trailFadeTime?: number;
  color?: string;
  glowColor?: string;
  glowSize?: number;
  snapToTarget?: boolean;
  excludeElements?: string[];
  className?: string;
}

export function CursorEffect({
  cursorSize = 16,
  trailCount = 10,
  trailFadeTime = 200,
  color = '#10b981',
  glowColor = 'rgba(16, 185, 129, 0.35)',
  glowSize = 40,
  snapToTarget = true,
  excludeElements = ['a', 'button', 'input', 'textarea', 'select', '[data-cursor-hover]'],
  className = '',
}: CursorEffectProps) {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [scale, setScale] = useState(1);
  const trailsRef = useRef<{ x: number; y: number; opacity: number; }[]>([]);
  const requestRef = useRef<number>(0);
  
  // Generate trail points
  useEffect(() => {
    trailsRef.current = Array(trailCount).fill(0).map(() => ({
      x: -100,
      y: -100,
      opacity: 0
    }));
  }, [trailCount]);
  
  // Handle mouse events
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
      
      // Update trails
      updateTrails(e.clientX, e.clientY);
      
      // Check if hovering over interactive elements
      if (snapToTarget) {
        const target = e.target as HTMLElement;
        const isExcluded = excludeElements.some(selector => {
          if (selector.startsWith('[') && selector.endsWith(']')) {
            // Handle attribute selector
            const attrName = selector.substring(1, selector.length - 1);
            return target.hasAttribute(attrName);
          } else {
            // Handle tag selector
            return target.tagName.toLowerCase() === selector;
          }
        });
        
        setIsHovering(isExcluded);
      }
    };
    
    const onMouseDown = () => {
      setIsClicking(true);
      setScale(0.8);
    };
    
    const onMouseUp = () => {
      setIsClicking(false);
      setScale(1);
    };
    
    const onMouseEnter = () => {
      setVisible(true);
    };
    
    const onMouseLeave = () => {
      setVisible(false);
    };
    
    // Update trail positions with delay
    const updateTrails = (x: number, y: number) => {
      cancelAnimationFrame(requestRef.current);
      
      const updateAnimation = () => {
        // Shift all trails
        for (let i = trailsRef.current.length - 1; i > 0; i--) {
          trailsRef.current[i].x = trailsRef.current[i - 1].x;
          trailsRef.current[i].y = trailsRef.current[i - 1].y;
          
          // Calculate opacity based on position in trail
          const opacity = 1 - (i / trailsRef.current.length);
          trailsRef.current[i].opacity = opacity;
        }
        
        // Update lead trail point
        if (trailsRef.current.length > 0) {
          trailsRef.current[0].x = x;
          trailsRef.current[0].y = y;
          trailsRef.current[0].opacity = 1;
        }
        
        requestRef.current = requestAnimationFrame(updateAnimation);
      };
      
      requestRef.current = requestAnimationFrame(updateAnimation);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseenter', onMouseEnter);
    document.addEventListener('mouseleave', onMouseLeave);
    
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseenter', onMouseEnter);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(requestRef.current);
    };
  }, [visible, cursorSize, trailCount, trailFadeTime, snapToTarget, excludeElements]);
  
  return (
    <div className={`cursor-effect-container pointer-events-none fixed inset-0 z-50 ${className}`}>
      {/* Main cursor */}
      <motion.div
        className="cursor-dot fixed rounded-full"
        style={{
          backgroundColor: color,
          width: cursorSize,
          height: cursorSize,
          x: position.x - cursorSize / 2,
          y: position.y - cursorSize / 2,
          opacity: visible ? 1 : 0,
          mixBlendMode: 'difference',
        }}
        animate={{
          scale: isHovering ? 1.5 : scale,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 28,
          mass: 0.5,
        }}
      />
      
      {/* Glow effect */}
      <motion.div
        className="cursor-glow fixed rounded-full"
        style={{
          backgroundColor: glowColor,
          width: glowSize,
          height: glowSize,
          x: position.x - glowSize / 2,
          y: position.y - glowSize / 2,
          opacity: visible ? (isHovering ? 0.6 : 0.3) : 0,
          filter: 'blur(5px)',
        }}
        animate={{
          scale: isClicking ? 0.5 : isHovering ? 1.2 : 1,
          opacity: visible ? (isHovering ? 0.6 : 0.3) : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 20,
        }}
      />
      
      {/* Trail effect */}
      {trailsRef.current.map((trail, i) => (
        <div
          key={i}
          className="cursor-trail fixed rounded-full"
          style={{
            backgroundColor: color,
            width: cursorSize * (1 - i / trailsRef.current.length) * 0.8,
            height: cursorSize * (1 - i / trailsRef.current.length) * 0.8,
            transform: `translate(${trail.x - (cursorSize * 0.4)}px, ${trail.y - (cursorSize * 0.4)}px)`,
            opacity: trail.opacity * 0.5,
            transition: `opacity ${trailFadeTime}ms ease`,
          }}
        />
      ))}
    </div>
  );
}