import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedComponent } from "@/components/ui/animated-component";
import { Prospect } from "@shared/schema";
import { formatDate, getDaysUntilDescription } from "@/utils/date-utils";
import { Progress } from "@/components/ui/progress";
import { Sparkles } from "lucide-react";

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
  maxItems = 3 
}: TopProspectsProps) {
  const sortedProspects = [...prospects]
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .slice(0, maxItems);

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
        <CardTitle className="text-xl font-semibold text-white">Top Prospects</CardTitle>
        <CardDescription>Highest priority deals to close</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedProspects.map((prospect, index) => (
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
                  <div>
                    <h3 className="font-semibold text-white">
                      {prospect.name}
                      {index === 0 && (
                        <span className="ml-2 text-xs text-yellow-400">#1 PRIORITY</span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-400">{prospect.organization}</p>
                  </div>
                  <Badge className={`${getStageColor(prospect.stage)}`}>
                    {prospect.stage}
                  </Badge>
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
      </CardContent>
    </Card>
  );
}