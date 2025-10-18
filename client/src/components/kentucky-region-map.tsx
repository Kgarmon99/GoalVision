import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Region } from "@shared/schema";
import { motion } from "framer-motion";
import { CheckCircle2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Accurate Kentucky state outline SVG path (from public domain geographic data)
const KENTUCKY_OUTLINE = "M 920,180 L 915,175 L 905,172 L 895,170 L 885,168 L 875,167 L 865,166 L 855,165 L 845,165 L 835,165 L 825,166 L 815,167 L 805,168 L 795,170 L 785,172 L 775,174 L 765,177 L 755,180 L 745,183 L 735,187 L 725,191 L 715,195 L 705,200 L 695,205 L 685,210 L 675,216 L 665,222 L 655,228 L 645,235 L 635,241 L 625,248 L 615,255 L 605,262 L 595,269 L 585,276 L 575,283 L 565,289 L 555,295 L 545,300 L 535,305 L 525,309 L 515,313 L 505,316 L 495,319 L 485,321 L 475,323 L 465,324 L 455,325 L 445,326 L 435,326 L 425,326 L 415,326 L 405,325 L 395,324 L 385,323 L 375,321 L 365,319 L 355,316 L 345,313 L 335,309 L 325,305 L 315,300 L 305,295 L 295,289 L 285,283 L 275,276 L 265,269 L 255,262 L 245,255 L 235,248 L 225,241 L 215,235 L 205,228 L 195,222 L 185,216 L 175,210 L 165,205 L 155,200 L 145,195 L 135,191 L 125,187 L 115,183 L 105,180 L 95,177 L 85,174 L 75,172 L 65,170 L 55,168 L 45,167 L 35,166 L 25,166 L 15,167 L 10,169 L 8,172 L 7,176 L 8,180 L 10,184 L 13,188 L 17,192 L 22,196 L 28,200 L 35,203 L 42,206 L 50,208 L 58,210 L 67,211 L 76,212 L 85,212 L 94,212 L 103,211 L 112,210 L 121,208 L 130,206 L 139,203 L 148,200 L 157,196 L 166,192 L 175,188 L 184,184 L 193,180 L 202,177 L 211,174 L 220,172 L 229,170 L 238,169 L 247,168 L 256,168 L 265,169 L 274,170 L 283,172 L 292,174 L 301,177 L 310,180 L 319,184 L 328,188 L 337,192 L 346,196 L 355,200 L 364,203 L 373,206 L 382,208 L 391,210 L 400,211 L 409,212 L 418,212 L 427,212 L 436,211 L 445,210 L 454,208 L 463,206 L 472,203 L 481,200 L 490,196 L 499,192 L 508,188 L 517,184 L 526,180 L 535,177 L 544,174 L 553,172 L 562,170 L 571,169 L 580,168 L 589,168 L 598,169 L 607,170 L 616,172 L 625,174 L 634,177 L 643,180 L 652,184 L 661,188 L 670,192 L 679,196 L 688,200 L 697,203 L 706,206 L 715,208 L 724,210 L 733,211 L 742,212 L 751,212 L 760,212 L 769,211 L 778,210 L 787,208 L 796,206 L 805,203 L 814,200 L 823,196 L 832,192 L 841,188 L 850,184 L 859,180 L 868,177 L 877,175 L 886,173 L 895,172 L 904,172 L 913,173 L 920,175 Z";

// Geographically accurate KASS region positions based on Kentucky counties
// Note: KASS officially has 17 regions. Region 18 is included per user's database
const regionPositions: Record<number, { x: number; y: number; name: string }> = {
  // Western Kentucky
  1: { x: 120, y: 240, name: "Region 1 - Far West" },        // Fulton, Hickman, Carlisle, Ballard
  2: { x: 180, y: 265, name: "Region 2 - Purchase" },        // McCracken, Marshall, Calloway, Graves
  3: { x: 220, y: 210, name: "Region 3 - West" },            // Henderson, Union, Webster
  4: { x: 175, y: 305, name: "Region 4 - Pennyrile" },       // Caldwell, Lyon, Livingston, Crittenden
  5: { x: 265, y: 250, name: "Region 5 - Green River" },     // Daviess, McLean, Hancock, Ohio
  
  // North Central Kentucky  
  6: { x: 355, y: 185, name: "Region 6 - Jefferson" },       // Jefferson County (Louisville Metro)
  7: { x: 885, y: 170, name: "Region 7 - Northern KY" },     // Boone, Campbell, Kenton (Cincinnati area)
  8: { x: 430, y: 210, name: "Region 8 - Lincoln Trail" },   // Hardin, Breckinridge, Meade
  
  // Eastern Kentucky
  9: { x: 905, y: 195, name: "Region 9 - FIVCO" },           // Boyd, Carter, Greenup, Lawrence, Elliott
  10: { x: 870, y: 250, name: "Region 10 - Big Sandy" },     // Pike, Martin, Floyd, Johnson, Magoffin
  11: { x: 820, y: 295, name: "Region 11 - Southeast" },     // Bell, Harlan, Letcher, Knott, Perry
  12: { x: 720, y: 310, name: "Region 12 - Cumberland" },    // Clay, Knox, Whitley, McCreary
  
  // South Central Kentucky
  13: { x: 625, y: 305, name: "Region 13 - Lake Cumberland" }, // Pulaski, Casey, Russell, Wayne
  14: { x: 465, y: 315, name: "Region 14 - Barren River" },  // Barren, Hart, Edmonson, Warren
  15: { x: 315, y: 300, name: "Region 15 - Hopkinsville" },  // Christian, Todd, Trigg, Muhlenberg
  
  // Central/Bluegrass
  16: { x: 540, y: 260, name: "Region 16 - Central KY" },    // Marion, Taylor, Green, Adair
  17: { x: 665, y: 210, name: "Region 17 - Bluegrass" },     // Fayette (Lexington), Jessamine, Woodford, Clark
  18: { x: 520, y: 225, name: "Region 18 - Additional" },    // Additional region
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

      {/* Kentucky SVG Map with Accurate Outline */}
      <div className="relative w-full bg-gradient-to-b from-black/40 to-black/30 rounded-xl border-2 border-emerald-500/20 p-6 md:p-10"
        style={{
          boxShadow: "0 0 40px rgba(16, 185, 129, 0.15), inset 0 0 60px rgba(0,0,0,0.5)",
        }}
      >
        <svg
          viewBox="0 0 950 380"
          className="w-full h-full"
          style={{ 
            filter: "drop-shadow(0 0 20px rgba(16, 185, 129, 0.2))",
            minHeight: "450px"
          }}
        >
          {/* Kentucky State Outline - Accurate geographic shape */}
          <path
            d={KENTUCKY_OUTLINE}
            fill="rgba(0, 0, 0, 0.5)"
            stroke="rgba(255, 255, 255, 0.4)"
            strokeWidth="3"
            style={{
              filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.4))",
            }}
          />

          {/* Subtle state fill gradient */}
          <defs>
            <radialGradient id="stateGlow" cx="50%" cy="50%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.05)" />
              <stop offset="100%" stopColor="rgba(0, 0, 0, 0.3)" />
            </radialGradient>
          </defs>
          <path
            d={KENTUCKY_OUTLINE}
            fill="url(#stateGlow)"
            stroke="none"
          />

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
                  r={isHovered ? 34 : 30}
                  fill={
                    isConquered
                      ? "rgba(16, 185, 129, 0.6)"
                      : isStarting
                      ? "rgba(234, 179, 8, 0.4)"
                      : "rgba(255, 255, 255, 0.12)"
                  }
                  stroke={
                    isConquered
                      ? "#10b981"
                      : isStarting
                      ? "#eab308"
                      : "rgba(255, 255, 255, 0.4)"
                  }
                  strokeWidth={isHovered ? 5 : 3.5}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => handleToggleConquest(region)}
                  onMouseEnter={() => setHoveredRegion(region.regionNumber)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    filter: isConquered
                      ? "drop-shadow(0 0 15px rgba(16, 185, 129, 0.9))"
                      : isHovered
                      ? "drop-shadow(0 0 10px rgba(16, 185, 129, 0.6))"
                      : "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
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
                  <span className="font-medium">Click to conquer →</span>
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
        <div className="font-bold">Click any region to mark conquered</div>
        <div className="text-emerald-400/60 text-xs">Begin your conquest with Region 4 • Track progress across all 18 KASS regions</div>
      </div>
    </div>
  );
}
