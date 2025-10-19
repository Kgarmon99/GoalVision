import { Card, CardContent } from "@/components/ui/card";

export default function SchoolsPage() {
  return (
    <div className="min-h-screen cosmic-bg">
      <div className="border-b border-primary/30 bg-black/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-3xl font-bold text-white text-glow">KASS Regions Map</h1>
          <p className="text-sm text-gray-400 mt-1">Kentucky Association of School Superintendents</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <Card className="glow-card bg-black/80 border-primary/40">
          <CardContent className="p-6">
            <div className="relative w-full bg-white rounded-lg overflow-hidden">
              <img 
                src="/attached_assets/image_1760831992153.png" 
                alt="KASS Regions Map"
                className="w-full h-auto"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
