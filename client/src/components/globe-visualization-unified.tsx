import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Loader2, MapPin, Users, Activity, Clock, MapIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Helper function to get position on globe
const getPositionOnGlobe = (lat: number, lng: number): THREE.Vector3 => {
  const phi = (90 - lat) * Math.PI / 180;
  const theta = (lng + 180) * Math.PI / 180;
  
  const x = -50 * Math.sin(phi) * Math.cos(theta);
  const y = 50 * Math.cos(phi);
  const z = 50 * Math.sin(phi) * Math.sin(theta);
  
  return new THREE.Vector3(x, y, z);
};

interface GlobeVisualizationProps {
  title?: string;
  description?: string;
  className?: string;
  variant?: 'standard' | 'simple' | 'performance';
  showStats?: boolean;
  autoRotate?: boolean;
  rotationSpeed?: number;
  polygonDetail?: 'low' | 'medium' | 'high';
}

export function GlobeVisualization({ 
  title = "Worldwide User Impact", 
  description = "Track users and their impact across the globe",
  className = "",
  variant = 'standard',
  showStats = true,
  autoRotate = true,
  rotationSpeed = 0.005,
  polygonDetail = 'medium'
}: GlobeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const userPointsRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [loadingState, setLoadingState] = useState<'initializing' | 'preloading' | 'ready' | 'error'>('initializing');
  const [initAttempts, setInitAttempts] = useState(0);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    countries: 0,
    recentActivity: 0
  });
  
  // Detect WebGL support
  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const hasWebGL = !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      
      if (!hasWebGL) {
        console.error("WebGL not supported in this browser");
        setLoadingState('error');
      }
    } catch (e) {
      console.error("Error detecting WebGL support:", e);
      setLoadingState('error');
    }
  }, []);
  
  // Fetch users data
  const { data: users = [], isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    staleTime: 30000, // 30 seconds
    retry: 3,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 10000),
  });
  
  // Auto-retry for data loading errors
  useEffect(() => {
    if (usersError) {
      const timer = setTimeout(() => {
        refetchUsers();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [usersError, refetchUsers]);

  // Process user data for stats
  useEffect(() => {
    if (!showStats || users.length === 0) return;
    
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
    
    setUserStats({
      totalUsers: users.length,
      activeUsers: activeUsersCount,
      countries: countries.size,
      recentActivity: recentActivityCount
    });
  }, [users, showStats]);

  // Initialize the 3D scene
  useEffect(() => {
    if (loadingState === 'error' || !containerRef.current) return;
    
    const initializeScene = () => {
      try {
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
        
        // Set size based on container
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
        
        // Create starfield background (only for standard and performance variants)
        if (variant !== 'simple') {
          const starCount = variant === 'performance' ? 1000 : 3000;
          const starGeometry = new THREE.BufferGeometry();
          const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.7,
            transparent: true,
            opacity: 0.8,
          });
          
          const starVertices = [];
          for (let i = 0; i < starCount; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
          }
          
          starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
          const stars = new THREE.Points(starGeometry, starMaterial);
          scene.add(stars);
        }
        
        // Create earth globe
        const globeGroup = new THREE.Group();
        scene.add(globeGroup);
        
        // Set polygon detail based on prop
        let segments = 36; // Default medium detail
        if (polygonDetail === 'low') segments = 24;
        if (polygonDetail === 'high') segments = 64;
        
        // Earth with appropriate detail level
        const globeGeometry = new THREE.SphereGeometry(50, segments, segments);
        
        const globeMaterial = new THREE.MeshPhongMaterial({
          color: 0x2563eb,
          emissive: 0x0d47a1,
          emissiveIntensity: 0.2,
          shininess: 30,
        });
        
        const globe = new THREE.Mesh(globeGeometry, globeMaterial);
        globeGroup.add(globe);
        globeRef.current = globe;
        
        // Add atmosphere
        const atmosphereGeometry = new THREE.SphereGeometry(52, segments, segments);
        const atmosphereMaterial = new THREE.MeshPhongMaterial({
          color: 0x2196f3,
          transparent: true,
          opacity: 0.15,
          side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        globeGroup.add(atmosphere);
        
        // Create container for user points
        const userPointsGroup = new THREE.Group();
        globeGroup.add(userPointsGroup);
        userPointsRef.current = userPointsGroup;
        
        // Create equator line (reduced segments for performance variant)
        const equatorSegments = variant === 'performance' ? 64 : 128;
        const equatorGeometry = new THREE.RingGeometry(50.2, 51, equatorSegments);
        const equatorMaterial = new THREE.MeshBasicMaterial({ 
          color: 0xffffff, 
          transparent: true, 
          opacity: 0.2,
          side: THREE.DoubleSide
        });
        const equator = new THREE.Mesh(equatorGeometry, equatorMaterial);
        equator.rotation.x = Math.PI / 2;
        globeGroup.add(equator);
        
        // Add grid lines with appropriate detail
        if (variant !== 'simple') {
          // Number of lines varies by variant
          const longitudeLines = variant === 'performance' ? 12 : 24;
          
          // Add longitude lines
          for (let i = 0; i < longitudeLines; i++) {
            const angle = (i / longitudeLines) * Math.PI * 2;
            const gridGeometry = new THREE.RingGeometry(50, 50.2, equatorSegments);
            const gridMaterial = new THREE.MeshBasicMaterial({ 
              color: 0xffffff, 
              transparent: true, 
              opacity: 0.1,
              side: THREE.DoubleSide
            });
            const grid = new THREE.Mesh(gridGeometry, gridMaterial);
            
            grid.rotation.y = angle;
            globeGroup.add(grid);
          }
          
          // Add latitude lines
          const latitudeLines = variant === 'performance' ? 8 : 16;
          const latitudeStep = variant === 'performance' ? 20 : 10;
          
          for (let i = 1; i < latitudeLines + 1; i++) {
            // Skip equator as we already have it
            if (i === Math.floor(latitudeLines / 2)) continue;
            
            const lat = (i - latitudeLines/2) * latitudeStep * Math.PI / 180;
            const radius = 50 * Math.cos(lat);
            
            const latGeometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, equatorSegments);
            const latMaterial = new THREE.MeshBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.1,
              side: THREE.DoubleSide
            });
            
            const latRing = new THREE.Mesh(latGeometry, latMaterial);
            latRing.rotation.x = Math.PI / 2;
            latRing.position.y = 50 * Math.sin(lat);
            
            globeGroup.add(latRing);
          }
        }
        
        // Add continent outlines if not simple variant
        if (variant !== 'simple') {
          // Add continent outlines
          const addContinent = (points: THREE.Vector3[], name: string) => {
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({ 
              color: 0xffffff,
              transparent: true,
              opacity: 0.3
            });
            
            const continent = new THREE.Line(geometry, material);
            continent.userData = { continentName: name };
            globeGroup.add(continent);
          };
          
          // Simplified continents
          const continents = {
            northAmerica: [
              [60, -125], [55, -110], [50, -100], [45, -80], 
              [40, -75], [30, -85], [25, -100], [15, -90],
              [10, -80], [30, -120], [50, -130], [60, -125]
            ],
            southAmerica: [
              [10, -80], [5, -75], [0, -78], [-10, -75],
              [-20, -65], [-30, -70], [-35, -65], [-25, -45],
              [-10, -40], [0, -50], [10, -65], [10, -80]
            ],
            europe: [
              [60, 0], [55, 15], [50, 30], [45, 25],
              [40, 20], [38, 10], [43, 5], [40, -5],
              [48, -5], [50, 0], [60, 0]
            ],
            africa: [
              [30, 0], [25, 30], [10, 45], [0, 40],
              [-20, 35], [-30, 25], [-20, 15], [0, 10],
              [10, 0], [30, 0]
            ],
            asia: [
              [65, 80], [55, 125], [40, 125], [22, 115],
              [15, 100], [5, 100], [20, 80], [30, 60],
              [40, 45], [50, 50], [65, 80]
            ],
            australia: [
              [-20, 120], [-25, 135], [-35, 145], [-35, 135],
              [-30, 115], [-20, 120]
            ]
          };
          
          // Only add continents if not in performance mode, or with reduced points in performance mode
          if (variant === 'standard') {
            Object.entries(continents).forEach(([name, points]) => {
              addContinent(points.map(p => getPositionOnGlobe(p[0], p[1])), name);
            });
          } else if (variant === 'performance') {
            // For performance variant, only add major continents with fewer points
            const reducedContinents = {
              northAmerica: [
                [60, -125], [45, -80], [30, -85], [15, -90], [30, -120], [60, -125]
              ],
              europe: [
                [60, 0], [50, 30], [40, 20], [40, -5], [60, 0]
              ],
              asia: [
                [65, 80], [40, 125], [15, 100], [30, 60], [65, 80]
              ]
            };
            
            Object.entries(reducedContinents).forEach(([name, points]) => {
              addContinent(points.map(p => getPositionOnGlobe(p[0], p[1])), name);
            });
          }
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
          animationFrameRef.current = requestAnimationFrame(animate);
          
          if (globeRef.current && autoRotate) {
            globeRef.current.rotation.y += rotationSpeed;
          }
          
          // Use the stored references
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        };
        
        animate();
        
        // Add event listeners
        window.addEventListener('resize', handleResize);
        
        // Set loading state to ready
        setLoadingState('ready');
        
        // Cleanup function
        return () => {
          window.removeEventListener('resize', handleResize);
          
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
          }
          
          if (rendererRef.current) {
            rendererRef.current.dispose();
          }
        };
      } catch (error) {
        console.error('Failed to initialize 3D scene:', error);
        setLoadingState('error');
        setInitAttempts(prev => prev + 1);
      }
    };
    
    // Initialize the scene
    initializeScene();
  }, [loadingState, variant, autoRotate, rotationSpeed, polygonDetail]);

  // Add markers for user locations
  useEffect(() => {
    // If scene isn't ready or no user data, return
    if (!sceneRef.current || !userPointsRef.current || users.length === 0) return;
    
    // Clear existing points
    while (userPointsRef.current.children.length > 0) {
      userPointsRef.current.remove(userPointsRef.current.children[0]);
    }
    
    // Add new points
    users.forEach(user => {
      if (!user.latitude || !user.longitude) return;
      
      // Convert lat/lng to 3D position
      const position = getPositionOnGlobe(user.latitude, user.longitude);
      
      // Create marker
      const markerGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      
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
      
      const markerMaterial = new THREE.MeshBasicMaterial({ color: markerColor });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      
      marker.position.set(position.x, position.y, position.z);
      marker.userData = { userId: user.id };
      
      // Add marker to the group
      userPointsRef.current.add(marker);
    });
  }, [users]);

  // Function to restart visualization
  const handleRestartVisualization = () => {
    setLoadingState('initializing');
    setInitAttempts(0);
  };

  return (
    <Card className={`relative overflow-hidden backdrop-blur-sm bg-gray-900/90 ${className}`}>
      <div className="w-full h-[400px]" ref={containerRef}>
        {/* Stats overlay */}
        {showStats && loadingState === 'ready' && (
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 backdrop-blur-sm bg-gray-900/70 p-3 rounded-lg border border-gray-800">
            <div className="text-sm font-medium text-green-400 mb-1">{title}</div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Users className="h-3 w-3 text-green-400" />
                <span>{userStats.totalUsers} users total</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Activity className="h-3 w-3 text-green-400" />
                <span>{userStats.activeUsers} active today</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <MapIcon className="h-3 w-3 text-green-400" />
                <span>{userStats.countries} countries</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <Clock className="h-3 w-3 text-green-400" />
                <span>{userStats.recentActivity} active this week</span>
              </div>
            </div>
            
            <Badge className="self-start mt-1 text-[10px] bg-gray-800 hover:bg-gray-700 text-gray-300">
              Real-time data
            </Badge>
            
            <button 
              onClick={refetchUsers}
              className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
      
      {loadingState !== 'ready' && loadingState !== 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white">
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 animate-spin mb-4" />
            <div className="text-2xl font-bold">Loading Globe</div>
            <div className="text-sm mt-2 text-gray-400">Please wait while we initialize the 3D world...</div>
          </div>
        </div>
      )}
      
      {loadingState === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/80 text-white">
          <div className="flex flex-col items-center max-w-md text-center p-6">
            <AlertTriangle className="h-12 w-12 mb-4" />
            <div className="text-xl font-bold">Visualization Error</div>
            <div className="text-sm mt-2 mb-4">
              There was a problem initializing the 3D visualization.
              This might be due to WebGL support limitations in your browser.
            </div>
            <Button 
              onClick={handleRestartVisualization} 
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md flex items-center gap-2 transition-colors"
            >
              Try Again
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}