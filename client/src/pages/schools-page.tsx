import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, Building2, ChevronDown, ChevronRight, Search, Filter, Phone, Calendar, Edit, CheckCheck, Target } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-gray-600/50 text-gray-300",
  interested: "bg-blue-600/50 text-blue-200",
  "not-interested": "bg-red-600/50 text-red-200",
  "meeting-scheduled": "bg-primary/50 text-primary",
  closed: "bg-purple-600/50 text-purple-200"
};

export default function SchoolsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [collapsedRegions, setCollapsedRegions] = useState<Set<number>>(new Set());
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const { toast } = useToast();

  const { data: schools, isLoading } = useQuery<School[]>({
    queryKey: ['/api/schools'],
  });

  const updateSchoolMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<School> }) => {
      return apiRequest('PATCH', `/api/schools/${id}`, data);
    },
    onSuccess: (_, { data }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools'] });
      toast({
        title: "School updated",
        description: "School information has been updated successfully.",
      });
      setEditingSchool(null);
    },
  });

  const quickContactMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('PATCH', `/api/schools/${id}`, {
        contacted: true,
        contactedDate: new Date().toISOString().split('T')[0],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/schools'] });
      toast({
        title: "Marked as contacted",
        description: "School has been marked as contacted.",
      });
    },
  });

  const schoolsByRegion = useMemo(() => {
    return schools?.reduce((acc, school) => {
      if (!acc[school.regionId]) {
        acc[school.regionId] = [];
      }
      acc[school.regionId].push(school);
      return acc;
    }, {} as Record<number, School[]>) ?? {};
  }, [schools]);

  const filteredSchools = useMemo(() => {
    if (!schools) return [];
    return schools.filter(school => {
      const matchesSearch = searchTerm === "" || 
        school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.district.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || school.responseStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [schools, searchTerm, statusFilter]);

  const filteredSchoolsByRegion = useMemo(() => {
    return filteredSchools.reduce((acc, school) => {
      if (!acc[school.regionId]) {
        acc[school.regionId] = [];
      }
      acc[school.regionId].push(school);
      return acc;
    }, {} as Record<number, School[]>);
  }, [filteredSchools]);

  const overallStats = useMemo(() => {
    if (!schools) return { total: 0, contacted: 0, interested: 0, meetingScheduled: 0 };
    return {
      total: schools.length,
      contacted: schools.filter(s => s.contacted).length,
      interested: schools.filter(s => s.responseStatus === 'interested').length,
      meetingScheduled: schools.filter(s => s.responseStatus === 'meeting-scheduled').length,
    };
  }, [schools]);

  const toggleRegion = (regionId: number) => {
    const newCollapsed = new Set(collapsedRegions);
    if (newCollapsed.has(regionId)) {
      newCollapsed.delete(regionId);
    } else {
      newCollapsed.add(regionId);
    }
    setCollapsedRegions(newCollapsed);
  };

  const handleUpdateSchool = (data: Partial<School>) => {
    if (!editingSchool) return;
    updateSchoolMutation.mutate({ id: editingSchool.id, data });
  };

  return (
    <div className="min-h-screen cosmic-bg">
      <div className="border-b border-primary/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white text-glow">KASS Regions Map</h1>
          <p className="text-sm text-gray-400 mt-1">Kentucky Association of School Superintendents</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Overall Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glow-card bg-black/80 border-primary/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase">Total Schools</p>
                  <p className="text-2xl font-bold text-white">{overallStats.total}</p>
                </div>
                <Building2 className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="glow-card bg-black/80 border-primary/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase">Contacted</p>
                  <p className="text-2xl font-bold text-white">{overallStats.contacted}</p>
                  <p className="text-xs text-gray-500">
                    {overallStats.total > 0 ? Math.round((overallStats.contacted / overallStats.total) * 100) : 0}% complete
                  </p>
                </div>
                <Phone className="w-8 h-8 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="glow-card bg-black/80 border-primary/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase">Interested</p>
                  <p className="text-2xl font-bold text-white">{overallStats.interested}</p>
                </div>
                <Target className="w-8 h-8 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="glow-card bg-black/80 border-primary/40">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-xs uppercase">Meetings</p>
                  <p className="text-2xl font-bold text-white">{overallStats.meetingScheduled}</p>
                </div>
                <Calendar className="w-8 h-8 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

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

        {/* Search and Filter */}
        <Card className="glow-card bg-black/80 border-primary/40">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search schools or districts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-black/50 border-primary/20 text-white"
                  data-testid="input-search-schools"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-black/50 border-primary/20 text-white" data-testid="select-status-filter">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="interested">Interested</SelectItem>
                  <SelectItem value="not-interested">Not Interested</SelectItem>
                  <SelectItem value="meeting-scheduled">Meeting Scheduled</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Schools Checklist */}
        <Card className="glow-card bg-black/80 border-primary/40">
          <CardHeader>
            <CardTitle className="text-white text-glow">Schools by Region</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20 w-full bg-gray-800" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {Object.keys(KASS_REGIONS).map((regionIdStr) => {
                  const regionId = parseInt(regionIdStr);
                  const regionSchools = schoolsByRegion[regionId] || [];
                  const filteredRegionSchools = filteredSchoolsByRegion[regionId] || [];
                  const contactedCount = regionSchools.filter(s => s.contacted).length;
                  const totalCount = regionSchools.length;
                  const progress = totalCount > 0 ? (contactedCount / totalCount) * 100 : 0;
                  const isCollapsed = collapsedRegions.has(regionId);

                  // Skip regions with no schools when filtering
                  if (filteredRegionSchools.length === 0 && (searchTerm || statusFilter !== "all")) {
                    return null;
                  }

                  return (
                    <div key={regionId} className="border border-primary/20 rounded-lg bg-black/40 overflow-hidden">
                      {/* Region Header */}
                      <button
                        onClick={() => toggleRegion(regionId)}
                        className="w-full p-4 flex items-center justify-between hover:bg-primary/5 transition-colors"
                        data-testid={`button-toggle-region-${regionId}`}
                      >
                        <div className="flex items-center gap-3">
                          {isCollapsed ? (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                          <h3 className="text-lg font-semibold text-white">
                            {KASS_REGIONS[regionId]}
                          </h3>
                          <Badge variant="outline" className="border-primary/40 text-primary">
                            {contactedCount}/{totalCount}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="hidden md:block w-32">
                            <Progress value={progress} className="h-2" />
                          </div>
                          <span className="text-sm text-gray-400 min-w-[60px] text-right">
                            {Math.round(progress)}%
                          </span>
                        </div>
                      </button>

                      {/* Schools List */}
                      {!isCollapsed && (
                        <div className="px-4 pb-4">
                          {filteredRegionSchools.length > 0 ? (
                            <div className="space-y-1">
                              {filteredRegionSchools.map((school) => (
                                <div 
                                  key={school.id}
                                  className="group flex items-center gap-3 p-3 rounded-lg hover:bg-primary/10 transition-colors border border-transparent hover:border-primary/20"
                                  data-testid={`school-item-${school.id}`}
                                >
                                  <div className="flex-shrink-0">
                                    {school.contacted ? (
                                      <CheckCircle2 className="w-5 h-5 text-primary" data-testid={`school-contacted-${school.id}`} />
                                    ) : (
                                      <Circle className="w-5 h-5 text-gray-600" data-testid={`school-not-contacted-${school.id}`} />
                                    )}
                                  </div>
                                  <Building2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-white text-sm font-medium truncate">
                                      {school.name}
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center gap-2">
                                      <span>{school.type === 'middle' ? 'Middle' : 'High'}</span>
                                      <span>•</span>
                                      <span className="truncate">{school.district}</span>
                                      {school.contactedDate && (
                                        <>
                                          <span>•</span>
                                          <span>{new Date(school.contactedDate).toLocaleDateString()}</span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {school.responseStatus !== 'pending' && (
                                      <Badge className={`text-xs ${STATUS_COLORS[school.responseStatus] || STATUS_COLORS.pending}`}>
                                        {school.responseStatus.replace(/-/g, ' ')}
                                      </Badge>
                                    )}
                                    {!school.contacted && (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => quickContactMutation.mutate(school.id)}
                                        disabled={quickContactMutation.isPending}
                                        data-testid={`button-quick-contact-${school.id}`}
                                      >
                                        <CheckCheck className="w-4 h-4" />
                                      </Button>
                                    )}
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => setEditingSchool(school)}
                                      data-testid={`button-edit-school-${school.id}`}
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm ml-4 italic py-2">
                              No schools in this region yet
                            </div>
                          )}
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

      {/* Edit School Dialog */}
      <Dialog open={!!editingSchool} onOpenChange={(open) => !open && setEditingSchool(null)}>
        <DialogContent className="bg-black border-primary/40">
          <DialogHeader>
            <DialogTitle className="text-white">Edit School</DialogTitle>
            <DialogDescription className="text-gray-400">
              Update contact information and status for {editingSchool?.name}
            </DialogDescription>
          </DialogHeader>
          {editingSchool && (
            <div className="space-y-4">
              <div>
                <Label className="text-white">Contact Status</Label>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    checked={editingSchool.contacted}
                    onChange={(e) => setEditingSchool({ ...editingSchool, contacted: e.target.checked })}
                    className="w-4 h-4"
                    data-testid="checkbox-contacted"
                  />
                  <span className="text-sm text-gray-300">Mark as contacted</span>
                </div>
              </div>
              {editingSchool.contacted && (
                <div>
                  <Label className="text-white">Contact Date</Label>
                  <Input
                    type="date"
                    value={editingSchool.contactedDate || ''}
                    onChange={(e) => setEditingSchool({ ...editingSchool, contactedDate: e.target.value })}
                    className="bg-black/50 border-primary/20 text-white mt-2"
                    data-testid="input-contact-date"
                  />
                </div>
              )}
              <div>
                <Label className="text-white">Response Status</Label>
                <Select 
                  value={editingSchool.responseStatus} 
                  onValueChange={(value) => setEditingSchool({ ...editingSchool, responseStatus: value })}
                >
                  <SelectTrigger className="bg-black/50 border-primary/20 text-white mt-2" data-testid="select-response-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="interested">Interested</SelectItem>
                    <SelectItem value="not-interested">Not Interested</SelectItem>
                    <SelectItem value="meeting-scheduled">Meeting Scheduled</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-white">Priority (0-5)</Label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={editingSchool.priority}
                  onChange={(e) => setEditingSchool({ ...editingSchool, priority: parseInt(e.target.value) || 0 })}
                  className="bg-black/50 border-primary/20 text-white mt-2"
                  data-testid="input-priority"
                />
              </div>
              <div>
                <Label className="text-white">Notes</Label>
                <Textarea
                  value={editingSchool.notes}
                  onChange={(e) => setEditingSchool({ ...editingSchool, notes: e.target.value })}
                  className="bg-black/50 border-primary/20 text-white mt-2"
                  rows={4}
                  data-testid="textarea-notes"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingSchool(null)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleUpdateSchool(editingSchool)}
                  disabled={updateSchoolMutation.isPending}
                  data-testid="button-save"
                >
                  {updateSchoolMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
