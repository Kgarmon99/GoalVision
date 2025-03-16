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
        
        // Create a Vector2 for the raycaster
        const mousePosition = new THREE.Vector2(mouseX, mouseY);
        raycasterRef.current.setFromCamera(mousePosition, cameraRef.current);
        
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
        
        // Create a Vector2 for the raycaster
        const mousePosition = new THREE.Vector2(mouseX, mouseY);
        raycasterRef.current.setFromCamera(mousePosition, cameraRef.current);
        
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
            Math.abs(globeRef.current.rotation.y - targetRotationY) < 0.01 &&
            Math.abs(globeRef.current.rotation.x - targetRotationX) < 0.01
          ) {
            return;
          }
          
          requestAnimationFrame(animate);
        };
        
        animate();
      }
      
      // Zoom camera
      const targetZoom = 120;
      const currentZoom = cameraRef.current.position.z;
      
      // Animate zoom
      const animateZoom = () => {
        if (!cameraRef.current) return;
        
        cameraRef.current.position.z = THREE.MathUtils.lerp(
          cameraRef.current.position.z,
          targetZoom,
          0.05
        );
        
        if (Math.abs(cameraRef.current.position.z - targetZoom) < 0.5) {
          setZoomLevel(2);
          return;
        }
        
        requestAnimationFrame(animateZoom);
      };
      
      animateZoom();
    };
    
    // Handle zoom out
    const zoomOut = () => {
      if (!cameraRef.current) return;
      
      setIsZoomedIn(false);
      setIsAutoRotating(true);
      
      // Target zoom
      const targetZoom = 180;
      
      // Animate zoom
      const animateZoom = () => {
        if (!cameraRef.current) return;
        
        cameraRef.current.position.z = THREE.MathUtils.lerp(
          cameraRef.current.position.z,
          targetZoom,
          0.1
        );
        
        if (Math.abs(cameraRef.current.position.z - targetZoom) < 0.5) {
          setZoomLevel(1);
          return;
        }
        
        requestAnimationFrame(animateZoom);
      };
      
      animateZoom();
    };
    
    // Start animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      
      if (globeRef.current && isAutoRotating) {
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
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleMouseClick);
    
    // Handle touch events for mobile
    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        handleMouseMove(touch as unknown as MouseEvent);
      }
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        handleMouseMove(touch as unknown as MouseEvent);
      }
    };
    
    containerRef.current.addEventListener('touchstart', handleTouchStart);
    containerRef.current.addEventListener('touchmove', handleTouchMove);
    containerRef.current.addEventListener('touchend', () => {
      setActiveLocation(null);
    });
    
    // Handle scroll wheel for zoom
    const handleWheel = (event: WheelEvent) => {
      if (!cameraRef.current) return;
      
      // Prevent default behavior
      event.preventDefault();
      
      // Calculate new zoom level
      const zoomSpeed = 5;
      const newZoom = cameraRef.current.position.z + (event.deltaY > 0 ? zoomSpeed : -zoomSpeed);
      
      // Clamp between min and max zoom
      cameraRef.current.position.z = Math.max(80, Math.min(250, newZoom));
      
      // Update zoom level state
      if (cameraRef.current.position.z < 120) {
        setZoomLevel(2);
        setIsZoomedIn(true);
        setIsAutoRotating(false);
      } else {
        setZoomLevel(1);
        setIsZoomedIn(false);
        setIsAutoRotating(true);
      }
    };
    
    containerRef.current.addEventListener('wheel', handleWheel);
    
    // Set ready state
    setIsReady(true);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleMouseClick);
        containerRef.current.removeEventListener('touchstart', handleTouchStart);
        containerRef.current.removeEventListener('touchmove', handleTouchMove);
        containerRef.current.removeEventListener('wheel', handleWheel);
      }
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);
  
  // Add markers for user locations
  useEffect(() => {
    // If scene isn't ready or no user locations, return
    if (!sceneRef.current || !userPointsRef.current) return;
    if (userLocations.length === 0) return;
    
    // Clear existing points
    while (userPointsRef.current.children.length > 0) {
      const child = userPointsRef.current.children[0];
      if (child instanceof THREE.Mesh) {
        if (child.geometry) {
          child.geometry.dispose();
        }
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(material => material.dispose());
          } else {
            child.material.dispose();
          }
        }
      }
      userPointsRef.current.remove(child);
    }
    
    // Add new points
    userLocations.forEach(location => {
      // Convert lat/lng to 3D position
      const lat = (location.lat * Math.PI) / 180;
      const lng = (location.lng * Math.PI) / 180;
      
      const x = -50 * Math.cos(lat) * Math.sin(lng);
      const y = 50 * Math.sin(lat);
      const z = 50 * Math.cos(lat) * Math.cos(lng);
      
      // Create marker
      const markerGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      
      // Different colors for different activity levels
      let markerColor = 0xff0000; // Red for inactive
      
      if (location.status === 'active') {
        markerColor = 0x00ff00; // Green for active
      } else if (location.status === 'recent') {
        markerColor = 0xffff00; // Yellow for recent
      }
      
      const markerMaterial = new THREE.MeshPhongMaterial({
        color: markerColor,
        emissive: markerColor,
        emissiveIntensity: 0.5,
        shininess: 50
      });
      
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(x, y, z);
      
      // Store user data with the marker
      marker.userData = {
        isMarker: true,
        userLocation: location
      };
      
      if (userPointsRef.current) {
        userPointsRef.current.add(marker);
      }
      
      // Add pulsing effect for active users
      if (location.status === 'active') {
        const pulseGeometry = new THREE.SphereGeometry(0.5, 16, 16);
        const pulseMaterial = new THREE.MeshBasicMaterial({
          color: 0x00ff00,
          transparent: true,
          opacity: 0.4
        });
        
        const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
        pulse.position.set(x, y, z);
        
        // Animation for pulse
        const pulseScale = { value: 1 };
        
        const animatePulse = () => {
          pulseScale.value = 1 + Math.sin(Date.now() * 0.005) * 0.5;
          pulse.scale.set(pulseScale.value, pulseScale.value, pulseScale.value);
          requestAnimationFrame(animatePulse);
        };
        
        animatePulse();
        
        if (userPointsRef.current) {
          userPointsRef.current.add(pulse);
        }
      }
      
      // Create line to the surface for better visibility
      if (location.status === 'active' || location.status === 'recent') {
        const lineGeometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(x, y, z)
        ]);
        
        const lineMaterial = new THREE.LineBasicMaterial({
          color: location.status === 'active' ? 0x00ff00 : 0xffff00,
          transparent: true,
          opacity: 0.3
        });
        
        const line = new THREE.Line(lineGeometry, lineMaterial);
        
        if (userPointsRef.current) {
          userPointsRef.current.add(line);
        }
      }
    });
    
    // Add your location marker if available
    if (yourLocation && showYourLocation) {
      const lat = (yourLocation.lat * Math.PI) / 180;
      const lng = (yourLocation.lng * Math.PI) / 180;
      
      const x = -50 * Math.cos(lat) * Math.sin(lng);
      const y = 50 * Math.sin(lat);
      const z = 50 * Math.cos(lat) * Math.cos(lng);
      
      // Create your marker (larger and different color)
      const yourMarkerGeometry = new THREE.SphereGeometry(1, 16, 16);
      const yourMarkerMaterial = new THREE.MeshPhongMaterial({
        color: 0x3498db,
        emissive: 0x3498db,
        emissiveIntensity: 0.5,
        shininess: 80
      });
      
      const yourMarker = new THREE.Mesh(yourMarkerGeometry, yourMarkerMaterial);
      yourMarker.position.set(x, y, z);
      
      // Store your location data with the marker
      yourMarker.userData = {
        isMarker: true,
        isYourLocation: true,
        userLocation: {
          lat: yourLocation.lat,
          lng: yourLocation.lng,
          country: "Your Location",
          city: "Current Position",
          username: "You",
          lastActive: new Date(),
          status: 'active' as ActivityStatus,
          goalsCreated: 0,
          tasksCompleted: 0
        }
      };
      
      if (userPointsRef.current) {
        userPointsRef.current.add(yourMarker);
      }
      
      // Add pulsing effect
      const pulseGeometry = new THREE.SphereGeometry(1, 16, 16);
      const pulseMaterial = new THREE.MeshBasicMaterial({
        color: 0x3498db,
        transparent: true,
        opacity: 0.3
      });
      
      const pulse = new THREE.Mesh(pulseGeometry, pulseMaterial);
      pulse.position.set(x, y, z);
      
      // Animation for pulse
      const pulseScale = { value: 1 };
      
      const animatePulse = () => {
        pulseScale.value = 1 + Math.sin(Date.now() * 0.005) * 1.5;
        pulse.scale.set(pulseScale.value, pulseScale.value, pulseScale.value);
        requestAnimationFrame(animatePulse);
      };
      
      animatePulse();
      
      if (userPointsRef.current) {
        userPointsRef.current.add(pulse);
      }
    }
    
  }, [userLocations, yourLocation, showYourLocation]);
  
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
                  <Globe className="h-5 w-5 text-blue-400" />
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
                    <MapIcon className="h-4 w-4 text-amber-400" />
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
          
          {/* Location Info Popup */}
          <AnimatePresence>
            {activeLocation && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.2 }}
                className="absolute top-6 right-6"
              >
                <Card className="bg-black/60 text-white border-0 shadow-2xl backdrop-blur-md w-72">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base text-white flex justify-between items-center">
                      <span className="truncate">{activeLocation.username}</span>
                      <Badge className={`text-xs px-2 py-0 h-5 ${
                        activeLocation.status === 'active' ? 'bg-green-500' : 
                        activeLocation.status === 'recent' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {activeLocation.status === 'active' ? 'Active' : 
                         activeLocation.status === 'recent' ? 'Recent' : 'Inactive'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-300">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {activeLocation.city}, {activeLocation.country}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2 space-y-3">
                    <div className="text-sm">
                      <div className="mb-1 text-gray-400">Last Active</div>
                      <div className="font-medium">
                        {activeLocation.lastActive 
                          ? activeLocation.lastActive.toLocaleDateString() 
                          : 'Never'}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-sm">
                        <div className="mb-1 text-gray-400">Goals Created</div>
                        <div className="font-medium">{activeLocation.goalsCreated}</div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="mb-1 text-gray-400">Tasks Completed</div>
                        <div className="font-medium">{activeLocation.tasksCompleted}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
                            >
                              <Github className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Github Profile</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
                            >
                              <Linkedin className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View LinkedIn Profile</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 rounded-full bg-white/10 hover:bg-white/20"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View Full Profile</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Your Location Card */}
          {yourLocation && showYourLocation && nearbyUsers.length > 0 && (
            <div className="absolute bottom-6 right-6 w-64">
              <Card className="bg-black/50 text-white border-0 shadow-2xl backdrop-blur-md">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm text-white flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    <span>Users Near You</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0 space-y-2 max-h-48 overflow-y-auto">
                  {nearbyUsers.map((user, index) => (
                    <div 
                      key={index} 
                      className="flex items-center justify-between py-1"
                    >
                      <div className="truncate text-sm">{user.username}</div>
                      <Badge className={`text-xs px-2 py-0 h-5 ${
                        user.status === 'active' ? 'bg-green-500' : 
                        user.status === 'recent' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}>
                        {getDistanceFromLatLonInKm(
                          yourLocation.lat, yourLocation.lng,
                          user.lat, user.lng
                        ).toFixed(0)}km
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Controls */}
          <div className="absolute top-6 left-6">
            <Card className="bg-black/50 border-0 backdrop-blur-md text-white p-2">
              <CardContent className="p-0 flex space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={() => setIsAutoRotating(!isAutoRotating)}
                      >
                        {isAutoRotating ? (
                          <span className="h-4 w-4">■</span>
                        ) : (
                          <span className="h-4 w-4">▶</span>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isAutoRotating ? 'Pause Rotation' : 'Resume Rotation'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-white hover:bg-white/20"
                        onClick={() => zoomOut()}
                        disabled={!isZoomedIn}
                      >
                        <span className="h-4 w-4">🔍-</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Zoom Out</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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