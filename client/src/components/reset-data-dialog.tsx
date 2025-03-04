import { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { RefreshCw, AlertCircle } from "lucide-react";

export function ResetDataDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  const handleResetData = async () => {
    setIsResetting(true);
    
    try {
      await fetch("/api/reset-data", {
        method: "POST",
      });
      
      toast({
        title: "Data reset successful",
        description: "All sample data has been cleared from the database.",
        variant: "default",
      });
      
      // Close dialog after successful reset
      setOpen(false);
      
      // Reload the page to reflect changes
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error resetting data",
        description: "There was a problem clearing the sample data.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-red-500 text-red-500 hover:bg-gray-800">
          Reset & Add Your Own Data
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl bg-gray-950 text-white border-green-600">
        <DialogHeader>
          <DialogTitle className="text-xl text-green-400">Reset Sample Data & Add Your Own</DialogTitle>
          <DialogDescription className="text-gray-300">
            Clear the sample data and learn how to add your real 2025 goals
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="reset" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="reset">Reset Data</TabsTrigger>
            <TabsTrigger value="add">Adding Your Own Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reset" className="p-4 border border-gray-800 rounded-md">
            <Alert className="mb-4 bg-red-950 border-red-600">
              <AlertCircle className="h-4 w-4 text-red-400 mr-2" />
              <AlertDescription className="text-red-200">
                This will permanently delete all sample data from your database. This action cannot be undone.
              </AlertDescription>
            </Alert>
            
            <p className="mb-4 text-gray-300">
              Resetting the data will give you a clean slate to start tracking your real 2025 goals.
              After resetting, you can follow the instructions in the "Adding Your Own Data" tab.
            </p>
            
            <Button
              variant="destructive"
              onClick={handleResetData}
              disabled={isResetting}
              className="w-full"
            >
              {isResetting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Resetting Data...
                </>
              ) : (
                "Reset All Sample Data"
              )}
            </Button>
          </TabsContent>
          
          <TabsContent value="add" className="space-y-4 p-4 border border-gray-800 rounded-md">
            <div>
              <h3 className="text-green-400 text-lg font-medium mb-2">How to Add Your Own Goals</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Use the <strong>POST /api/goals</strong> endpoint to create a new goal</li>
                <li>Required fields: <code className="bg-gray-800 px-1 rounded">name</code>, <code className="bg-gray-800 px-1 rounded">current</code>, <code className="bg-gray-800 px-1 rounded">target</code>, <code className="bg-gray-800 px-1 rounded">unit</code>, <code className="bg-gray-800 px-1 rounded">color</code></li>
                <li>Example: <code className="bg-gray-800 p-1 rounded text-xs block my-2">
                  {`fetch('/api/goals', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Revenue", 
    current: 2.5, 
    target: 10, 
    unit: "M", 
    color: "green"
  })
})`}
                </code></li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-green-400 text-lg font-medium mb-2">How to Add Metrics</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-300">
                <li>Use the <strong>POST /api/metrics</strong> endpoint to create a new metric</li>
                <li>Required fields: <code className="bg-gray-800 px-1 rounded">name</code>, <code className="bg-gray-800 px-1 rounded">value</code>, <code className="bg-gray-800 px-1 rounded">category</code></li>
                <li>Optional fields: <code className="bg-gray-800 px-1 rounded">previousValue</code>, <code className="bg-gray-800 px-1 rounded">trend</code>, <code className="bg-gray-800 px-1 rounded">trendDirection</code></li>
                <li>Example: <code className="bg-gray-800 p-1 rounded text-xs block my-2">
                  {`fetch('/api/metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Monthly Active Users", 
    value: "15M", 
    previousValue: "13.8M",
    trend: 8.7,
    trendDirection: "up",
    category: "growth"
  })
})`}
                </code></li>
              </ol>
            </div>
            
            <div>
              <h3 className="text-green-400 text-lg font-medium mb-2">Adding Weekly Tasks</h3>
              <p className="text-gray-300 mb-2">First, create a week, then add tasks for that week:</p>
              
              <h4 className="text-white font-medium mt-4 mb-2">1. Create a Week</h4>
              <code className="bg-gray-800 p-1 rounded text-xs block my-2">
                {`fetch('/api/weeks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    number: 25,
    dateRange: "June 17 - 23, 2024",
    completionRate: 0
  })
})`}
              </code>
              
              <h4 className="text-white font-medium mt-4 mb-2">2. Add Tasks for the Week</h4>
              <code className="bg-gray-800 p-1 rounded text-xs block my-2">
                {`fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    task: "Schedule investor meetings", 
    owner: "Sarah Thompson",
    ownerAvatar: null,
    goalCategory: "Funding",
    categoryColor: "blue",
    dueDate: "June 20, 2024",
    status: "pending",
    weekId: 1 // use the ID of the week you created
  })
})`}
              </code>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}