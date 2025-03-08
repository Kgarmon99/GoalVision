import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type ParticleType = 'confetti' | 'sparkles' | 'bubbles' | 'atoms' | 'matrix';
type ParticleShape = 'circle' | 'square' | 'triangle' | 'star' | 'custom';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
  vx: number;
  vy: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  shape: ParticleShape;
}

interface ParticleEffectProps {
  type?: ParticleType;
  count?: number;
  colors?: string[];
  speed?: number;
  gravity?: number;
  wind?: number;
  autoPlay?: boolean;
  duration?: number;
  className?: string;
  particleShape?: ParticleShape;
  customShape?: React.ReactNode;
  areaWidth?: number;
  areaHeight?: number;
  startFromBottom?: boolean;
  particleSize?: [number, number]; // min, max
  fadeOut?: boolean;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  type = 'sparkles',
  count = 100,
  colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
  speed = 1,
  gravity = 0.05,
  wind = 0,
  autoPlay = true,
  duration = 0, // 0 means infinite
  className = '',
  particleShape = 'circle',
  customShape,
  areaWidth = 0, // 0 means full width
  areaHeight = 0, // 0 means full height
  startFromBottom = false,
  particleSize = [3, 8],
  fadeOut = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);
  const [isAnimating, setIsAnimating] = useState(autoPlay);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  // Initialize particle system
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const updateDimensions = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      const width = areaWidth || container.clientWidth;
      const height = areaHeight || container.clientHeight;
      
      canvas.width = width;
      canvas.height = height;
      setDimensions({ width, height });
      
      // Recreate particles when dimensions change
      createParticles();
    };
    
    // Create initial particles
    const createParticles = () => {
      const particles: Particle[] = [];
      
      for (let i = 0; i < count; i++) {
        const particle = createParticle(i);
        particles.push(particle);
      }
      
      particlesRef.current = particles;
    };
    
    // Create a single particle with random properties
    const createParticle = (id: number): Particle => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Determine starting position based on type and startFromBottom flag
      let x = Math.random() * width;
      let y = startFromBottom ? height : Math.random() * height;
      
      if (type === 'confetti') {
        y = -10; // Start from top for confetti
      } else if (type === 'matrix') {
        y = -Math.random() * height; // Random positions above the viewport for matrix
      } else if (type === 'bubbles') {
        y = height + 10; // Start from bottom for bubbles
      }
      
      // Randomize size
      const size = Math.random() * (particleSize[1] - particleSize[0]) + particleSize[0];
      
      // Randomly select color
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Calculate velocity based on type
      let vx = (Math.random() - 0.5) * speed;
      let vy = (Math.random() - 0.5) * speed;
      
      if (type === 'confetti') {
        vy = Math.random() * speed;
      } else if (type === 'matrix') {
        vx = 0;
        vy = (Math.random() * 0.5 + 0.5) * speed; // Only fall down for matrix
      } else if (type === 'bubbles') {
        vy = -Math.random() * speed; // Float up for bubbles
      } else if (type === 'atoms') {
        // More energetic movement for atoms
        vx = (Math.random() - 0.5) * speed * 2;
        vy = (Math.random() - 0.5) * speed * 2;
      }
      
      return {
        id,
        x,
        y,
        size,
        color,
        speed: Math.random() * speed + 0.5,
        vx,
        vy,
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2,
        shape: particleShape,
      };
    };
    
    // Update and draw animation
    const animate = () => {
      if (!ctx || !isAnimating) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const updatedParticles: Particle[] = [];
      
      particlesRef.current.forEach(particle => {
        // Update particle position and properties
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Apply gravity and wind
        particle.vy += gravity;
        particle.vx += wind;
        
        // Apply rotation
        particle.rotation += particle.rotationSpeed;
        
        // Handle type-specific behaviors
        if (type === 'atoms') {
          // Bounce off edges for atoms
          if (particle.x < 0 || particle.x > canvas.width) {
            particle.vx *= -1;
          }
          if (particle.y < 0 || particle.y > canvas.height) {
            particle.vy *= -1;
          }
        }
        
        // Apply fading
        if (fadeOut) {
          if (type === 'confetti' && particle.y > canvas.height * 0.7) {
            particle.opacity -= 0.01;
          } else if (type === 'bubbles' && particle.y < canvas.height * 0.3) {
            particle.opacity -= 0.01;
          } else if (type === 'sparkles') {
            particle.opacity -= 0.005;
          }
        }
        
        // Check if particle is still visible
        if (
          particle.opacity > 0 &&
          ((type === 'confetti' && particle.y < canvas.height + 100) ||
          (type === 'bubbles' && particle.y > -100) ||
          (type === 'matrix' && particle.y < canvas.height + 100) ||
          (type === 'sparkles' && particle.opacity > 0) ||
          (type === 'atoms'))
        ) {
          // Draw the particle
          drawParticle(ctx, particle);
          updatedParticles.push(particle);
        } else {
          // Replace with a new particle
          updatedParticles.push(createParticle(particle.id));
        }
      });
      
      particlesRef.current = updatedParticles;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Draw a single particle based on its shape
    const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
      ctx.save();
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      
      switch (particle.shape) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'square':
          ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          break;
          
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -particle.size);
          ctx.lineTo(particle.size, particle.size);
          ctx.lineTo(-particle.size, particle.size);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'star':
          drawStar(ctx, 0, 0, 5, particle.size, particle.size / 2);
          break;
          
        default:
          ctx.beginPath();
          ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
          ctx.fill();
      }
      
      ctx.restore();
    };
    
    // Helper function to draw a star shape
    const drawStar = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number
    ) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;
      
      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;
        
        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fill();
    };
    
    // Initialize
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    // Start animation if autoPlay
    if (autoPlay) {
      animationRef.current = requestAnimationFrame(animate);
    }
    
    // Handle duration
    let durationTimeout: NodeJS.Timeout | null = null;
    if (duration > 0 && autoPlay) {
      durationTimeout = setTimeout(() => {
        setIsAnimating(false);
      }, duration);
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', updateDimensions);
      cancelAnimationFrame(animationRef.current);
      if (durationTimeout) clearTimeout(durationTimeout);
    };
  }, [
    isAnimating,
    type,
    count,
    colors,
    speed,
    gravity,
    wind,
    particleShape,
    areaWidth,
    areaHeight,
    startFromBottom,
    particleSize,
    fadeOut,
    autoPlay,
    duration,
  ]);
  
  // Start or stop animation manually
  const toggleAnimation = () => {
    setIsAnimating(prev => !prev);
  };
  
  return (
    <motion.div 
      className={`particle-effect-container absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />
    </motion.div>
  );
};