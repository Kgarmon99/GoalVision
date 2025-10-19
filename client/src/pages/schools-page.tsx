import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { School } from "@shared/schema";
import { Building2, MapPin, CheckCircle2, Clock } from "lucide-react";
import { useState } from "react";
import { SearchBar } from "@/components/search-bar";

export default function SchoolsPage() {
  const [search, setSearch] = useState("");

  const { data: schools = [], isLoading } = useQuery<School[]>({
    queryKey: ["/api/schools"],
  });

  const { data: regions = [] } = useQuery<any[]>({
    queryKey: ["/api/regions"],
  });

  const filteredSchools = schools.filter(school => 
    !search || 
    school.name.toLowerCase().includes(search.toLowerCase()) ||
    school.type.toLowerCase().includes(search.toLowerCase())
  );

  const contactedCount = schools.filter(s => s.contacted).length;
  const totalCount = schools.length;
  const completionRate = totalCount > 0 ? Math.round((contactedCount / totalCount) * 100) : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen cosmic-bg flex items-center justify-center">
        <div className="text-white text-glow">Loading schools data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="border-b border-primary/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white text-glow">KASS Regional Schools</h1>
          <p className="text-sm text-gray-400 mt-1">Track school outreach across Kentucky</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        
        {/* KASS Regions Map */}
        <Card className="glow-card bg-black/80 border-primary/40 mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold text-white text-glow mb-4">Map of KASS Regions</h2>
            <div className="relative w-full bg-white rounded-lg overflow-hidden">
              <img 
                src="/attached_assets/image_1760831992153.png" 
                alt="KASS Regions Map"
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="glow-card bg-black/80 border-primary/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Total Schools</p>
                  <p className="text-3xl font-bold text-white text-glow-sm mt-1">{totalCount}</p>
                </div>
                <Building2 className="h-10 w-10 text-primary drop-shadow-glow" />
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card bg-black/80 border-primary/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Contacted</p>
                  <p className="text-3xl font-bold text-primary text-glow mt-1">{contactedCount}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-primary drop-shadow-glow" />
              </div>
            </CardContent>
          </Card>

          <Card className="glow-card bg-black/80 border-primary/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Completion</p>
                  <p className="text-3xl font-bold text-white text-glow-sm mt-1">{completionRate}%</p>
                </div>
                <MapPin className="h-10 w-10 text-primary drop-shadow-glow" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Schools List */}
        <Card className="glow-card bg-black/80 border-primary/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white text-glow">All Schools</h2>
              <div className="w-80">
                <SearchBar 
                  placeholder="Search schools..." 
                  onSearch={setSearch}
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredSchools.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  {search ? "No schools match your search" : "No schools in database"}
                </div>
              ) : (
                filteredSchools.map((school) => {
                  const region = regions.find(r => r.id === school.regionId);
                  return (
                    <div
                      key={school.id}
                      className="flex items-center justify-between p-4 bg-black/40 border border-primary/20 rounded-lg hover:border-primary/40 transition-all"
                      data-testid={`school-${school.id}`}
                    >
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full ${school.contacted ? 'bg-primary' : 'bg-gray-600'}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-white font-semibold" data-testid={`text-school-name-${school.id}`}>
                              {school.name}
                            </h3>
                            <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary border border-primary/30">
                              {school.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              Region {region?.regionNumber || school.regionId}
                            </span>
                            {school.contacted && school.contactedDate && (
                              <span className="flex items-center gap-1 text-primary">
                                <CheckCircle2 className="w-3 h-3" />
                                Contacted {new Date(school.contactedDate).toLocaleDateString()}
                              </span>
                            )}
                            {!school.contacted && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-3 h-3" />
                                Pending contact
                              </span>
                            )}
                          </div>
                          {school.notes && (
                            <p className="text-xs text-gray-500 mt-2 italic">{school.notes}</p>
                          )}
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded font-semibold text-sm ${
                        school.contacted 
                          ? 'bg-primary/20 text-primary border border-primary/30' 
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}>
                        {school.contacted ? 'CONTACTED' : 'PENDING'}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {filteredSchools.length > 0 && (
              <div className="mt-6 pt-4 border-t border-primary/20 text-center text-sm text-gray-400">
                Showing {filteredSchools.length} of {totalCount} schools
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
