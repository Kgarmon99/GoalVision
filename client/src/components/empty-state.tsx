import { 
  AlertTriangle,
  BarChart4,
  PlusCircle,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "chart" | "warning";
  addLink?: string;
  addText?: string;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon = "warning",
  addLink,
  addText,
  className = "",
}: EmptyStateProps) {
  return (
    <Card className={`bg-gray-950 border border-gray-800 shadow-md ${className}`}>
      <CardHeader className="pb-2 pt-6">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-900 border border-gray-700 flex items-center justify-center">
          {icon === "warning" ? (
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
          ) : (
            <BarChart4 className="h-6 w-6 text-green-500" />
          )}
        </div>
        <CardTitle className="text-xl text-center text-white">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-center text-gray-400 pb-2">
        <p>{description}</p>
      </CardContent>
      {addLink && addText && (
        <CardFooter className="flex justify-center pb-6">
          <Link href={addLink}>
            <Button className="bg-green-600 hover:bg-green-700">
              <PlusCircle className="mr-2 h-4 w-4" /> {addText}
            </Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}

export function NoDataEmptyState() {
  return (
    <div className="py-16 px-4 w-full">
      <div className="max-w-xl mx-auto text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-900 border border-green-700 flex items-center justify-center">
          <BarChart4 className="h-8 w-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">No Data Found</h2>
        <p className="text-gray-400 mb-6">
          You've successfully reset your dashboard. Now it's time to add your own
          goals, metrics, and weekly tasks to start tracking your 2025 goals.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="bg-green-600 hover:bg-green-700">
            <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Goal
          </Button>
          <Button variant="outline" className="border-green-600 text-green-400">
            View Documentation <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}