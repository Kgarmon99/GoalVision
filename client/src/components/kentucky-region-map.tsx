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
          
          {/* Emerald tint overlay for cyber aesthetic */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-transparent to-emerald-950/40 mix-blend-overlay" />
          
          {/* Subtle border glow */}
          <div className="absolute inset-0 pointer-events-none" style={{
            boxShadow: "inset 0 0 80px rgba(16, 185, 129, 0.12), inset 0 0 40px rgba(0, 0, 0, 0.5)"
          }} />
          
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full"
            style={{ 
              filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.2))"
            }}
          >

          {/* Individual Regional Markers */}
          {regions?.map((region) => {
            const pos = regionPositions[region.regionNumber];
            if (!pos) return null;

            const isConquered = region.conquered;
            const isStarting = region.regionNumber === 4;
            const isHovered = hoveredRegion === region.regionNumber;
            
            return (
              <g key={region.id}>
                {/* Outer glow ring for conquered regions */}
                {isConquered && (
                  <motion.circle
                    cx={pos.x}
                    cy={pos.y}
                    r={40}
                    fill="none"
                    stroke="rgba(16, 185, 129, 0.3)"
                    strokeWidth="2"
                    className="pointer-events-none"
                    animate={{
                      r: [38, 42, 38],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {/* Main Region Circle */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 36 : 32}
                  fill={
                    isConquered
                      ? "rgba(16, 185, 129, 0.65)"
                      : isStarting
                      ? "rgba(234, 179, 8, 0.5)"
                      : "rgba(255, 255, 255, 0.15)"
                  }
                  stroke={
                    isConquered
                      ? "#10b981"
                      : isStarting
                      ? "#eab308"
                      : "rgba(255, 255, 255, 0.5)"
                  }
                  strokeWidth={isHovered ? 4.5 : 3.5}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedRegion(region)}
                  onMouseEnter={() => setHoveredRegion(region.regionNumber)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    filter: isConquered
                      ? "drop-shadow(0 0 18px rgba(16, 185, 129, 1)) drop-shadow(0 0 8px rgba(16, 185, 129, 0.7))"
                      : isStarting
                      ? "drop-shadow(0 0 15px rgba(234, 179, 8, 0.9)) drop-shadow(0 0 6px rgba(234, 179, 8, 0.6))"
                      : isHovered
                      ? "drop-shadow(0 0 12px rgba(255, 255, 255, 0.7))"
                      : "drop-shadow(0 2px 6px rgba(0,0,0,0.6))",
                  }}
                  data-testid={`region-circle-${region.regionNumber}`}
                />
                
                {/* Region Number Label */}
                <text
                  x={pos.x}
                  y={pos.y}
                  fill={isConquered ? "#fff" : isStarting ? "#fef08a" : "#fff"}
                  fontSize="22"
                  fontWeight="900"
                  fontFamily="system-ui, -apple-system, sans-serif"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                  style={{
                    textShadow: isConquered 
                      ? "0 0 12px rgba(16, 185, 129, 1), 0 2px 4px rgba(0,0,0,0.9)" 
                      : "0 2px 6px rgba(0,0,0,0.95)",
                    letterSpacing: "-0.5px",
                  }}
                >
                  {region.regionNumber}
                </text>
                
                {/* Conquered Checkmark Badge */}
                {isConquered && (
                  <motion.g
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    transform={`translate(${pos.x + 18}, ${pos.y - 18})`}
                    className="pointer-events-none"
                  >
                    <circle cx="0" cy="0" r="11" fill="#10b981" stroke="#fff" strokeWidth="2" />
                    <path
                      d="M -5,0 L -2,5 L 5,-5"
                      stroke="white"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </motion.g>
                )}
                
                {/* Starting Region Animated Target */}
                {isStarting && !isConquered && (
                  <g transform={`translate(${pos.x}, ${pos.y - 25})`} className="pointer-events-none">
                    <motion.circle
                      cx="0"
                      cy="0"
                      r="9"
                      stroke="#eab308"
                      strokeWidth="2.5"
                      fill="none"
                      animate={{ 
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <circle cx="0" cy="0" r="4" fill="#eab308" />
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

      {/* Enhanced Legend */}
      <div className="flex flex-wrap gap-8 justify-center pt-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-[3.5px] border-emerald-500 bg-emerald-500/60" 
              style={{ boxShadow: "0 0 15px rgba(16, 185, 129, 0.6)" }} 
            />
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3 text-white" strokeWidth={3} />
            </div>
          </div>
          <span className="text-sm text-white/80 font-semibold">Conquered</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-[3.5px] border-yellow-500 bg-yellow-500/40" />
            <Target className="w-5 h-5 text-yellow-400 absolute -top-1 -right-1" strokeWidth={2.5} />
          </div>
          <span className="text-sm text-white/80 font-semibold">Starting Region</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border-[3.5px] border-white/40 bg-white/12" />
          <span className="text-sm text-white/80 font-semibold">Available</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-emerald-400/80 font-mono border-t border-white/5 pt-5 space-y-1">
        <div className="font-bold">Click any region to view school checklist</div>
        <div className="text-emerald-400/60 text-xs">Begin your conquest with Region 4 • Track middle & high schools across all 18 KASS regions</div>
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
