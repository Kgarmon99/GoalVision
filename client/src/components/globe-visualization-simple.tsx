import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Loader2, MapPin, Users, Activity, Clock, MapIcon, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  const userPointsRef = useRef<THREE.Group | null>(null);

  const [isReady, setIsReady] = useState(false);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    countries: 0,
    recentActivity: 0
  });
  
  // Fetch users data
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    staleTime: 30000 // 30 seconds
  });

  // Process user data for stats display
  useEffect(() => {
    if (users.length === 0) return;
    
    const now = new Date();
    const countries = new Set<string>();
    let activeUsersCount = 0;
    let recentActivityCount = 0;
    
    users.forEach(user => {
      if (user.lastActive) {
        const lastActive = new Date(user.lastActive);
        const diff = now.getTime() - lastActive.getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        
        if (days <= 1) {
          activeUsersCount++;
        } else if (days <= 7) {
          recentActivityCount++;
        }
      }
      
      if (user.country) {
        countries.add(user.country);
      }
    });
    
    // Update stats
    setUserStats({
      totalUsers: users.length,
      activeUsers: activeUsersCount,
      countries: countries.size,
      recentActivity: recentActivityCount
    });
    
  }, [users]);

  // Initialize the 3D scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Add background
    scene.background = new THREE.Color(0x050a30);
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60, 
      containerRef.current.clientWidth / containerRef.current.clientHeight || 2, 
      0.1, 
      1000
    );
    camera.position.z = 180;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ 
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
    
    // Create lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(100, 100, 100);
    scene.add(directionalLight);
    
    // Create starfield background
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
      opacity: 0.8,
    });
    
    const starVertices = [];
    for (let i = 0; i < 3000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starVertices.push(x, y, z);
    }
    
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
    
    // Create earth globe
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    
    // Earth texture would be ideal, but for simplicity using colors
    const globeGeometry = new THREE.SphereGeometry(50, 64, 64);
    
    // Enhanced material for better looking globe
    const globeMaterial = new THREE.MeshPhongMaterial({
      color: 0x2563eb, // Primary blue
      emissive: 0x0d47a1,
      emissiveIntensity: 0.2,
      shininess: 30,
    });
    
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globe);
    globeRef.current = globe;
    
    // Add atmosphere glow
    const atmosphereGeometry = new THREE.SphereGeometry(52, 64, 64);
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x2196f3,
      transparent: true,
      opacity: 0.15,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphere);
    
    // Create a container for all user points
    const userPointsGroup = new THREE.Group();
    globeGroup.add(userPointsGroup);
    userPointsRef.current = userPointsGroup;
    
    // Create equator line
    const equatorGeometry = new THREE.RingGeometry(50.2, 51, 128);
    const equatorMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xffffff, 
      transparent: true, 
      opacity: 0.2,
      side: THREE.DoubleSide
    });
    const equator = new THREE.Mesh(equatorGeometry, equatorMaterial);
    equator.rotation.x = Math.PI / 2;
    globeGroup.add(equator);
    
    // Add grid lines
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI;
      const gridGeometry = new THREE.RingGeometry(50.2, 50.8, 128);
      const gridMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.1,
        side: THREE.DoubleSide
      });
      const grid = new THREE.Mesh(gridGeometry, gridMaterial);
      
      // Position grid line
      grid.rotation.y = angle;
      globeGroup.add(grid);
      
      // Add perpendicular grid line
      const gridPerp = new THREE.Mesh(gridGeometry, gridMaterial);
      gridPerp.rotation.x = Math.PI / 2;
      gridPerp.rotation.z = angle;
      globeGroup.add(gridPerp);
    }
    
    // Handle window resize
    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current || !containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    // Start animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (globeRef.current) {
        globeRef.current.rotation.y += 0.005;
      }
      
      // Use the stored references
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    
    animate();
    
    // Add event listeners
    window.addEventListener('resize', handleResize);
    
    // Set ready state
    setIsReady(true);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);
  
  // Add markers for user locations
  useEffect(() => {
    // If scene isn't ready or no user data, return
    if (!sceneRef.current || !userPointsRef.current || !userPointsRef.current || users.length === 0) return;
    
    // Clear existing points (keeping this part simple to avoid TypeScript errors)
    while (userPointsRef.current.children.length > 0) {
      userPointsRef.current.remove(userPointsRef.current.children[0]);
    }
    
    // Add new points
    users.forEach(user => {
      if (!user.latitude || !user.longitude) return;
      
      // Convert lat/lng to 3D position
      const lat = (user.latitude * Math.PI) / 180;
      const lng = (user.longitude * Math.PI) / 180;
      
      const x = -50 * Math.cos(lat) * Math.sin(lng);
      const y = 50 * Math.sin(lat);
      const z = 50 * Math.cos(lat) * Math.cos(lng);
      
      // Create marker
      const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      
      // Different colors based on activity
      let markerColor = 0xff0000; // Red for inactive
      
      if (user.lastActive) {
        const lastActive = new Date(user.lastActive);
        const now = new Date();
        const diff = now.getTime() - lastActive.getTime();
        const days = diff / (1000 * 60 * 60 * 24);
        
        if (days <= 1) {
          markerColor = 0x00ff00; // Green for active
        } else if (days <= 7) {
          markerColor = 0xffff00; // Yellow for recent
        }
      }
      
      const markerMaterial = new THREE.MeshBasicMaterial({
        color: markerColor
      });
      
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      
      if (userPointsRef.current) {
        userPointsRef.current.add(marker);
      }
    });
    
  }, [users]);
  
  return (
    <div className={`relative h-full ${className}`}>
      <div 
        ref={containerRef} 
        className="h-full w-full overflow-hidden rounded-lg"
      />
      
      {usersLoading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading global data...</p>
        </div>
      ) : (
        <>
          {/* Overlay Stats */}
          <div className="absolute bottom-6 left-6">
            <Card className="bg-black/50 text-white border-0 shadow-2xl backdrop-blur-md w-64">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg text-white flex items-center gap-2">
                  <MapIcon className="h-5 w-5 text-blue-400" />
                  <span>Global Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-400" />
                    <span className="text-sm text-gray-300">Users</span>
                  </div>
                  <span className="font-medium">{userStats.totalUsers}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <span className="text-sm text-gray-300">Active Users</span>
                  </div>
                  <span className="font-medium">{userStats.activeUsers}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-amber-400" />
                    <span className="text-sm text-gray-300">Countries</span>
                  </div>
                  <span className="font-medium">{userStats.countries}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-400" />
                    <span className="text-sm text-gray-300">Recent Activity</span>
                  </div>
                  <span className="font-medium">{userStats.recentActivity}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
      
      {/* Loading overlay */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <div className="text-2xl font-bold">Loading Globe</div>
            <div className="text-sm mt-2 text-gray-400">Please wait while we initialize the 3D world...</div>
          </div>
        </div>
      )}
      
      {/* Error message if WebGL not supported */}
      {isReady && !rendererRef.current && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 text-white">
          <div className="flex flex-col items-center max-w-md text-center p-6">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <div className="text-xl font-bold">WebGL Not Supported</div>
            <div className="text-sm mt-2">
              Your browser or device doesn't support WebGL, which is required to display this 3D visualization.
              Please try using a different browser or updating your graphics drivers.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}