import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';
import { getStringOrFallback } from '@/utils/string-utils';
import { Loader2, MapPin, Users, Activity, Clock, MapIcon, AlertTriangle, Github, Linkedin, ExternalLink } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface GlobeVisualizationProps {
  title?: string;
  description?: string;
  className?: string;
  interactive?: boolean;
  showYourLocation?: boolean;
}

// User activity status classification
type ActivityStatus = 'active' | 'recent' | 'inactive';

interface UserLocation {
  lat: number;
  lng: number;
  country: string;
  city: string;
  username: string;
  lastActive: Date | null;
  status: ActivityStatus;
  goalsCreated: number;
  tasksCompleted: number;
}

export function GlobeVisualization({ 
  title = "Worldwide User Impact", 
  description = "Track users and their impact across the globe",
  className = "",
  interactive = true,
  showYourLocation = true
}: GlobeVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const globeRef = useRef<THREE.Mesh | null>(null);
  const userPointsRef = useRef<THREE.Group | null>(null);
  const raycasterRef = useRef<THREE.Raycaster>(new THREE.Raycaster());
  const mousePosition = useRef({ x: 0, y: 0 });
  const [isReady, setIsReady] = useState(false);
  const [activeLocation, setActiveLocation] = useState<UserLocation | null>(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    countries: 0,
    recentActivity: 0
  });
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [yourLocation, setYourLocation] = useState<{lat: number, lng: number} | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotationSpeed, setRotationSpeed] = useState(0.0005);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isZoomedIn, setIsZoomedIn] = useState(false);
  const [nearbyUsers, setNearbyUsers] = useState<UserLocation[]>([]);
  
  // Fetch users data
  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({ 
    queryKey: ['/api/users'],
    staleTime: 30000 // 30 seconds
  });

  // Get user's location if enabled
  useEffect(() => {
    if (showYourLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setYourLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.warn('Error getting location:', error.message);
          // Default to New York coordinates as fallback
          setYourLocation({
            lat: 40.7128,
            lng: -74.0060
          });
        }
      );
    }
  }, [showYourLocation]);

  // Process user data
  useEffect(() => {
    if (users.length === 0) return;
    
    const now = new Date();
    const processed: UserLocation[] = [];
    const countries = new Set<string>();
    let activeUsersCount = 0;
    let recentActivityCount = 0;
    
    users.forEach(user => {
      if (user.latitude && user.longitude) {
        // Determine activity status
        let status: ActivityStatus = 'inactive';
        
        if (user.lastActive) {
          const lastActive = new Date(user.lastActive);
          const diff = now.getTime() - lastActive.getTime();
          const days = diff / (1000 * 60 * 60 * 24);
          
          if (days <= 1) {
            status = 'active';
            activeUsersCount++;
          } else if (days <= 7) {
            status = 'recent';
            recentActivityCount++;
          }
        }
        
        processed.push({
          lat: user.latitude,
          lng: user.longitude,
          country: user.country || 'Unknown',
          city: user.city || 'Unknown',
          username: user.username,
          lastActive: user.lastActive ? new Date(user.lastActive) : null,
          status,
          goalsCreated: user.goalsCreated || 0,
          tasksCompleted: user.tasksCompleted || 0
        });
        
        if (user.country) {
          countries.add(user.country);
        }
      }
    });
    
    // Update stats
    setUserStats({
      totalUsers: users.length,
      activeUsers: activeUsersCount,
      countries: countries.size,
      recentActivity: recentActivityCount
    });
    
    setUserLocations(processed);
    
  }, [users]);

  // Calculate nearby users when your location changes
  useEffect(() => {
    if (!yourLocation || userLocations.length === 0) return;
    
    // Find users within approximately 500km radius
    const nearby = userLocations.filter(user => {
      const distance = getDistanceFromLatLonInKm(
        yourLocation.lat, yourLocation.lng,
        user.lat, user.lng
      );
      return distance < 500;
    });
    
    setNearbyUsers(nearby);
  }, [yourLocation, userLocations]);

  // Haversine formula to calculate distance between two points
  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const d = R * c; // Distance in km
    return d;
  };
  
  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  // Initialize the 3D scene
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Add subtle fog
    scene.fog = new THREE.Fog(0x000000, 200, 1000);
    
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
      alpha: true,
      antialias: true 
    });
    
    // Set initial size based on container
    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Enable shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
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
    directionalLight.castShadow = true;
    scene.add(directionalLight);
    
    // Add subtle point lights for better sphere illumination
    const pointLight1 = new THREE.PointLight(0x3498db, 1, 200);
    pointLight1.position.set(100, -50, 50);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0x9b59b6, 1, 200);
    pointLight2.position.set(-100, 50, -50);
    scene.add(pointLight2);
    
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
      transparent: true,
      opacity: 0.95,
    });
    
    const globe = new THREE.Mesh(globeGeometry, globeMaterial);
    globe.castShadow = true;
    globe.receiveShadow = true;
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
    
    // Handle mouse move for interactive rotation and raycasting
    const handleMouseMove = (event: MouseEvent) => {
      // For globe rotation response
      mousePosition.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mousePosition.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      // For interaction with user points
      if (interactive && containerRef.current && sceneRef.current && cameraRef.current && userPointsRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycasterRef.current.setFromCamera({ x: mouseX, y: mouseY }, cameraRef.current);
        
        // Get all the markers from the user points group
        const markers: THREE.Object3D[] = [];
        userPointsRef.current.traverse((child) => {
          if (child.userData && child.userData.isMarker) {
            markers.push(child);
          }
        });
        
        const intersects = raycasterRef.current.intersectObjects(markers);
        
        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;
          const userData = intersectedObject.userData;
          
          if (userData.userLocation) {
            setActiveLocation(userData.userLocation);
            document.body.style.cursor = 'pointer';
          }
        } else {
          setActiveLocation(null);
          document.body.style.cursor = 'default';
        }
      }
    };
    
    // Handle mouse click for interaction
    const handleMouseClick = (event: MouseEvent) => {
      if (interactive && containerRef.current && sceneRef.current && cameraRef.current && userPointsRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        
        // Calculate mouse position in normalized device coordinates (-1 to +1)
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        raycasterRef.current.setFromCamera({ x: mouseX, y: mouseY }, cameraRef.current);
        
        // Get all the markers from the user points group
        const markers: THREE.Object3D[] = [];
        userPointsRef.current.traverse((child) => {
          if (child.userData && child.userData.isMarker) {
            markers.push(child);
          }
        });
        
        const intersects = raycasterRef.current.intersectObjects(markers);
        
        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;
          const userData = intersectedObject.userData;
          
          if (userData.userLocation) {
            // Zoom to this location
            zoomToLocation(userData.userLocation);
          }
        } else if (isZoomedIn) {
          // Zoom out if clicking elsewhere
          zoomOut();
        }
      }
    };
    
    // Handle zoom to location
    const zoomToLocation = (location: UserLocation) => {
      if (!cameraRef.current || !globeRef.current) return;
      
      setIsZoomedIn(true);
      setIsAutoRotating(false);
      
      // Convert lat/lng to 3D position
      const lat = (location.lat * Math.PI) / 180;
      const lng = (location.lng * Math.PI) / 180;
      
      // Calculate target position
      const x = -55 * Math.cos(lat) * Math.sin(lng);
      const y = 55 * Math.sin(lat);
      const z = 55 * Math.cos(lat) * Math.cos(lng);
      
      // Rotate globe to show the location
      if (globeRef.current) {
        new THREE.Vector3(x, y, z).normalize();
        
        // Set the rotation to face the point
        const targetRotationY = Math.atan2(x, z);
        const targetRotationX = Math.atan2(y, Math.sqrt(x * x + z * z));
        
        // Animate rotation
        const animate = () => {
          if (!globeRef.current) return;
          
          globeRef.current.rotation.y = THREE.MathUtils.lerp(
            globeRef.current.rotation.y,
            targetRotationY,
            0.05
          );
          
          globeRef.current.rotation.x = THREE.MathUtils.lerp(
            globeRef.current.rotation.x,
            targetRotationX,
            0.05
          );
          
          if (
            Math.abs(globeRef.current.rotation.y - targetRotationY) > 0.01 ||
            Math.abs(globeRef.current.rotation.x - targetRotationX) > 0.01
          ) {
            requestAnimationFrame(animate);
          }
        };
        
        animate();
      }
    };
    
    // Zoom out
    const zoomOut = () => {
      setIsZoomedIn(false);
      setIsAutoRotating(true);
    };
    
    // Add pan controls for touch devices
    let touchStartX = 0;
    let touchStartY = 0;
    
    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.touches[0].clientX;
      touchStartY = event.touches[0].clientY;
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      if (!globeRef.current) return;
      
      const touchX = event.touches[0].clientX;
      const touchY = event.touches[0].clientY;
      
      const deltaX = (touchX - touchStartX) * 0.01;
      const deltaY = (touchY - touchStartY) * 0.01;
      
      globeRef.current.rotation.y += deltaX;
      globeRef.current.rotation.x += deltaY;
      
      touchStartX = touchX;
      touchStartY = touchY;
    };
    
    // Handle mouse wheel for zoom
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      
      if (!cameraRef.current) return;
      
      // Adjust zoom level based on wheel direction
      const newZoom = Math.max(0.7, Math.min(2, zoomLevel + event.deltaY * -0.001));
      setZoomLevel(newZoom);
      
      // Update camera position
      cameraRef.current.position.z = 180 / newZoom;
    };
    
    // Animation loop
    const animate = () => {
      if (!globeRef.current || !sceneRef.current || !cameraRef.current || !rendererRef.current) return;
      
      // Auto-rotate globe if enabled
      if (isAutoRotating) {
        globeRef.current.rotation.y += rotationSpeed;
      }
      
      // Make globe respond subtly to mouse position when not zoomed in
      if (!isZoomedIn) {
        const targetRotationX = mousePosition.current.y * 0.2;
        
        globeRef.current.rotation.x = THREE.MathUtils.lerp(
          globeRef.current.rotation.x,
          targetRotationX,
          0.01
        );
      }
      
      // Render scene
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      
      requestAnimationFrame(animate);
    };
    
    // Start animation
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleMouseClick);
    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    
    handleResize();
    animate();
    setIsReady(true);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleMouseClick);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      
      if (containerRef.current && rendererRef.current) {
        try {
          containerRef.current.removeChild(rendererRef.current.domElement);
        } catch (e) {
          console.warn('Error removing renderer from DOM:', e);
        }
      }
      
      // Clean up all THREE.js objects
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object instanceof THREE.Mesh) {
            if (object.geometry) object.geometry.dispose();
            
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          }
        });
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      
      // Reset cursor
      document.body.style.cursor = 'default';
    };
  }, [interactive, zoomLevel, isAutoRotating, isZoomedIn, rotationSpeed]);
  
  // Update user points on the globe whenever user locations change
  useEffect(() => {
    if (!sceneRef.current || !userPointsRef.current || userLocations.length === 0) return;
    
    // Clear existing points
    while (userPointsRef.current.children.length > 0) {
      const child = userPointsRef.current.children[0];
      
      if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
        if (child.geometry) child.geometry.dispose();
        
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(m => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
      
      userPointsRef.current.remove(child);
    }
    
    // Add user location markers
    userLocations.forEach(location => {
      // Convert lat/long to 3D coordinates on sphere
      const lat = (location.lat * Math.PI) / 180;
      const lng = (location.lng * Math.PI) / 180;
      
      // Calculate position on globe
      const x = -55 * Math.cos(lat) * Math.sin(lng);
      const y = 55 * Math.sin(lat);
      const z = 55 * Math.cos(lat) * Math.cos(lng);
      
      // Create marker based on activity status
      let markerColor;
      let markerSize;
      
      switch(location.status) {
        case 'active':
          markerColor = 0x4ade80; // Green
          markerSize = 1.2;
          break;
        case 'recent':
          markerColor = 0xfacc15; // Yellow
          markerSize = 0.8;
          break;
        default:
          markerColor = 0xef4444; // Red
          markerSize = 0.6;
      }
      
      // Create marker
      const markerGeometry = new THREE.SphereGeometry(markerSize, 16, 16);
      const markerMaterial = new THREE.MeshBasicMaterial({ color: markerColor });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      
      marker.position.set(x, y, z);
      
      // Add user data for raycasting
      marker.userData = {
        isMarker: true,
        userLocation: location
      };
      
      userPointsRef.current.add(marker);
      
      // Add pulsing effect for active users
      if (location.status === 'active') {
        const pulseGeometry = new THREE.SphereGeometry(markerSize * 1.2, 16, 16);
        const pulseMaterial = new THREE.MeshBasicMaterial({ 
          color: markerColor,
          transparent: true,
          opacity: 0.3
        });
        
        const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulse.position.set(x, y, z);
        
        // Animate pulse
        const animate = () => {
          pulse.scale.x = 1 + 0.2 * Math.sin(Date.now() * 0.005);
          pulse.scale.y = 1 + 0.2 * Math.sin(Date.now() * 0.005);
          pulse.scale.z = 1 + 0.2 * Math.sin(Date.now() * 0.005);
          
          requestAnimationFrame(animate);
        };
        
        animate();
        
        userPointsRef.current.add(pulse);
      }
      
      // Add connection line to nearby users
      if (yourLocation && location.status === 'active') {
        // Check if this user is near your location
        const distance = getDistanceFromLatLonInKm(
          yourLocation.lat, yourLocation.lng,
          location.lat, location.lng
        );
        
        if (distance < 1000) { // Less than 1000km
          // Convert your location to 3D coordinates
          const yourLat = (yourLocation.lat * Math.PI) / 180;
          const yourLng = (yourLocation.lng * Math.PI) / 180;
          
          const yourX = -55 * Math.cos(yourLat) * Math.sin(yourLng);
          const yourY = 55 * Math.sin(yourLat);
          const yourZ = 55 * Math.cos(yourLat) * Math.cos(yourLng);
          
          // Create connection line
          const points = [
            new THREE.Vector3(x, y, z),
            new THREE.Vector3(yourX, yourY, yourZ)
          ];
          
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
          const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0x4ade80,
            transparent: true,
            opacity: 0.4
          });
          
          const line = new THREE.Line(lineGeometry, lineMaterial);
          userPointsRef.current.add(line);
        }
      }
    });
    
    // Add your location if available
    if (yourLocation) {
      const lat = (yourLocation.lat * Math.PI) / 180;
      const lng = (yourLocation.lng * Math.PI) / 180;
      
      const x = -55 * Math.cos(lat) * Math.sin(lng);
      const y = 55 * Math.sin(lat);
      const z = 55 * Math.cos(lat) * Math.cos(lng);
      
      // Create your location marker
      const yourMarkerGeometry = new THREE.SphereGeometry(2, 16, 16);
      const yourMarkerMaterial = new THREE.MeshBasicMaterial({ color: 0x3b82f6 }); // Blue
      const yourMarker = new THREE.Mesh(yourMarkerGeometry, yourMarkerMaterial);
      
      yourMarker.position.set(x, y, z);
      userPointsRef.current.add(yourMarker);
      
      // Add pulse effect
      const pulseGeometry = new THREE.SphereGeometry(3, 16, 16);
      const pulseMaterial = new THREE.MeshBasicMaterial({ 
        color: 0x3b82f6,
        transparent: true,
        opacity: 0.3
      });
      
      const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
      pulse.position.set(x, y, z);
      
      // Animate pulse
      const animate = () => {
        pulse.scale.x = 1 + 0.3 * Math.sin(Date.now() * 0.003);
        pulse.scale.y = 1 + 0.3 * Math.sin(Date.now() * 0.003);
        pulse.scale.z = 1 + 0.3 * Math.sin(Date.now() * 0.003);
        
        requestAnimationFrame(animate);
      };
      
      animate();
      
      userPointsRef.current.add(pulse);
    }
    
  }, [userLocations, yourLocation]);
  
  // Toggle auto-rotation
  const toggleRotation = useCallback(() => {
    setIsAutoRotating(prev => !prev);
  }, []);
  
  // Format date to relative time
  const formatRelativeTime = (date: Date | null) => {
    if (!date) return 'Never';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) return `${diffInWeeks} weeks ago`;
    
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} months ago`;
  };
  
  // Get status badge color
  const getStatusBadgeColor = (status: ActivityStatus) => {
    switch(status) {
      case 'active': return 'bg-green-500 hover:bg-green-600';
      case 'recent': return 'bg-yellow-500 hover:bg-yellow-600';
      default: return 'bg-red-500 hover:bg-red-600';
    }
  };
  
  return (
    <Card className={`overflow-hidden border shadow-md ${className}`}>
      <CardHeader className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white z-10 relative pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center text-2xl font-bold">
              <MapPin className="mr-2 h-6 w-6" />
              {title}
            </CardTitle>
            <CardDescription className="text-blue-100 mt-1">
              {description}
            </CardDescription>
          </div>
          
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10"
                    onClick={toggleRotation}
                  >
                    {isAutoRotating ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Activity className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isAutoRotating ? 'Pause Rotation' : 'Resume Rotation'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-white hover:bg-white/10"
                    onClick={() => window.location.reload()}
                  >
                    <MapIcon className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Refresh Map Data
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
        
        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-2 mt-3">
          <div className="bg-white/10 rounded-md p-2 flex flex-col items-center">
            <Users className="h-5 w-5 text-blue-300 mb-1" />
            <div className="text-lg font-bold">{userStats.totalUsers}</div>
            <div className="text-xs text-blue-200">Total Users</div>
          </div>
          
          <div className="bg-white/10 rounded-md p-2 flex flex-col items-center">
            <Activity className="h-5 w-5 text-green-300 mb-1" />
            <div className="text-lg font-bold">{userStats.activeUsers}</div>
            <div className="text-xs text-blue-200">Active Users</div>
          </div>
          
          <div className="bg-white/10 rounded-md p-2 flex flex-col items-center">
            <MapPin className="h-5 w-5 text-yellow-300 mb-1" />
            <div className="text-lg font-bold">{userStats.countries}</div>
            <div className="text-xs text-blue-200">Countries</div>
          </div>
          
          <div className="bg-white/10 rounded-md p-2 flex flex-col items-center">
            <Clock className="h-5 w-5 text-purple-300 mb-1" />
            <div className="text-lg font-bold">{userStats.recentActivity}</div>
            <div className="text-xs text-blue-200">Recent Users</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative min-h-[600px]">
        {usersLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-black/70 p-5 rounded-lg flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-3" />
              <p className="text-white">Loading global user data...</p>
            </div>
          </div>
        ) : (
          <>
            <motion.div 
              ref={containerRef} 
              className="absolute inset-0 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: isReady ? 1 : 0 }}
              transition={{ duration: 1.5 }}
            />
            
            {/* User location details */}
            <AnimatePresence>
              {activeLocation && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-4 left-4 p-4 bg-black/70 backdrop-blur-sm rounded-lg text-white z-20 w-80"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold">{activeLocation.username}</h3>
                    <Badge className={getStatusBadgeColor(activeLocation.status)}>
                      {activeLocation.status === 'active' ? 'Active Now' : 
                       activeLocation.status === 'recent' ? 'Recently Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-200">
                      <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                      <span>
                        {activeLocation.city}, {activeLocation.country}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-200">
                      <Clock className="h-4 w-4 mr-2 text-blue-400" />
                      <span>Last active: {formatRelativeTime(activeLocation.lastActive)}</span>
                    </div>
                    
                    <div className="bg-white/10 rounded-md p-2 mt-2 grid grid-cols-2 gap-2">
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-400">
                          {activeLocation.goalsCreated}
                        </div>
                        <div className="text-xs text-gray-300">Goals Created</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-xl font-bold text-yellow-400">
                          {activeLocation.tasksCompleted}
                        </div>
                        <div className="text-xs text-gray-300">Tasks Completed</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end mt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-xs h-8 text-blue-400 hover:text-blue-300 hover:bg-blue-950/50"
                      >
                        View Profile <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Nearby users panel */}
            {yourLocation && nearbyUsers.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 1 }}
                className="absolute top-4 right-4 p-3 bg-black/70 backdrop-blur-sm rounded-lg text-white z-20 w-64"
              >
                <h4 className="text-sm font-semibold flex items-center mb-2">
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  Users Near You ({nearbyUsers.length})
                </h4>
                
                <div className="max-h-40 overflow-y-auto pr-1 space-y-2">
                  {nearbyUsers.slice(0, 5).map((user, index) => (
                    <div 
                      key={index} 
                      className="bg-white/10 rounded-md p-2 text-xs flex justify-between items-center"
                    >
                      <div className="flex items-center">
                        <div className={`h-2 w-2 rounded-full mr-2 ${
                          user.status === 'active' ? 'bg-green-500' : 
                          user.status === 'recent' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span>{user.username}</span>
                      </div>
                      <span className="text-gray-400 text-xs">{user.country}</span>
                    </div>
                  ))}
                  
                  {nearbyUsers.length > 5 && (
                    <div className="text-center text-xs text-blue-300 mt-1">
                      + {nearbyUsers.length - 5} more users nearby
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {/* Info panel */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 2 }}
              className="absolute bottom-4 right-4 text-xs text-white/60 flex flex-col items-end space-y-1"
            >
              <div className="flex items-center">
                <span className="mr-1">Drag to rotate</span>
                <span className="inline-block w-3 h-3 border border-white/60 rounded-full"></span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">Scroll to zoom</span>
                <span className="inline-block w-3 h-3 border border-white/60 rounded-full"></span>
              </div>
              <div className="flex items-center">
                <span className="mr-1">Click for details</span>
                <span className="inline-block w-3 h-3 border border-white/60 rounded-full"></span>
              </div>
            </motion.div>
          </>
        )}
      </CardContent>
      
      <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" className="h-8">
              <Github className="h-4 w-4 mr-1" /> GitHub
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Linkedin className="h-4 w-4 mr-1" /> LinkedIn
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}