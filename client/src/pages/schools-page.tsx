import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, Building2 } from "lucide-react";

type School = {
  id: number;
  regionId: number;
  name: string;
  type: string;
  district: string;
  contacted: boolean;
  contactedDate: string | null;
  responseStatus: string;
  notes: string;
  priority: number;
};

// KASS regions mapping
const KASS_REGIONS: Record<number, string> = {
  1: "Region 1 - Marshall County",
  2: "Region 2 - Caldwell County",
  3: "Region 3 - Henderson County",
  4: "Region 4 - Monroe County",
  5: "Region 5 - Jefferson County",
  6: "Region 6 - Oldham County",
  7: "Region 7 - Campbell County",
  8: "Region 8 - Boone County",
  9: "Region 9 - Carroll County",
  10: "Region 10 - Shelby County",
  11: "Region 11 - Fayette County",
  12: "Region 12 - Franklin County",
  13: "Region 13 - Madison County",
  14: "Region 14 - Pike County",
  15: "Region 15 - Floyd County",
  16: "Region 16 - Boyd County",
  17: "Region 17 - Bath County",
  18: "Region 18 - Carter County"
};

export default function SchoolsPage() {
  const { data: schools, isLoading } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });

  // Group schools by region
  const schoolsByRegion = schools?.reduce((acc, school) => {
    if (!acc[school.regionId]) {
      acc[school.regionId] = [];
    }
    acc[school.regionId].push(school);
    return acc;
  }, {} as Record<number, School[]>) ?? {};

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="border-b border-primary/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white text-glow">KASS Regions Map</h1>
          <p className="text-sm text-gray-400 mt-1">Kentucky Association of School Superintendents</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Map Card */}
        <Card className="glow-card bg-black/80 border-primary/40">
          <CardContent className="p-6">
            <div className="relative w-full bg-white rounded-lg overflow-hidden">
              <img 
                src="/kass-map.png" 
                alt="KASS Regions Map"
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Schools Checklist */}
        <Card className="glow-card bg-black/80 border-primary/40">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-white text-glow mb-6">Schools by Region</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full bg-gray-800" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(KASS_REGIONS).map((regionIdStr) => {
                  const regionId = parseInt(regionIdStr);
                  const regionSchools = schoolsByRegion[regionId] || [];
                  const contactedCount = regionSchools.filter(s => s.contacted).length;
                  const totalCount = regionSchools.length;

                  return (
                    <div key={regionId} className="border border-primary/20 rounded-lg p-4 bg-black/40">
                      {/* Region Header */}
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">
                          {KASS_REGIONS[regionId]}
                        </h3>
                        <div className="text-sm text-gray-400">
                          {contactedCount}/{totalCount} contacted
                        </div>
                      </div>

                      {/* Schools List */}
                      {regionSchools.length > 0 ? (
                        <div className="space-y-2 ml-4">
                          {regionSchools.map((school) => (
                            <div 
                              key={school.id}
                              className="flex items-center gap-3 p-2 rounded hover:bg-primary/10 transition-colors"
                              data-testid={`school-item-${school.id}`}
                            >
                              {school.contacted ? (
                                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" data-testid={`school-contacted-${school.id}`} />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-600 flex-shrink-0" data-testid={`school-not-contacted-${school.id}`} />
                              )}
                              <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                              <div className="flex-1">
                                <div className="text-white text-sm">
                                  {school.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {school.type === 'middle' ? 'Middle School' : 'High School'} • {school.district}
                                </div>
                              </div>
                              {school.responseStatus !== 'pending' && (
                                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                                  {school.responseStatus.replace('-', ' ')}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm ml-4 italic">
                          No schools in this region yet
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
