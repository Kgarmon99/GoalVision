import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { Prospect } from "@shared/schema";
import { formatDate, getDaysUntilDescription } from "@/utils/date-utils";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ChevronDown, ChevronUp, Edit } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TopProspectsProps {
  prospects: Prospect[];
  loading?: boolean;
  className?: string;
  maxItems?: number;
}

export function TopProspects({ 
  prospects, 
  loading = false, 
  className = "",
  maxItems = 10 
}: TopProspectsProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const sortedProspects = [...prospects]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  const displayedProspects = expanded ? sortedProspects : sortedProspects.slice(0, 3);

  const updateStageMutation = useMutation({
    mutationFn: async ({ id, stage }: { id: number; stage: string }) => {
      return apiRequest("PATCH", `/api/prospects/${id}`, { stage });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prospects"] });
      toast({
        title: "Stage Updated",
        description: "Prospect stage has been updated successfully.",
      });
      setEditingId(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update prospect stage.",
        variant: "destructive",
      });
    }
  });

  const getStageColor = (stage: string) => {
    switch(stage.toLowerCase()) {
      case "initial": return "bg-blue-600 text-white";
      case "qualified": return "bg-indigo-600 text-white";
      case "negotiation": return "bg-purple-600 text-white";
      case "closing": return "bg-yellow-600 text-black";
      case "won": return "bg-green-600 text-white";
      case "lost": return "bg-red-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const stageOptions = [
    { value: "initial", label: "Initial" },
    { value: "qualified", label: "Qualified" },
    { value: "negotiation", label: "Negotiation" },
    { value: "closing", label: "Closing" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" }
  ];

  const getPriorityIndicator = (priority: number | null, index: number) => {
    // Show special indicator for the #1 priority prospect
    if (index === 0) {
      return (
        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-1 shadow-lg animate-pulse z-10">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className={`${className} shadow-md border-green-600/50 bg-gray-900/60`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-white">Top Prospects</CardTitle>
          <CardDescription>Highest priority deals to close</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800 p-4 rounded-md animate-pulse h-24"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!prospects.length) {
    return (
      <Card className={`${className} shadow-md border-green-600/50 bg-gray-900/60`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl font-semibold text-white">Top Prospects</CardTitle>
          <CardDescription>Highest priority deals to close</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-800 p-4 rounded-md text-center py-8">
            <p className="text-gray-400">No active prospects yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${className} shadow-md border-green-600/50 bg-gray-900/60`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl font-semibold text-white">Kentucky School Prospects</CardTitle>
            <CardDescription>Top priority schools to close deals with</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-gray-400 hover:text-white"
          >
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                Show All 10
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedProspects.map((prospect, index) => (
            <AnimatedComponent
              key={prospect.id}
              animation="slideIn"
              direction="up"
              delay={index * 0.1}
              className="relative"
            >
              <div className="relative bg-gray-800 rounded-lg p-4 hover:bg-gray-800/80 transition-all border border-green-600/30 shadow-sm">
                {getPriorityIndicator(prospect.priority, index)}
                
                <div className="flex justify-between items-start mb-1">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">
                      {prospect.name}
                      {index === 0 && (
                        <span className="ml-2 text-xs text-yellow-400">#1 PRIORITY</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400">{prospect.organization}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {editingId === prospect.id ? (
                      <Select
                        value={prospect.stage}
                        onValueChange={(value) => {
                          updateStageMutation.mutate({ id: prospect.id, stage: value });
                        }}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {stageOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <>
                        <Badge className={`${getStageColor(prospect.stage)} cursor-pointer`}>
                          {prospect.stage}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                          onClick={() => setEditingId(prospect.id)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="text-sm">
                    <span className="text-green-400 font-semibold">${prospect.value.toLocaleString()}</span>
                    <span className="text-gray-400 mx-1">·</span>
                    <span className="text-gray-400">{getDaysUntilDescription(prospect.expectedCloseDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{prospect.probability}%</span>
                    <div className="w-16">
                      <Progress value={prospect.probability} className="h-1" />
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedComponent>
          ))}
        </div>
        {!expanded && sortedProspects.length > 3 && (
          <div className="text-center mt-4">
            <p className="text-sm text-gray-400">
              Showing 3 of {sortedProspects.length} prospects
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}