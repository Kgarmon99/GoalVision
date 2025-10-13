import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";

const Dashboard = lazy(() => import("@/pages/simple-dashboard"));

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={
        <div className="h-screen w-full flex items-center justify-center bg-gray-950">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      }>
        <Dashboard />
      </Suspense>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;