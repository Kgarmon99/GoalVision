import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { Loader2, MapPin, Users, Activity, Clock, MapIcon, AlertTriangle, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Helper function to get position on globe - global scope so it's available everywhere
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
  const animationFrameRef = useRef<number | null>(null);

  // State management
  const [loadingState, setLoadingState] = useState<'initializing' | 'preloading' | 'ready' | 'error'>('initializing');
  const [initAttempts, setInitAttempts] = useState(0);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    countries: 0,
    recentActivity: 0
  });
  
  // Detect WebGL support early
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
  
  // Fetch users data with robust loading and error handling
  const { data: users = [], isLoading: usersLoading, isError: usersError, refetch: refetchUsers } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    staleTime: 30000, // 30 seconds
    retry: 3, // Retry up to 3 times
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000), // Exponential backoff strategy
  });
  
  // Auto-retry logic for data loading errors
  useEffect(() => {
    if (usersError) {
      console.log("Error loading users data, auto-retrying in 3 seconds...");
      const timer = setTimeout(() => {
        console.log("Auto-retrying users data fetch...");
        refetchUsers();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [usersError, refetchUsers]);

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

  // Handle scene cleanup
  const cleanupScene = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (rendererRef.current) {
      try {
        rendererRef.current.dispose();
        rendererRef.current = null;
      } catch (err) {
        console.error("Error disposing renderer:", err);
      }
    }

    if (containerRef.current) {
      // Clear any previous children
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
    }

    // Clear other references
    sceneRef.current = null;
    cameraRef.current = null;
    globeRef.current = null;
    userPointsRef.current = null;
  }, []);

  // Initialize the 3D scene
  const initializeScene = useCallback(() => {
    console.log("Initializing 3D scene...");
    setInitAttempts(prev => prev + 1);
    
    // Clean up any existing scene
    cleanupScene();
    
    if (!containerRef.current) return;
    
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
      
      let renderer: THREE.WebGLRenderer;
      
      try {
        // Create renderer with safeguards
        renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          failIfMajorPerformanceCaveat: false
        });
        
        // Set initial size based on container
        const width = containerRef.current.clientWidth || window.innerWidth;
        const height = containerRef.current.clientHeight || window.innerHeight;
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
        
        // Append to container
        containerRef.current.appendChild(renderer.domElement);
        rendererRef.current = renderer;
      } catch (rendererError) {
        console.error("Error creating WebGL renderer:", rendererError);
        setLoadingState('error');
        return;
      }
      
      // Create lights
      const ambientLight = new THREE.AmbientLight(0x404040, 1);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(100, 100, 100);
      scene.add(directionalLight);
      
      // Create starfield background
      // Reduced star count for better performance
      const starGeometry = new THREE.BufferGeometry();
      const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.7,
        transparent: true,
        opacity: 0.8,
      });
      
      const starVertices = [];
      // Reduce number of stars from 3000 to 1000 for better performance
      for (let i = 0; i < 1000; i++) {
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
      // Reduced polygon count for better performance (from 64x64 to 36x36)
      const globeGeometry = new THREE.SphereGeometry(50, 36, 36);
      
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
      
      // Add atmosphere glow - also reduced polygons
      const atmosphereGeometry = new THREE.SphereGeometry(52, 32, 32);
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
      
      // Create equator line - reduced segment count for better performance 
      const equatorGeometry = new THREE.RingGeometry(50.2, 51, 64); // Reduced from 128 segments
      const equatorMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.2,
        side: THREE.DoubleSide
      });
      const equator = new THREE.Mesh(equatorGeometry, equatorMaterial);
      equator.rotation.x = Math.PI / 2;
      globeGroup.add(equator);
      
      // Add grid lines (longitude lines) - reduced count for better performance
      // Add fewer longitude lines (12 instead of 24)
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const gridGeometry = new THREE.RingGeometry(50, 50.2, 64); // Reduced from 128 segments
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
      }
      
      // Add latitude lines - reduced count for better performance
      // Add fewer latitude lines (9 instead of 17)
      for (let i = 1; i < 9; i += 2) { 
        // Skip equator as we already have it
        if (i === 4) continue;
        
        const lat = (i - 4) * 20 * Math.PI / 180; // 20 degree increments instead of 10
        const radius = 50 * Math.cos(lat);
        
        const latGeometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 64); // Reduced from 128 segments
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
      
      // Add continent outlines (simplified)
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
      
      // North America (simplified outline)
      const northAmerica = [
        getPositionOnGlobe(60, -125), // Alaska
        getPositionOnGlobe(55, -110), // Canada West
        getPositionOnGlobe(50, -100), // Canada Central
        getPositionOnGlobe(45, -80),  // Great Lakes
        getPositionOnGlobe(40, -75),  // US East Coast
        getPositionOnGlobe(30, -85),  // US South
        getPositionOnGlobe(25, -100), // Mexico
        getPositionOnGlobe(15, -90),  // Central America
        getPositionOnGlobe(10, -80),  // Panama
        getPositionOnGlobe(30, -120), // US West Coast
        getPositionOnGlobe(50, -130), // Canada West Coast
        getPositionOnGlobe(60, -125)  // Back to Alaska
      ];
      addContinent(northAmerica, "North America");
      
      // South America (simplified outline)
      const southAmerica = [
        getPositionOnGlobe(10, -80),  // Panama
        getPositionOnGlobe(5, -75),   // Colombia
        getPositionOnGlobe(0, -78),   // Ecuador
        getPositionOnGlobe(-10, -75), // Peru
        getPositionOnGlobe(-20, -65), // Bolivia
        getPositionOnGlobe(-30, -70), // Chile
        getPositionOnGlobe(-35, -65), // Argentina
        getPositionOnGlobe(-25, -45), // Brazil South
        getPositionOnGlobe(-10, -40), // Brazil East
        getPositionOnGlobe(0, -50),   // Brazil North
        getPositionOnGlobe(10, -65),  // Venezuela
        getPositionOnGlobe(10, -80)   // Back to Panama
      ];
      addContinent(southAmerica, "South America");
      
      // Europe (simplified outline)
      const europe = [
        getPositionOnGlobe(60, 0),    // Norway
        getPositionOnGlobe(55, 15),   // Sweden
        getPositionOnGlobe(50, 30),   // Eastern Europe
        getPositionOnGlobe(45, 25),   // Romania
        getPositionOnGlobe(40, 20),   // Greece
        getPositionOnGlobe(38, 10),   // Italy
        getPositionOnGlobe(43, 5),    // France
        getPositionOnGlobe(40, -5),   // Spain
        getPositionOnGlobe(48, -5),   // France West
        getPositionOnGlobe(50, 0),    // UK
        getPositionOnGlobe(60, 0)     // Back to Norway
      ];
      addContinent(europe, "Europe");
      
      // Africa (simplified outline)
      const africa = [
        getPositionOnGlobe(30, 0),    // Morocco
        getPositionOnGlobe(25, 30),   // Egypt
        getPositionOnGlobe(10, 45),   // Somalia
        getPositionOnGlobe(0, 40),    // Kenya
        getPositionOnGlobe(-20, 35),  // Mozambique
        getPositionOnGlobe(-30, 25),  // South Africa
        getPositionOnGlobe(-20, 15),  // Namibia
        getPositionOnGlobe(0, 10),    // Congo
        getPositionOnGlobe(10, 0),    // Nigeria
        getPositionOnGlobe(30, 0)     // Back to Morocco
      ];
      addContinent(africa, "Africa");
      
      // Asia (simplified outline)
      const asia = [
        getPositionOnGlobe(65, 80),   // Siberia
        getPositionOnGlobe(55, 125),  // Russia East
        getPositionOnGlobe(40, 125),  // China East
        getPositionOnGlobe(22, 115),  // Vietnam
        getPositionOnGlobe(15, 100),  // Thailand
        getPositionOnGlobe(5, 100),   // Malaysia
        getPositionOnGlobe(20, 80),   // India
        getPositionOnGlobe(30, 60),   // Middle East
        getPositionOnGlobe(40, 45),   // Turkey
        getPositionOnGlobe(50, 50),   // Russia South
        getPositionOnGlobe(65, 80)    // Back to Siberia
      ];
      addContinent(asia, "Asia");
      
      // Australia (simplified outline)
      const australia = [
        getPositionOnGlobe(-20, 120), // Australia North
        getPositionOnGlobe(-25, 135), // Australia East
        getPositionOnGlobe(-35, 145), // Australia Southeast
        getPositionOnGlobe(-35, 135), // Australia South
        getPositionOnGlobe(-30, 115), // Australia West
        getPositionOnGlobe(-20, 120)  // Back to Australia North
      ];
      addContinent(australia, "Australia");
      
      // Handle window resize
      const handleResize = () => {
        if (!cameraRef.current || !rendererRef.current || !containerRef.current) return;
        
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(width, height);
      };
      
      // Start animation loop with error handling
      const animate = () => {
        try {
          // Store reference for cancellation
          animationFrameRef.current = requestAnimationFrame(animate);
          
          if (globeRef.current) {
            globeRef.current.rotation.y += 0.005;
          }
          
          // Use the stored references with safety checks
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        } catch (animateError) {
          console.error("Error in animation loop:", animateError);
          if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
          }
          setLoadingState('error');
        }
      };
      
      // Start animation loop
      animate();
      
      // Add event listeners
      window.addEventListener('resize', handleResize);
      
      // Set loading state to ready
      setLoadingState('ready');
      
      // Return cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        cleanupScene();
      };
    } catch (error) {
      console.error("Error initializing 3D scene:", error);
      setLoadingState('error');
      cleanupScene();
    }
  }, [cleanupScene]);
  
  // Initialize the scene on component mount
  useEffect(() => {
    initializeScene();
    
    // Cleanup function
    return () => {
      cleanupScene();
    };
  }, [initializeScene, cleanupScene]);

  // Add markers for user locations with TypeScript safety
  useEffect(() => {
    // Skip if scene isn't ready or no user data
    if (!sceneRef.current || !userPointsRef.current || users.length === 0) return;
    
    try {
      // Store reference to avoid TypeScript errors
      const pointsGroup = userPointsRef.current;
      
      // Clear existing points
      while (pointsGroup.children.length > 0) {
        pointsGroup.remove(pointsGroup.children[0]);
      }
      
      // Reduce marker polygon count for better performance
      const markerGeometry = new THREE.SphereGeometry(0.5, 8, 8);
      
      // Add new points
      users.forEach(user => {
        if (!user.latitude || !user.longitude) return;
        
        // Convert lat/lng to 3D position
        const position = getPositionOnGlobe(user.latitude, user.longitude);
        
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
        marker.position.set(position.x, position.y, position.z);
        
        // Safe to add because we already checked above and stored reference
        pointsGroup.add(marker);
      });
    } catch (error) {
      console.error("Error adding user markers:", error);
    }
  }, [users]);
  
  return (
    <div className={`relative h-full ${className}`}>
      <div 
        ref={containerRef} 
        className="h-full w-full overflow-hidden rounded-lg"
      />
      
      {usersLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-white">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading global data...</p>
        </div>
      )}
      
      {usersError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white">
          <AlertTriangle className="h-10 w-10 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">Data Loading Error</h3>
          <p className="text-gray-300 mb-4 text-center max-w-md">
            There was a problem loading user location data. 
            The visualization will retry automatically in a few seconds.
          </p>
          <button 
            onClick={() => refetchUsers()} 
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md flex items-center gap-2 transition-colors"
          >
            <span>Retry Now</span>
            <RefreshCw className="h-4 w-4 animate-spin" />
          </button>
        </div>
      )}
      
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
            <button 
              onClick={() => {
                setLoadingState('initializing');
                setInitAttempts(0);
                setTimeout(initializeScene, 500);
              }} 
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-md flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      )}
      
      {loadingState === 'ready' && !usersLoading && !usersError && (
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
      )}
    </div>
  );
}