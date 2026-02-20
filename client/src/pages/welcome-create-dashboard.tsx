import { useState } from "react";
import { useLocation } from "wouter";
import { Target, Map, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDashboardFromTemplate, createEmptyDashboard } from "@/types/personal-dashboard";
import { usePersonalDashboard } from "@/context/personal-dashboard-context";

export default function WelcomeCreateDashboard() {
  const { setDashboard } = usePersonalDashboard();
  const [, setLocation] = useLocation();
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreateFromTemplate = () => {
    const dash = createDashboardFromTemplate(name.trim() || "My Dashboard");
    setDashboard(dash);
    setCreating(true);
    setLocation("/");
  };

  const handleCreateEmpty = () => {
    const dash = createEmptyDashboard(name.trim() || "My Dashboard");
    setDashboard(dash);
    setCreating(true);
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-black tactical-grid flex flex-col items-center justify-center p-6 safe-area-padding">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 border-2 border-primary/50 rounded-xl mb-4">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: 'Orbitron, sans-serif' }}>
            iDash
          </h1>
          <p className="text-sm text-gray-400 font-mono">
            Your personal dashboard & roadmap. Create one and start tracking.
          </p>
        </div>

        <div className="space-y-4">
          <Label className="text-xs text-gray-500 font-mono uppercase tracking-wider">Dashboard name</Label>
          <Input
            placeholder="My Dashboard"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/60 border-primary/30 text-white font-mono placeholder:text-gray-600"
            autoFocus
          />
        </div>

        <div className="grid gap-3">
          <Button
            onClick={handleCreateFromTemplate}
            disabled={creating}
            className="w-full bg-primary hover:bg-primary/90 text-black font-mono h-12"
          >
            <Rocket className="w-4 h-4 mr-2" />
            Start from template
          </Button>
          <Button
            onClick={handleCreateEmpty}
            disabled={creating}
            variant="outline"
            className="w-full border-primary/40 text-primary hover:bg-primary/10 font-mono h-12"
          >
            <Map className="w-4 h-4 mr-2" />
            Start empty
          </Button>
        </div>

        <p className="text-[10px] text-gray-600 font-mono text-center">
          You can add metrics and roadmap items anytime from your dashboard.
        </p>
      </div>
    </div>
  );
}
