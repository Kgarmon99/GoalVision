import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prospect } from "@shared/schema";
import { DollarSign, TrendingUp, Calendar } from "lucide-react";

interface TopProspectsProps {
  prospects: Prospect[];
  loading?: boolean;
}

export function TopProspects({ prospects, loading = false }: TopProspectsProps) {
  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div className="text-center text-gray-400">Loading prospects...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Prospects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {prospects.slice(0, 5).map((prospect) => (
            <div key={prospect.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
              <div className="flex-1">
                <p className="text-white font-medium">{prospect.name}</p>
                <p className="text-sm text-gray-400">{prospect.organization}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {prospect.stage}
                  </Badge>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {prospect.expectedCloseDate}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center text-green-400 font-bold">
                  <DollarSign className="h-4 w-4" />
                  {prospect.value.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">{prospect.probability}% chance</div>
              </div>
            </div>
          ))}
          {prospects.length === 0 && (
            <p className="text-center text-gray-400 py-4">No prospects found</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}