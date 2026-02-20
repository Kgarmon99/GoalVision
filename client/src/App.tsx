import React from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { Loader2, BarChart3, Map, PlusCircle } from "lucide-react";
import { Route, Switch, Link, useLocation } from "wouter";
import { PersonalDashboardProvider, usePersonalDashboard } from "@/context/personal-dashboard-context";

const WelcomeCreateDashboard = lazy(() => import("@/pages/welcome-create-dashboard"));
const PersonalDashboardPage = lazy(() => import("@/pages/personal-dashboard-page"));
const SchoolsPage = lazy(() => import("@/pages/schools-page"));

function NavLink({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  const [location] = useLocation();
  const active = href === "/" ? location === "/" : location === href;
  return (
    <Link href={href} className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] py-2 ${active ? "text-primary" : "text-primary/80"}`}>
      <Icon className="h-6 w-6" />
      <span className="text-[10px] font-mono uppercase">{label}</span>
    </Link>
  );
}

function MobileShell({ children }: { children: React.ReactNode }) {
  const [, setLocation] = useLocation();
  const { hasDashboard, setDashboard } = usePersonalDashboard();

  const handleNewDashboard = () => {
    if (hasDashboard && confirm("Create a new dashboard? This will replace your current one.")) {
      setDashboard(null);
      setLocation("/create");
    } else if (!hasDashboard) {
      setLocation("/create");
    }
  };

  return (
    <div className="flex flex-col h-screen safe-area-padding bg-black">
      <main className="flex-1 overflow-hidden min-h-0">{children}</main>
      <nav className="flex-shrink-0 border-t border-primary/20 bg-black/95 safe-area-bottom">
        <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
          <NavLink href="/" icon={BarChart3} label="Dashboard" />
          <NavLink href="/roadmap" icon={Map} label="Roadmap" />
          <button
            type="button"
            onClick={handleNewDashboard}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[72px] py-2 text-primary/80 hover:text-primary"
          >
            <PlusCircle className="h-6 w-6" />
            <span className="text-[10px] font-mono uppercase">New</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

function DashboardWithTab({ tab }: { tab: "overview" | "roadmap" }) {
  return <PersonalDashboardPage defaultTab={tab} />;
}

function AppRoutes() {
  const { hasDashboard } = usePersonalDashboard();
  const [location] = useLocation();

  if (!hasDashboard) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <Switch>
          <Route path="/create" component={WelcomeCreateDashboard} />
          <Route path="/schools" component={SchoolsPage} />
          <Route path="/:rest*">
            <Redirect to="/create" />
          </Route>
        </Switch>
      </Suspense>
    );
  }

  return (
    <MobileShell>
      <Suspense fallback={<LoadingScreen />}>
        <Switch>
          <Route path="/" component={() => <DashboardWithTab tab="overview" />} />
          <Route path="/roadmap" component={() => <DashboardWithTab tab="roadmap" />} />
          <Route path="/create" component={WelcomeCreateDashboard} />
          <Route path="/schools" component={SchoolsPage} />
          <Route path="/:rest*">
            <Redirect to="/" />
          </Route>
        </Switch>
      </Suspense>
    </MobileShell>
  );
}

function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  React.useEffect(() => { setLocation(to); }, [to, setLocation]);
  return <LoadingScreen />;
}

function LoadingScreen() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-black">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PersonalDashboardProvider>
        <AppRoutes />
        <Toaster />
      </PersonalDashboardProvider>
    </QueryClientProvider>
  );
}

export default App;
