import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Region } from "@shared/schema";
import { motion } from "framer-motion";
import { CheckCircle2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { SchoolChecklistDialog } from "./school-checklist-dialog";

// Geographically accurate KASS region positions based on Kentucky counties
// Positions are in percentage (0-100) for responsive positioning on actual KY map
const regionPositions: Record<number, { x: number; y: number; name: string }> = {
  // Western Kentucky
  1: { x: 8, y: 48, name: "Region 1 - Far West" },        // Fulton, Hickman, Carlisle, Ballard
  2: { x: 15, y: 55, name: "Region 2 - Purchase" },        // McCracken, Marshall, Calloway, Graves
  3: { x: 20, y: 38, name: "Region 3 - West" },            // Henderson, Union, Webster
  4: { x: 14, y: 68, name: "Region 4 - Pennyrile" },       // Caldwell, Lyon, Livingston, Crittenden
  5: { x: 25, y: 52, name: "Region 5 - Green River" },     // Daviess, McLean, Hancock, Ohio
  
  // North Central Kentucky  
  6: { x: 38, y: 35, name: "Region 6 - Jefferson" },       // Jefferson County (Louisville Metro)
  7: { x: 92, y: 22, name: "Region 7 - Northern KY" },     // Boone, Campbell, Kenton (Cincinnati area)
  8: { x: 45, y: 40, name: "Region 8 - Lincoln Trail" },   // Hardin, Breckinridge, Meade
  
  // Eastern Kentucky
  9: { x: 95, y: 32, name: "Region 9 - FIVCO" },           // Boyd, Carter, Greenup, Lawrence, Elliott
  10: { x: 90, y: 52, name: "Region 10 - Big Sandy" },     // Pike, Martin, Floyd, Johnson, Magoffin
  11: { x: 84, y: 68, name: "Region 11 - Southeast" },     // Bell, Harlan, Letcher, Knott, Perry
  12: { x: 72, y: 72, name: "Region 12 - Cumberland" },    // Clay, Knox, Whitley, McCreary
  
  // South Central Kentucky
  13: { x: 62, y: 70, name: "Region 13 - Lake Cumberland" }, // Pulaski, Casey, Russell, Wayne
  14: { x: 45, y: 72, name: "Region 14 - Barren River" },  // Barren, Hart, Edmonson, Warren
  15: { x: 30, y: 68, name: "Region 15 - Hopkinsville" },  // Christian, Todd, Trigg, Muhlenberg
  
  // Central/Bluegrass
  16: { x: 54, y: 58, name: "Region 16 - Central KY" },    // Marion, Taylor, Green, Adair
  17: { x: 68, y: 42, name: "Region 17 - Bluegrass" },     // Fayette (Lexington), Jessamine, Woodford, Clark
  18: { x: 52, y: 45, name: "Region 18 - Additional" },    // Additional region
};

export function KentuckyRegionMap() {
  const { toast } = useToast();
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  
  const { data: regions, isLoading } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  // Query schools for data-dense overlays (Elon Algorithm: show all relevant data)
  const { data: schools } = useQuery<any[]>({
    queryKey: ["/api/schools"],
  });

  // Calculate metrics per region (First principles: raw data drives decisions)
  const getRegionStats = (regionId: number) => {
    if (!schools) return { total: 0, contacted: 0, percentage: 0 };
    const regionSchools = schools.filter(s => s.regionId === regionId);
    const contacted = regionSchools.filter(s => s.contacted).length;
    return {
      total: regionSchools.length,
      contacted,
      percentage: regionSchools.length > 0 ? Math.round((contacted / regionSchools.length) * 100) : 0
    };
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Region> }) => {
      return await apiRequest("PATCH", `/api/regions/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/regions"] });
      toast({
        title: "Region updated",
        description: "Region conquest status has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update region.",
        variant: "destructive",
      });
    },
  });

  const handleToggleConquest = (region: Region) => {
    const isConquering = !region.conquered;
    updateMutation.mutate({
      id: region.id,
      data: {
        conquered: isConquering,
        conqueredDate: isConquering ? new Date().toISOString() : null,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-emerald-400 animate-pulse">Loading Kentucky map...</div>
      </div>
    );
  }

  const conqueredCount = regions?.filter(r => r.conquered).length || 0;
  const totalRegions = regions?.length || 0;
  const progressPercent = totalRegions > 0 ? (conqueredCount / totalRegions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white tracking-tight">Kentucky KASS Regional Conquest</h2>
          <div className="text-emerald-400 font-mono text-xl font-bold">
            {conqueredCount}/{totalRegions} Regions
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-4 bg-black/50 rounded-full overflow-hidden border border-emerald-500/30">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 25px rgba(16, 185, 129, 0.7), inset 0 1px 0 rgba(255,255,255,0.2)",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-white drop-shadow-lg">
              {progressPercent.toFixed(0)}% Complete
            </span>
          </div>
        </div>
      </div>

      {/* Kentucky Map with Region Markers */}
      <div className="relative w-full bg-gradient-to-b from-black/40 to-black/30 rounded-xl border-2 border-emerald-500/20 overflow-hidden"
        style={{
          boxShadow: "0 0 40px rgba(16, 185, 129, 0.15), inset 0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Kentucky Map Image */}
        <div className="relative w-full" style={{ paddingBottom: "42%" }}>
          <img 
            src="/attached_assets/stock_images/kentucky_state_map_o_ed6ccd16.jpg" 
            alt="Kentucky State Map"
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              filter: "brightness(0.85) contrast(1.3) saturate(0.1) sepia(0.3) hue-rotate(100deg)",
              opacity: 0.85,
            }}
          />
          
          {/* Mission Control Grid Overlay (Elon Algorithm: tactical display) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(16, 185, 129, 0.3)" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
          
          {/* Data-Dense Overlay Tint */}
          <div className="absolute inset-0 bg-black/40" />
          
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            style={{ 
              filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.2))"
            }}
          >

          {/* ELON ALGORITHM: Data-Dense Regional Markers */}
          {regions?.map((region) => {
            const pos = regionPositions[region.regionNumber];
            if (!pos) return null;

            const isConquered = region.conquered;
            const isStarting = region.regionNumber === 4;
            const isHovered = hoveredRegion === region.regionNumber;
            const stats = getRegionStats(region.id);
            
            return (
              <g key={region.id}>
                {/* Minimalist Region Circle - First Principles Design */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 28 : 24}
                  fill={isConquered ? "#10b981" : isStarting ? "#eab308" : "#1f2937"}
                  stroke={isConquered ? "#10b981" : isStarting ? "#eab308" : "#6b7280"}
                  strokeWidth={isHovered ? 3 : 2}
                  className="cursor-pointer transition-all duration-150"
                  onClick={() => setSelectedRegion(region)}
                  onMouseEnter={() => setHoveredRegion(region.regionNumber)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    filter: isConquered 
                      ? "drop-shadow(0 0 8px rgba(16, 185, 129, 0.8))" 
                      : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
                  }}
                  data-testid={`region-circle-${region.regionNumber}`}
                />
                
                {/* Region Number - Mission Critical Data */}
                <text
                  x={pos.x}
                  y={pos.y - 1}
                  fill={isConquered ? "#000" : "#fff"}
                  fontSize="18"
                  fontWeight="800"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                  style={{
                    textShadow: isConquered ? "none" : "0 2px 4px rgba(0,0,0,0.9)",
                  }}
                >
                  {region.regionNumber}
                </text>
                
                {/* DATA OVERLAY: School Stats (Elon Algorithm - Maximum Information Density) */}
                {stats.total > 0 && (
                  <g className="pointer-events-none">
                    {/* Background for data label */}
                    <rect
                      x={pos.x - 16}
                      y={pos.y + 30}
                      width="32"
                      height="14"
                      fill="#000"
                      stroke={isConquered ? "#10b981" : "#6b7280"}
                      strokeWidth="1"
                      rx="2"
                      opacity="0.9"
                    />
                    {/* School completion data */}
                    <text
                      x={pos.x}
                      y={pos.y + 40}
                      fill={isConquered ? "#10b981" : "#fff"}
                      fontSize="10"
                      fontWeight="700"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {stats.contacted}/{stats.total}
                    </text>
                  </g>
                )}

                {/* Completion Percentage Badge (When > 0%) */}
                {stats.percentage > 0 && (
                  <g className="pointer-events-none">
                    <circle
                      cx={pos.x + 22}
                      cy={pos.y - 20}
                      r="12"
                      fill="#10b981"
                      stroke="#000"
                      strokeWidth="2"
                    />
                    <text
                      x={pos.x + 22}
                      y={pos.y - 19}
                      fill="#000"
                      fontSize="9"
                      fontWeight="900"
                      fontFamily="monospace"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {stats.percentage}%
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          </svg>
        </div>

        {/* Floating Region Info Tooltip */}
        {hoveredRegion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute top-6 right-6 bg-black/95 border-2 border-emerald-500/60 rounded-xl p-5 backdrop-blur-sm z-20 min-w-[280px]"
            style={{
              boxShadow: "0 10px 40px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(16, 185, 129, 0.2)",
            }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                <span className="text-emerald-400 font-bold text-lg">{hoveredRegion}</span>
              </div>
              <div className="text-emerald-400 font-mono text-lg font-bold">
                Region {hoveredRegion}
              </div>
            </div>
            <div className="text-white/90 text-sm font-medium mb-3 border-b border-white/10 pb-2">
              {regionPositions[hoveredRegion]?.name || regions?.find(r => r.regionNumber === hoveredRegion)?.name}
            </div>
            <div className="flex items-center gap-2 text-xs">
              {regions?.find(r => r.regionNumber === hoveredRegion)?.conquered ? (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">Conquered</span>
                </div>
              ) : (
                <div className="text-white/60">
                  <span className="font-medium">Click to view schools →</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* MISSION CONTROL DATA PANEL - Elon Algorithm: Pure Functionality */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-emerald-500/20 font-mono">
        {/* Total Schools Metric */}
        <div className="bg-black/50 border border-emerald-500/30 rounded p-3">
          <div className="text-emerald-400/70 text-xs uppercase tracking-wider mb-1">Total Schools</div>
          <div className="text-white text-2xl font-bold">{schools?.length || 0}</div>
        </div>
        
        {/* Contacted Metric */}
        <div className="bg-black/50 border border-emerald-500/30 rounded p-3">
          <div className="text-emerald-400/70 text-xs uppercase tracking-wider mb-1">Contacted</div>
          <div className="text-emerald-400 text-2xl font-bold">
            {schools?.filter(s => s.contacted).length || 0}
          </div>
        </div>
        
        {/* Completion Rate */}
        <div className="bg-black/50 border border-emerald-500/30 rounded p-3">
          <div className="text-emerald-400/70 text-xs uppercase tracking-wider mb-1">Completion</div>
          <div className="text-white text-2xl font-bold">
            {schools && schools.length > 0 
              ? Math.round((schools.filter(s => s.contacted).length / schools.length) * 100) 
              : 0}%
          </div>
        </div>
        
        {/* Regions Active */}
        <div className="bg-black/50 border border-emerald-500/30 rounded p-3">
          <div className="text-emerald-400/70 text-xs uppercase tracking-wider mb-1">Regions</div>
          <div className="text-white text-2xl font-bold">{conqueredCount}/{totalRegions}</div>
        </div>
      </div>

      {/* Minimalist Legend */}
      <div className="flex items-center justify-center gap-6 pt-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-emerald-500" />
          <span className="text-white/70">CONQUERED</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-yellow-500 border-2 border-yellow-500" />
          <span className="text-white/70">START</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-800 border-2 border-gray-600" />
          <span className="text-white/70">PENDING</span>
        </div>
        <div className="text-white/50 border-l border-white/20 pl-4">
          Click region → View schools
        </div>
      </div>

      {/* School Checklist Dialog */}
      {selectedRegion && (
        <SchoolChecklistDialog
          open={!!selectedRegion}
          onOpenChange={(open) => !open && setSelectedRegion(null)}
          regionId={selectedRegion.id}
          regionName={selectedRegion.name}
          regionNumber={selectedRegion.regionNumber}
        />
      )}
    </div>
  );
}
