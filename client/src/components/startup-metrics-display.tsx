import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users,
  Target,
  Zap,
  Activity,
  PieChart
} from "lucide-react";

type StartupMetrics = {
  mrr: number;
  arr: number;
  cac: number;
  ltv: number;
  churnRate: number;
  growthRate: number;
  activeUsers: number;
  conversionRate: number;
  burnRate: number;
  cashOnHand: number;
  runway: number;
  grossMargin: number;
  netRevenue: number;
  ltvCacRatio: number;
};

export function StartupMetricsDisplay() {
  const { data: metrics, isLoading } = useQuery<StartupMetrics>({
    queryKey: ['/api/startup-metrics'],
  });

  if (isLoading || !metrics) {
    return null;
  }

  // Ensure all numeric values have defaults
  const safeMetrics = {
    mrr: metrics.mrr ?? 0,
    arr: metrics.arr ?? 0,
    cac: metrics.cac ?? 0,
    ltv: metrics.ltv ?? 0,
    churnRate: metrics.churnRate ?? 0,
    growthRate: metrics.growthRate ?? 0,
    activeUsers: metrics.activeUsers ?? 0,
    conversionRate: metrics.conversionRate ?? 0,
    burnRate: metrics.burnRate ?? 0,
    cashOnHand: metrics.cashOnHand ?? 0,
    runway: metrics.runway ?? 0,
    grossMargin: metrics.grossMargin ?? 0,
    netRevenue: metrics.netRevenue ?? 0,
    ltvCacRatio: metrics.ltvCacRatio ?? 0,
  };

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value.toFixed(0)}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toFixed(0);
  };

  const metricCards = [
    // Revenue Metrics
    { 
      title: "MRR", 
      value: formatCurrency(safeMetrics.mrr), 
      icon: DollarSign,
      category: "Revenue",
      testId: "metric-mrr"
    },
    { 
      title: "ARR", 
      value: formatCurrency(safeMetrics.arr), 
      icon: TrendingUp,
      category: "Revenue",
      testId: "metric-arr"
    },
    { 
      title: "Net Revenue", 
      value: formatCurrency(safeMetrics.netRevenue), 
      icon: DollarSign,
      category: "Revenue",
      testId: "metric-net-revenue"
    },
    { 
      title: "Gross Margin", 
      value: `${safeMetrics.grossMargin.toFixed(1)}%`, 
      icon: PieChart,
      category: "Revenue",
      testId: "metric-gross-margin"
    },
    
    // Efficiency Metrics
    { 
      title: "CAC", 
      value: formatCurrency(safeMetrics.cac), 
      icon: Target,
      category: "Efficiency",
      testId: "metric-cac"
    },
    { 
      title: "LTV", 
      value: formatCurrency(safeMetrics.ltv), 
      icon: TrendingUp,
      category: "Efficiency",
      testId: "metric-ltv"
    },
    { 
      title: "LTV:CAC Ratio", 
      value: `${safeMetrics.ltvCacRatio.toFixed(1)}x`, 
      icon: Activity,
      status: safeMetrics.ltvCacRatio >= 3 ? "good" : safeMetrics.ltvCacRatio >= 1 ? "warning" : "danger",
      category: "Efficiency",
      testId: "metric-ltv-cac-ratio"
    },
    { 
      title: "Conversion Rate", 
      value: `${safeMetrics.conversionRate.toFixed(1)}%`, 
      icon: TrendingUp,
      category: "Efficiency",
      testId: "metric-conversion-rate"
    },
    
    // Retention & Growth
    { 
      title: "Churn Rate", 
      value: `${safeMetrics.churnRate.toFixed(1)}%`, 
      icon: safeMetrics.churnRate > 5 ? TrendingDown : Activity,
      status: safeMetrics.churnRate <= 3 ? "good" : safeMetrics.churnRate <= 5 ? "warning" : "danger",
      category: "Retention",
      testId: "metric-churn-rate"
    },
    { 
      title: "Growth Rate", 
      value: `${safeMetrics.growthRate.toFixed(1)}%`, 
      icon: TrendingUp,
      category: "Retention",
      testId: "metric-growth-rate"
    },
    { 
      title: "Active Users", 
      value: formatNumber(safeMetrics.activeUsers), 
      icon: Users,
      category: "Retention",
      testId: "metric-active-users"
    },
    
    // Cash & Burn
    { 
      title: "Monthly Burn", 
      value: formatCurrency(safeMetrics.burnRate), 
      icon: Zap,
      category: "Cash",
      testId: "metric-burn-rate"
    },
    { 
      title: "Cash on Hand", 
      value: formatCurrency(safeMetrics.cashOnHand), 
      icon: DollarSign,
      category: "Cash",
      testId: "metric-cash-on-hand"
    },
    { 
      title: "Runway", 
      value: `${safeMetrics.runway.toFixed(1)}mo`, 
      icon: Activity,
      status: safeMetrics.runway >= 12 ? "good" : safeMetrics.runway >= 6 ? "warning" : "danger",
      category: "Cash",
      testId: "metric-runway"
    },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "good":
        return "text-primary";
      case "warning":
        return "text-yellow-400";
      case "danger":
        return "text-red-400";
      default:
        return "text-white";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white text-glow">Startup Metrics</h2>
      </div>

      {/* Revenue Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wide mb-3">Revenue</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.filter(m => m.category === "Revenue").map((metric) => {
            const Icon = metric.icon;
            return (
              <Card 
                key={metric.title} 
                className="glass-card chromatic-edge liquid-ripple"
                data-testid={`card-${metric.testId}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary/80 uppercase tracking-wide font-semibold">
                        {metric.title}
                      </p>
                      <p 
                        className={`text-2xl font-bold text-glow-sm mt-1 ${getStatusColor(metric.status)}`}
                        data-testid={`value-${metric.testId}`}
                      >
                        {metric.value}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-primary drop-shadow-glow" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div>
        <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wide mb-3">Efficiency</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.filter(m => m.category === "Efficiency").map((metric) => {
            const Icon = metric.icon;
            return (
              <Card 
                key={metric.title} 
                className="glass-card chromatic-edge liquid-ripple"
                data-testid={`card-${metric.testId}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary/80 uppercase tracking-wide font-semibold">
                        {metric.title}
                      </p>
                      <p 
                        className={`text-2xl font-bold text-glow-sm mt-1 ${getStatusColor(metric.status)}`}
                        data-testid={`value-${metric.testId}`}
                      >
                        {metric.value}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-primary drop-shadow-glow" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Retention & Growth */}
      <div>
        <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wide mb-3">Retention & Growth</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metricCards.filter(m => m.category === "Retention").map((metric) => {
            const Icon = metric.icon;
            return (
              <Card 
                key={metric.title} 
                className="glass-card chromatic-edge liquid-ripple"
                data-testid={`card-${metric.testId}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary/80 uppercase tracking-wide font-semibold">
                        {metric.title}
                      </p>
                      <p 
                        className={`text-2xl font-bold text-glow-sm mt-1 ${getStatusColor(metric.status)}`}
                        data-testid={`value-${metric.testId}`}
                      >
                        {metric.value}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-primary drop-shadow-glow" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cash & Burn */}
      <div>
        <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wide mb-3">Cash & Burn</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricCards.filter(m => m.category === "Cash").map((metric) => {
            const Icon = metric.icon;
            return (
              <Card 
                key={metric.title} 
                className="glass-card chromatic-edge liquid-ripple"
                data-testid={`card-${metric.testId}`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-primary/80 uppercase tracking-wide font-semibold">
                        {metric.title}
                      </p>
                      <p 
                        className={`text-2xl font-bold text-glow-sm mt-1 ${getStatusColor(metric.status)}`}
                        data-testid={`value-${metric.testId}`}
                      >
                        {metric.value}
                      </p>
                    </div>
                    <Icon className="h-8 w-8 text-primary drop-shadow-glow" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
