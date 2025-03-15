import { Goal, Metric } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart,
  ResponsiveContainer,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  Legend
} from "recharts";
import { useMemo } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface SimpleMetricsDashboardProps {
  goals: Goal[];
  metrics: Metric[];
}

export function SimpleMetricsDashboard({ goals, metrics }: SimpleMetricsDashboardProps) {
  // Create simplified goal progress data for the chart
  const goalProgressData = useMemo(() => {
    return goals.map(goal => ({
      name: goal.name.length > 15 ? `${goal.name.substring(0, 15)}...` : goal.name,
      current: goal.current,
      target: goal.target,
      progress: Math.min(Math.round((goal.current / goal.target) * 100), 100)
    }));
  }, [goals]);

  // Calculate metrics summaries by category
  const metricSummaries = useMemo(() => {
    const summaries: Record<string, { total: number, count: number, avg: number }> = {};
    
    metrics.forEach(metric => {
      if (!summaries[metric.category]) {
        summaries[metric.category] = { total: 0, count: 0, avg: 0 };
      }
      
      summaries[metric.category].total += Number(metric.value);
      summaries[metric.category].count += 1;
    });
    
    // Calculate averages
    Object.keys(summaries).forEach(category => {
      summaries[category].avg = Math.round(summaries[category].total / summaries[category].count);
    });
    
    return summaries;
  }, [metrics]);
  
  return (
    <div className="space-y-6">
      {/* Goal Progress Chart - Simple bar chart */}
      {goals.length > 0 && (
        <Card className="bg-card border">
          <CardContent className="p-4 pt-6">
            <h3 className="text-lg font-semibold mb-4">Goal Progress</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={goalProgressData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'var(--muted-foreground)' }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fill: 'var(--muted-foreground)' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--foreground)'
                  }} 
                />
                <Legend />
                <Bar 
                  dataKey="current" 
                  name="Current" 
                  fill="var(--primary)" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="target" 
                  name="Target" 
                  fill="var(--muted)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
      
      {/* Metrics Summary Cards */}
      {Object.keys(metricSummaries).length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 capitalize">Key Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(metricSummaries).map(([category, data]) => (
              <Card key={category} className="bg-card border">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground capitalize">{category}</p>
                  <div className="flex items-baseline mt-1">
                    <h3 className="text-2xl font-bold">
                      {category === 'revenue' ? '$' : ''}{data.avg.toLocaleString()}
                    </h3>
                    <span className="text-xs ml-2 font-medium">
                      {category === 'revenue' ? 'avg. value' : 'avg. score'}
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-3 text-xs">
                    {data.avg > 50 ? (
                      <div className="flex items-center text-green-500">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        <span>Good standing</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-amber-500">
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                        <span>Needs improvement</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}