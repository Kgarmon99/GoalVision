import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { Route, Switch, Link } from "wouter";
import { Map, BarChart3 } from "lucide-react";
import moneybotLogo from "./assets/moneybot-logo.png";

const Dashboard = lazy(() => import("@/pages/simple-dashboard"));
const SchoolsPage = lazy(() => import("@/pages/schools-page"));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Navigation Bar */}
      <div className="border-b border-primary/30 bg-black/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img 
                src={moneybotLogo} 
                alt="Moneybot" 
                className="h-10 w-10 rounded-full drop-shadow-glow" 
                style={{
                  boxShadow: '0 0 20px rgba(74, 222, 128, 0.6), 0 0 40px rgba(74, 222, 128, 0.4), 0 0 60px rgba(16, 185, 129, 0.2)'
                }}
              />
              <span className="text-xl font-bold text-primary text-glow">Moneybot Dashboard</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors">
                <BarChart3 className="h-5 w-5" />
                <span className="font-semibold">Dashboard</span>
              </Link>
              <Link href="/schools" className="flex items-center gap-2 text-white hover:text-primary transition-colors">
                <Map className="h-5 w-5" />
                <span className="font-semibold">Schools Map</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Suspense fallback={
        <div className="h-screen w-full flex items-center justify-center bg-gray-950">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      }>
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/schools" component={SchoolsPage} />
        </Switch>
      </Suspense>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;