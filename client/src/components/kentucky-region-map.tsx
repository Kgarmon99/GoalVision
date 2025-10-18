import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Region } from "@shared/schema";
import { motion } from "framer-motion";
import { CheckCircle2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

// Approximate clickable regions based on the KASS map image
// Coordinates as percentages of image width/height (x, y, width, height)
const regionAreas: Record<number, { x: number; y: number; width: number; height: number }> = {
  1: { x: 2, y: 55, width: 12, height: 15 }, // Far West
  2: { x: 12, y: 48, width: 10, height: 17 }, // Graves/Calloway area
  3: { x: 18, y: 35, width: 10, height: 15 }, // Henderson/Union/Webster
  4: { x: 15, y: 75, width: 12, height: 12 }, // Daviess/McLean
  5: { x: 25, y: 42, width: 12, height: 15 }, // Breckinridge/Grayson
  6: { x: 28, y: 25, width: 12, height: 15 }, // Trimble/Carroll area
  7: { x: 82, y: 15, width: 10, height: 12 }, // Boone/Campbell/Kenton
  8: { x: 35, y: 32, width: 10, height: 12 }, // Region 8 area
  9: { x: 92, y: 20, width: 8, height: 12 }, // Boyd/Carter/Greenup
  10: { x: 93, y: 35, width: 7, height: 15 }, // Lawrence/Martin/Pike
  11: { x: 93, y: 52, width: 7, height: 15 }, // Bell/Clay/Harlan
  12: { x: 82, y: 70, width: 12, height: 12 }, // Clinton/McCreary/Pulaski
  13: { x: 85, y: 80, width: 15, height: 10 }, // Adair/Casey/Russell
  14: { x: 58, y: 82, width: 14, height: 12 }, // Barren/Hart
  15: { x: 35, y: 78, width: 14, height: 12 }, // Christian/Hopkins
  16: { x: 45, y: 82, width: 10, height: 10 }, // Hardin area
  17: { x: 72, y: 20, width: 10, height: 12 }, // Fayette/Jessamine/Woodford
  18: { x: 45, y: 32, width: 12, height: 14 }, // Additional region
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
          <div className="text-emerald-400 font-mono">
            {conqueredCount}/{totalRegions} Regions Conquered
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="relative h-3 bg-black/50 rounded-full overflow-hidden border border-emerald-500/30">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)",
            }}
          />
        </div>
      </div>

      {/* Interactive Kentucky Map with Image Background */}
      <div className="relative w-full rounded-lg border border-emerald-500/20 overflow-hidden bg-black/30">
        {/* Background KASS Map Image */}
        <img
          src="/kass-map.png"
          alt="Kentucky KASS Regions Map"
          className="w-full h-auto opacity-70"
        />
        
        {/* Interactive Overlay Regions */}
        <div className="absolute inset-0">
          {regions?.map((region) => {
            const area = regionAreas[region.regionNumber];
            if (!area) return null;

            const isConquered = region.conquered;
            const isStarting = region.regionNumber === 4;
            const isHovered = hoveredRegion === region.regionNumber;
            
            return (
              <motion.div
                key={region.id}
                className={`absolute cursor-pointer transition-all duration-200 ${
                  isConquered
                    ? "bg-emerald-500/40 border-2 border-emerald-500"
                    : isStarting
                    ? "bg-yellow-500/20 border-2 border-yellow-500/50"
                    : "bg-white/5 border-2 border-white/20 hover:border-emerald-500/50"
                }`}
                style={{
                  left: `${area.x}%`,
                  top: `${area.y}%`,
                  width: `${area.width}%`,
                  height: `${area.height}%`,
                  boxShadow: isConquered
                    ? "0 0 20px rgba(16, 185, 129, 0.6)"
                    : isHovered
                    ? "0 0 15px rgba(16, 185, 129, 0.4)"
                    : "none",
                }}
                onClick={() => handleToggleConquest(region)}
                onMouseEnter={() => setHoveredRegion(region.regionNumber)}
                onMouseLeave={() => setHoveredRegion(null)}
                whileHover={{ scale: 1.05 }}
                data-testid={`region-area-${region.regionNumber}`}
              >
                {/* Region Number Label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className={`text-2xl md:text-3xl font-bold font-mono ${
                        isConquered
                          ? "text-emerald-400"
                          : isStarting
                          ? "text-yellow-400"
                          : "text-white"
                      }`}
                      style={{
                        textShadow: isConquered
                          ? "0 0 10px rgba(16, 185, 129, 0.8)"
                          : "0 2px 8px rgba(0,0,0,0.9)",
                      }}
                    >
                      {region.regionNumber}
                    </div>
                    
                    {/* Icons */}
                    <div className="flex items-center justify-center mt-1">
                      {isConquered && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                      {isStarting && !isConquered && (
                        <Target className="w-5 h-5 text-yellow-400" />
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Hovered Region Tooltip */}
        {hoveredRegion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 right-4 bg-black/90 border border-emerald-500/40 rounded-lg p-3 backdrop-blur-sm z-10"
          >
            <div className="text-emerald-400 font-mono text-sm font-bold">
              Region {hoveredRegion}
            </div>
            <div className="text-white/70 text-xs mt-1">
              {regions?.find(r => r.regionNumber === hoveredRegion)?.name}
            </div>
            <div className="text-white/50 text-xs mt-1">
              Click to {regions?.find(r => r.regionNumber === hoveredRegion)?.conquered ? 'un-conquer' : 'conquer'}
            </div>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 justify-center pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500/40" />
          <span className="text-sm text-white/70">Conquered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-yellow-500 bg-yellow-500/20" />
          <span className="text-sm text-white/70">Starting Region (4)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-white/20 bg-white/5" />
          <span className="text-sm text-white/70">Not Conquered</span>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center text-xs text-white/50">
        Click on any region to mark it as conquered. Start with Region 4!
      </div>
    </div>
  );
}
