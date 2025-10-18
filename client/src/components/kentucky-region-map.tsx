import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Region } from "@shared/schema";
import { motion } from "framer-motion";
import { CheckCircle2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Simplified Kentucky state outline (approximate shape)
const KENTUCKY_OUTLINE = "M 50,150 L 100,140 L 200,135 L 350,130 L 500,125 L 650,120 L 750,115 L 850,110 L 900,120 L 920,140 L 900,160 L 880,180 L 850,200 L 820,220 L 780,240 L 740,255 L 680,270 L 620,280 L 560,285 L 500,288 L 440,290 L 380,288 L 320,285 L 260,280 L 200,270 L 150,255 L 100,235 L 70,210 L 50,180 Z";

// Region positions for a 3x6 grid layout overlay on Kentucky shape
const regionGrid: Record<number, { x: number; y: number; col: number; row: number }> = {
  1: { x: 80, y: 200, col: 0, row: 2 },    // Far West
  2: { x: 150, y: 230, col: 1, row: 2 },   // West
  3: { x: 150, y: 170, col: 1, row: 1 },   // North West
  4: { x: 80, y: 260, col: 0, row: 3 },    // SW (Starting)
  5: { x: 220, y: 200, col: 2, row: 2 },   // North Central
  6: { x: 220, y: 140, col: 2, row: 1 },   // North
  7: { x: 800, y: 140, col: 10, row: 1 },  // Far North East
  8: { x: 290, y: 170, col: 3, row: 1 },   // North Central
  9: { x: 870, y: 150, col: 11, row: 1 },  // North East Corner
  10: { x: 870, y: 200, col: 11, row: 2 }, // East
  11: { x: 870, y: 250, col: 11, row: 3 }, // South East
  12: { x: 750, y: 240, col: 9, row: 3 },  // South Central East
  13: { x: 680, y: 260, col: 8, row: 3 },  // South Central
  14: { x: 560, y: 270, col: 6, row: 3 },  // South
  15: { x: 290, y: 240, col: 3, row: 3 },  // South West
  16: { x: 430, y: 270, col: 5, row: 3 },  // South Central West
  17: { x: 650, y: 180, col: 8, row: 2 },  // Central
  18: { x: 430, y: 200, col: 5, row: 2 },  // Central West
};

export function KentuckyRegionMap() {
  const { toast } = useToast();
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null);
  
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
          <h2 className="text-2xl font-bold text-white">Kentucky KASS Regional Conquest</h2>
          <div className="text-emerald-400 font-mono text-xl">
            {conqueredCount}/{totalRegions}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-4 bg-black/50 rounded-full overflow-hidden border border-emerald-500/30">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.6)",
            }}
          />
        </div>
      </div>

      {/* Kentucky SVG Map */}
      <div className="relative w-full bg-black/30 rounded-lg border border-emerald-500/20 p-8">
        <svg
          viewBox="0 0 950 350"
          className="w-full h-full"
          style={{ 
            filter: "drop-shadow(0 0 15px rgba(16, 185, 129, 0.2))",
            minHeight: "400px"
          }}
        >
          {/* Kentucky State Outline */}
          <path
            d={KENTUCKY_OUTLINE}
            fill="rgba(0, 0, 0, 0.4)"
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth="2"
          />

          {/* Grid lines for visual reference (subtle) */}
          <g opacity="0.1">
            {[...Array(12)].map((_, i) => (
              <line
                key={`v-${i}`}
                x1={80 + i * 70}
                y1={100}
                x2={80 + i * 70}
                y2={300}
                stroke="white"
                strokeWidth="1"
              />
            ))}
            {[...Array(4)].map((_, i) => (
              <line
                key={`h-${i}`}
                x1={50}
                y1={140 + i * 60}
                x2={920}
                y2={140 + i * 60}
                stroke="white"
                strokeWidth="1"
              />
            ))}
          </g>

          {/* Individual clickable regions */}
          {regions?.map((region) => {
            const pos = regionGrid[region.regionNumber];
            if (!pos) return null;

            const isConquered = region.conquered;
            const isStarting = region.regionNumber === 4;
            const isHovered = hoveredRegion === region.regionNumber;
            
            return (
              <g key={region.id}>
                {/* Region Circle */}
                <motion.circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isHovered ? 32 : 28}
                  fill={
                    isConquered
                      ? "rgba(16, 185, 129, 0.5)"
                      : isStarting
                      ? "rgba(234, 179, 8, 0.3)"
                      : "rgba(255, 255, 255, 0.1)"
                  }
                  stroke={
                    isConquered
                      ? "#10b981"
                      : isStarting
                      ? "#eab308"
                      : "rgba(255, 255, 255, 0.3)"
                  }
                  strokeWidth={isHovered ? 4 : 3}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleToggleConquest(region)}
                  onMouseEnter={() => setHoveredRegion(region.regionNumber)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  whileHover={{ scale: 1.1 }}
                  style={{
                    filter: isConquered
                      ? "drop-shadow(0 0 12px rgba(16, 185, 129, 0.8))"
                      : isHovered
                      ? "drop-shadow(0 0 8px rgba(16, 185, 129, 0.5))"
                      : "none",
                  }}
                  data-testid={`region-circle-${region.regionNumber}`}
                />
                
                {/* Region Number */}
                <text
                  x={pos.x}
                  y={pos.y}
                  fill={isConquered ? "#10b981" : isStarting ? "#eab308" : "#fff"}
                  fontSize="20"
                  fontWeight="bold"
                  fontFamily="monospace"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="pointer-events-none select-none"
                  style={{
                    textShadow: isConquered 
                      ? "0 0 8px rgba(16, 185, 129, 1)" 
                      : "0 2px 4px rgba(0,0,0,0.9)",
                  }}
                >
                  {region.regionNumber}
                </text>
                
                {/* Conquered Checkmark */}
                {isConquered && (
                  <g transform={`translate(${pos.x + 15}, ${pos.y - 15})`} className="pointer-events-none">
                    <circle cx="0" cy="0" r="10" fill="rgba(16, 185, 129, 0.9)" />
                    <path
                      d="M -4,0 L -1,4 L 4,-4"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </g>
                )}
                
                {/* Starting Region Target */}
                {isStarting && !isConquered && (
                  <g transform={`translate(${pos.x}, ${pos.y - 20})`} className="pointer-events-none">
                    <motion.circle
                      cx="0"
                      cy="0"
                      r="8"
                      stroke="#eab308"
                      strokeWidth="2"
                      fill="none"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    <circle cx="0" cy="0" r="3" fill="#eab308" />
                  </g>
                )}
              </g>
            );
          })}
        </svg>

        {/* Hovered Region Tooltip */}
        {hoveredRegion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-black/95 border border-emerald-500/50 rounded-lg p-4 backdrop-blur-sm z-10"
            style={{
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.3)",
            }}
          >
            <div className="text-emerald-400 font-mono text-lg font-bold">
              Region {hoveredRegion}
            </div>
            <div className="text-white/80 text-sm mt-1">
              {regions?.find(r => r.regionNumber === hoveredRegion)?.name}
            </div>
            <div className="text-white/50 text-xs mt-2 border-t border-white/10 pt-2">
              {regions?.find(r => r.regionNumber === hoveredRegion)?.conquered 
                ? '✓ Conquered' 
                : 'Click to conquer'}
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 justify-center pt-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-3 border-emerald-500 bg-emerald-500/50" 
              style={{ boxShadow: "0 0 10px rgba(16, 185, 129, 0.5)" }} 
            />
            <CheckCircle2 className="w-4 h-4 text-white absolute -top-1 -right-1" />
          </div>
          <span className="text-sm text-white/70 font-medium">Conquered</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full border-3 border-yellow-500 bg-yellow-500/30" />
            <Target className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1" />
          </div>
          <span className="text-sm text-white/70 font-medium">Starting (Region 4)</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full border-3 border-white/30 bg-white/10" />
          <span className="text-sm text-white/70 font-medium">Not Conquered</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-sm text-emerald-400/70 font-mono border-t border-white/5 pt-4">
        Click any region circle to toggle conquest status • Start with Region 4
      </div>
    </div>
  );
}
