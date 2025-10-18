import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { type Region } from "@shared/schema";
import { motion } from "framer-motion";
import { CheckCircle2, Target, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export function RegionMap() {
  const { toast } = useToast();
  
  const { data: regions, isLoading } = useQuery<Region[]>({
    queryKey: ["/api/regions"],
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Region> }) => {
      return await apiRequest(`/api/regions/${id}`, "PATCH", data);
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
        <div className="text-emerald-400 animate-pulse">Loading regions...</div>
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
          <h2 className="text-2xl font-bold text-white">Regional Conquest Map</h2>
          <div className="text-emerald-400 font-mono">
            {conqueredCount}/{totalRegions} Conquered
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

      {/* Regions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {regions?.map((region) => {
          const isStarting = region.regionNumber === 4;
          
          return (
            <motion.button
              key={region.id}
              onClick={() => handleToggleConquest(region)}
              disabled={updateMutation.isPending}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              data-testid={`region-tile-${region.regionNumber}`}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-300
                ${region.conquered
                  ? "bg-emerald-500/20 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                  : isStarting
                  ? "bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                  : "bg-white/5 border-white/20 hover:border-emerald-500/50 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                }
                ${updateMutation.isPending ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Region Number */}
              <div className="text-center space-y-2">
                <div
                  className={`text-3xl font-bold font-mono ${
                    region.conquered
                      ? "text-emerald-400"
                      : isStarting
                      ? "text-yellow-400"
                      : "text-white/70"
                  }`}
                >
                  {region.regionNumber}
                </div>
                
                <div className={`text-xs ${region.conquered ? "text-emerald-300" : "text-white/50"}`}>
                  {region.name}
                </div>

                {/* Status Icons */}
                <div className="flex items-center justify-center gap-2 mt-2">
                  {region.conquered ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : isStarting ? (
                    <Target className="w-5 h-5 text-yellow-400" />
                  ) : null}
                </div>

                {/* Conquered Date */}
                {region.conquered && region.conqueredDate && (
                  <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-400/70 mt-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(region.conqueredDate), "MMM d")}
                  </div>
                )}

                {/* Starting Region Badge */}
                {isStarting && !region.conquered && (
                  <div className="text-[10px] text-yellow-400 font-semibold">
                    START HERE
                  </div>
                )}
              </div>

              {/* Glow effect for conquered regions */}
              {region.conquered && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-lg pointer-events-none" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 justify-center pt-4 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500/20" />
          <span className="text-sm text-white/70">Conquered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-yellow-500/50 bg-yellow-500/10" />
          <span className="text-sm text-white/70">Starting Region</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded border-2 border-white/20 bg-white/5" />
          <span className="text-sm text-white/70">Not Conquered</span>
        </div>
      </div>
    </div>
  );
}
