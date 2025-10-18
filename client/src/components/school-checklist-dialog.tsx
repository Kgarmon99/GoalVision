import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { School, InsertSchool } from "@shared/schema";
import { Plus, Trash2, Building2, GraduationCap } from "lucide-react";

interface SchoolChecklistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  regionId: number;
  regionName: string;
  regionNumber: number;
}

export function SchoolChecklistDialog({
  open,
  onOpenChange,
  regionId,
  regionName,
  regionNumber,
}: SchoolChecklistDialogProps) {
  const [isAddingSchool, setIsAddingSchool] = useState(false);
  const [newSchool, setNewSchool] = useState<Partial<InsertSchool>>({
    regionId,
    type: "high",
    contacted: false,
    responseStatus: "pending",
    priority: 3,
  });

  // Fetch schools for this region
  const { data: schools = [], isLoading } = useQuery<School[]>({
    queryKey: ["/api/regions", regionId, "schools"],
    enabled: open,
  });

  // Update school mutation
  const updateSchoolMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Partial<InsertSchool>;
    }) => {
      return await apiRequest("PATCH", `/api/schools/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/regions", regionId, "schools"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
    },
  });

  // Create school mutation
  const createSchoolMutation = useMutation({
    mutationFn: async (data: InsertSchool) => {
      return await apiRequest("POST", "/api/schools", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/regions", regionId, "schools"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
      setIsAddingSchool(false);
      setNewSchool({
        regionId,
        type: "high",
        contacted: false,
        responseStatus: "pending",
        priority: 3,
      });
    },
  });

  // Delete school mutation
  const deleteSchoolMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/schools/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/regions", regionId, "schools"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/schools"] });
    },
  });

  const handleToggleContacted = (school: School) => {
    updateSchoolMutation.mutate({
      id: school.id,
      data: {
        contacted: !school.contacted,
        contactedDate: !school.contacted
          ? new Date().toISOString().split("T")[0]
          : null,
      },
    });
  };

  const handleAddSchool = () => {
    if (newSchool.name && newSchool.district) {
      createSchoolMutation.mutate(newSchool as InsertSchool);
    }
  };

  const middleSchools = schools.filter((s) => s.type === "middle");
  const highSchools = schools.filter((s) => s.type === "high");
  const contactedCount = schools.filter((s) => s.contacted).length;
  const totalCount = schools.length;
  const completionRate =
    totalCount > 0 ? Math.round((contactedCount / totalCount) * 100) : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-3xl max-h-[85vh] overflow-y-auto bg-black/95 border-emerald-500/30"
        data-testid="dialog-school-checklist"
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-emerald-400 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            Region {regionNumber} - {regionName}
          </DialogTitle>
          <DialogDescription className="text-white/70">
            Track conquest progress for middle and high schools
          </DialogDescription>
        </DialogHeader>

        {/* Progress Summary */}
        <div className="bg-emerald-950/30 border border-emerald-500/20 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white/80">Conquest Progress</span>
            <Badge
              variant="outline"
              className="border-emerald-500/50 text-emerald-400"
            >
              {contactedCount} / {totalCount} Contacted
            </Badge>
          </div>
          <div className="w-full bg-black/50 rounded-full h-3 overflow-hidden border border-emerald-500/20">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <div className="text-right text-sm text-emerald-400 mt-1">
            {completionRate}% Complete
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-8 text-white/60">
            Loading schools...
          </div>
        ) : (
          <div className="space-y-6">
            {/* High Schools */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                High Schools ({highSchools.length})
              </h3>
              <div className="space-y-2">
                {highSchools.map((school) => (
                  <div
                    key={school.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      school.contacted
                        ? "bg-emerald-950/40 border-emerald-500/40"
                        : "bg-black/30 border-white/10 hover:border-emerald-500/20"
                    }`}
                    data-testid={`school-item-${school.id}`}
                  >
                    <Checkbox
                      checked={school.contacted ?? false}
                      onCheckedChange={() => handleToggleContacted(school)}
                      className="mt-1 border-emerald-500/50 data-[state=checked]:bg-emerald-600"
                      data-testid={`checkbox-school-${school.id}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-medium ${
                            school.contacted
                              ? "text-emerald-400 line-through"
                              : "text-white"
                          }`}
                        >
                          {school.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs border-white/20 text-white/60"
                        >
                          {school.district}
                        </Badge>
                        {school.priority && school.priority >= 4 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-emerald-500/50 text-emerald-400"
                          >
                            High Priority
                          </Badge>
                        )}
                      </div>
                      {school.contactedDate && (
                        <div className="text-xs text-white/50 mt-1">
                          Contacted: {school.contactedDate}
                        </div>
                      )}
                      {school.notes && (
                        <div className="text-sm text-white/70 mt-1">
                          {school.notes}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      onClick={() => deleteSchoolMutation.mutate(school.id)}
                      data-testid={`button-delete-school-${school.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {highSchools.length === 0 && (
                  <div className="text-center py-4 text-white/40 text-sm">
                    No high schools added yet
                  </div>
                )}
              </div>
            </div>

            {/* Middle Schools */}
            <div>
              <h3 className="text-lg font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Middle Schools ({middleSchools.length})
              </h3>
              <div className="space-y-2">
                {middleSchools.map((school) => (
                  <div
                    key={school.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                      school.contacted
                        ? "bg-emerald-950/40 border-emerald-500/40"
                        : "bg-black/30 border-white/10 hover:border-emerald-500/20"
                    }`}
                    data-testid={`school-item-${school.id}`}
                  >
                    <Checkbox
                      checked={school.contacted ?? false}
                      onCheckedChange={() => handleToggleContacted(school)}
                      className="mt-1 border-emerald-500/50 data-[state=checked]:bg-emerald-600"
                      data-testid={`checkbox-school-${school.id}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-medium ${
                            school.contacted
                              ? "text-emerald-400 line-through"
                              : "text-white"
                          }`}
                        >
                          {school.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs border-white/20 text-white/60"
                        >
                          {school.district}
                        </Badge>
                        {school.priority && school.priority >= 4 && (
                          <Badge
                            variant="outline"
                            className="text-xs border-emerald-500/50 text-emerald-400"
                          >
                            High Priority
                          </Badge>
                        )}
                      </div>
                      {school.contactedDate && (
                        <div className="text-xs text-white/50 mt-1">
                          Contacted: {school.contactedDate}
                        </div>
                      )}
                      {school.notes && (
                        <div className="text-sm text-white/70 mt-1">
                          {school.notes}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      onClick={() => deleteSchoolMutation.mutate(school.id)}
                      data-testid={`button-delete-school-${school.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                {middleSchools.length === 0 && (
                  <div className="text-center py-4 text-white/40 text-sm">
                    No middle schools added yet
                  </div>
                )}
              </div>
            </div>

            {/* Add New School Section */}
            <div className="border-t border-white/10 pt-4">
              {!isAddingSchool ? (
                <Button
                  variant="outline"
                  className="w-full border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30 hover:text-emerald-300"
                  onClick={() => setIsAddingSchool(true)}
                  data-testid="button-add-school"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add School
                </Button>
              ) : (
                <div className="space-y-3 p-4 bg-black/30 border border-emerald-500/20 rounded-lg">
                  <h4 className="font-semibold text-emerald-400">
                    Add New School
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white/80">School Name</Label>
                      <Input
                        value={newSchool.name || ""}
                        onChange={(e) =>
                          setNewSchool({ ...newSchool, name: e.target.value })
                        }
                        placeholder="e.g., Lincoln High School"
                        className="bg-black/50 border-white/20 text-white"
                        data-testid="input-school-name"
                      />
                    </div>

                    <div>
                      <Label className="text-white/80">District</Label>
                      <Input
                        value={newSchool.district || ""}
                        onChange={(e) =>
                          setNewSchool({
                            ...newSchool,
                            district: e.target.value,
                          })
                        }
                        placeholder="e.g., Lincoln County"
                        className="bg-black/50 border-white/20 text-white"
                        data-testid="input-school-district"
                      />
                    </div>

                    <div>
                      <Label className="text-white/80">Type</Label>
                      <Select
                        value={newSchool.type}
                        onValueChange={(value: "middle" | "high") =>
                          setNewSchool({ ...newSchool, type: value })
                        }
                      >
                        <SelectTrigger className="bg-black/50 border-white/20 text-white" data-testid="select-school-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High School</SelectItem>
                          <SelectItem value="middle">Middle School</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-white/80">Priority (1-5)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={newSchool.priority || 3}
                        onChange={(e) =>
                          setNewSchool({
                            ...newSchool,
                            priority: parseInt(e.target.value),
                          })
                        }
                        className="bg-black/50 border-white/20 text-white"
                        data-testid="input-school-priority"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/80">Notes (Optional)</Label>
                    <Textarea
                      value={newSchool.notes || ""}
                      onChange={(e) =>
                        setNewSchool({ ...newSchool, notes: e.target.value })
                      }
                      placeholder="Any additional information..."
                      className="bg-black/50 border-white/20 text-white resize-none"
                      rows={2}
                      data-testid="textarea-school-notes"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleAddSchool}
                      disabled={
                        !newSchool.name ||
                        !newSchool.district ||
                        createSchoolMutation.isPending
                      }
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      data-testid="button-save-school"
                    >
                      {createSchoolMutation.isPending
                        ? "Adding..."
                        : "Add School"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddingSchool(false);
                        setNewSchool({
                          regionId,
                          type: "high",
                          contacted: false,
                          responseStatus: "pending",
                          priority: 3,
                        });
                      }}
                      className="border-white/20 text-white/80 hover:bg-white/10"
                      data-testid="button-cancel-add-school"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
