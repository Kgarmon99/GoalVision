import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { getStringOrFallback } from '@/utils/string-utils';
import { Loader2, MapPin, Users } from 'lucide-react';

interface GlobeVisualizationProps {
  title?: string;
  description?: string;
  className?: string;
}

export function GlobeVisualization({ 
  title = "Worldwide User Impact", 
  description = "Track users and their impact across the globe",
  className = "" 
}: GlobeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const userPointsRef = useRef<THREE.Points | null>(null);
  const mousePosition = useRef({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    countries: 0
  });
  
  // Fetch users data
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    staleTime: 60000 // 60 seconds
  });

  // Initialize the 3D scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60, 
      containerRef.current.clientWidth / containerRef.current.clientHeight || 2, 
      0.1, 
      1000
    );
    camera.position.z = 200;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true 
    });
    
    // Set initial size based on container
    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Clear any previous children
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create light
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // Create earth globe
    const globeGeometry = new THREE.SphereGeometry(50, 64, 64);
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x2563eb, // blue-600
      emissive: 0x0d47a1,
      emissiveIntensity: 0.2,
      shininess: 15,
      transparent: true,
      opacity: 0.9,
    });
    
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    scene.add(globe);
    globeRef.current = globe;
    
    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    // Handle mouse move for interactive rotation
    const handleMouseMove = (event: MouseEvent) => {
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };
    
    // Animation loop
    const animate = () => {
      if (!globeRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      // Rotate globe slowly
      globeRef.current.rotation.y += 0.001;
      
      // Make globe respond subtly to mouse position
      const targetRotationX = mousePosition.current.y * 0.3;
      const targetRotationY = mousePosition.current.x * 0.5;
      
      globeRef.current.rotation.x = THREE.MathUtils.lerp(
        globeRef.current.rotation.x,
        targetRotationX,
        0.01
      );
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();
    animate();
    setIsReady(true);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      
      if (containerRef.current && rendererRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          console.warn('Error removing renderer from DOM:', e);
        }
      }
      
      if (globeRef.current) {
        globeRef.current.geometry.dispose();
        if (Array.isArray(globeRef.current.material)) {
          globeRef.current.material.forEach(m => m.dispose());
        } else {
          globeRef.current.material.dispose();
        }
      }
      
      if (userPointsRef.current) {
        userPointsRef.current.geometry.dispose();
        if (Array.isArray(userPointsRef.current.material)) {
          userPointsRef.current.material.forEach(m => m.dispose());
        } else {
          userPointsRef.current.material.dispose();
        }
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);
  
  // Update user points on the globe whenever users data changes
  useEffect(() => {
    if (!sceneRef.current || !userPointsRef.current || users.length === 0) return;
    
    // Remove previous points if they exist
    if (userPointsRef.current) {
      sceneRef.current.remove(userPointsRef.current);
      userPointsRef.current.geometry.dispose();
      if (Array.isArray(userPointsRef.current.material)) {
        userPointsRef.current.material.forEach(m => m.dispose());
      } else {
        userPointsRef.current.material.dispose();
      }
    }
    
    // Create points for user locations
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.5,
      sizeAttenuation: true,
    });
    
    // Calculate positions from latitude/longitude data
    const positions: number[] = [];
    const countries = new Set<string>();
    let activeUsersCount = 0;
    
    users.forEach(user => {
      if (user.latitude && user.longitude) {
        // Convert lat/long to 3D coordinates on sphere
        const lat = (user.latitude * Math.PI) / 180;
        const lng = (user.longitude * Math.PI) / 180;
        
        // Calculate position on globe
        const x = -55 * Math.cos(lat) * Math.sin(lng);
        const y = 55 * Math.sin(lat);
        const z = 55 * Math.cos(lat) * Math.cos(lng);
        
        positions.push(x, y, z);
        
        if (user.country) {
          countries.add(user.country);
        }
        
        if (user.lastActive) {
          // Count as active if active in the last 7 days
          const lastActive = new Date(user.lastActive);
          const now = new Date();
          const diff = now.getTime() - lastActive.getTime();
          const days = diff / (1000 * 60 * 60 * 24);
          
          if (days <= 7) {
            activeUsersCount++;
          }
        }
      }
    });
    
    // Update stats
    setUserStats({
      totalUsers: users.length,
      activeUsers: activeUsersCount,
      countries: countries.size
    });
    
    pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    
    const points = new THREE.Points(pointsGeometry, pointsMaterial);
    sceneRef.current.add(points);
    userPointsRef.current = points;
    
  }, [users]);
  
  // Convert coordinates to country name (simplified version - normally would use reverse geocoding)
  const getLocationLabel = (lat: number, lng: number, country?: string) => {
    if (country) return country;
    return `${lat.toFixed(2)}°, ${lng.toFixed(2)}°`;
  };
  
  return (
    <Card className={`overflow-hidden border-none shadow-md ${className}`}>
      <CardHeader className="bg-blue-900 text-white z-10 relative">
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription className="text-blue-100">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0 relative min-h-[500px]">
        {usersLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <motion.div 
              ref={containerRef} 
              className="absolute inset-0 z-10 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: isReady ? 1 : 0 }}
              transition={{ duration: 1.5 }}
            />
            
            {/* Stats overlay */}
            <div className="absolute top-4 right-4 p-3 bg-gray-800/80 backdrop-blur-sm rounded-md text-white z-20">
              <div className="flex items-center mb-2">
                <Users className="h-5 w-5 mr-2 text-blue-400" />
                <span className="text-sm font-medium">Users: {userStats.totalUsers}</span>
              </div>
              <div className="text-xs text-gray-300">
                <div>Active: {userStats.activeUsers}</div>
                <div>Countries: {userStats.countries}</div>
              </div>
            </div>
            
            {/* Location popup */}
            {activeLocation && (
              <div className="absolute bottom-4 left-4 p-3 bg-gray-800/80 backdrop-blur-sm rounded-md text-white z-20">
                <h4 className="text-sm font-medium">{activeLocation}</h4>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}