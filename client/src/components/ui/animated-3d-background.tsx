import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';

interface AnimatedBackgroundProps {
  color?: string;
  particleCount?: number;
  speed?: number;
  interactive?: boolean;
  className?: string;
}

export function Animated3DBackground({ 
  color = '#10b981', 
  particleCount = 200,
  speed = 0.1,
  interactive = true,
  className = ''
}: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const particlesRef = useRef<THREE.Points | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  
  // Initialize the 3D scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      window.innerWidth / window.innerHeight, 
      0.1, 
      1000
    );
    camera.position.z = 20;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    
    const particlesPositions = new Float32Array(particleCount * 3);
    const particlesSpeeds = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlesPositions[i3] = (Math.random() - 0.5) * 50;
      particlesPositions[i3 + 1] = (Math.random() - 0.5) * 50;
      particlesPositions[i3 + 2] = (Math.random() - 0.5) * 50;
      
      particlesSpeeds[i] = Math.random() * 0.1 + 0.05;
    }
    
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlesPositions, 3));
    particlesGeometry.setAttribute('speed', new THREE.BufferAttribute(particlesSpeeds, 1));
    
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    particlesRef.current = particles;
    
    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return;
      
      cameraRef.current.aspect = window.innerWidth / window.innerHeight;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(window.innerWidth, window.innerHeight);
    };
    
    // Handle mouse move for interactive background
    const handleMouseMove = (event: MouseEvent) => {
      if (!interactive) return;
      
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    
    // Animation loop
    const animate = () => {
      if (!particlesRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      const speeds = particlesRef.current.geometry.attributes.speed.array as Float32Array;
      
      for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Apply slight movement to each particle
        positions[i3 + 1] += speeds[i] * speed;
        
        // Reset position if particle goes too far
        if (positions[i3 + 1] > 25) {
          positions[i3 + 1] = -25;
        }
        
        // Apply interactive movement based on mouse position
        if (interactive) {
          positions[i3] += mousePosition.current.x * 0.002;
          positions[i3 + 1] += mousePosition.current.y * 0.002;
        }
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Apply rotation to the entire particle system
      particlesRef.current.rotation.x += 0.0005;
      particlesRef.current.rotation.y += 0.0003;
      
      // Render the scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      // Continue animation loop
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    setIsReady(true);
    
    // Cleanup
    return () => {
      if (containerRef.current && rendererRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          console.warn('Error removing child:', e);
        }
      }
      
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      // Dispose resources
      if (particlesRef.current) {
        particlesRef.current.geometry.dispose();
        (particlesRef.current.material as THREE.Material).dispose();
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, [color, particleCount, speed, interactive]);
  
  return (
    <motion.div 
      ref={containerRef} 
      className={`fixed inset-0 z-0 pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isReady ? 1 : 0 }}
      transition={{ duration: 1.5 }}
    />
  );
}