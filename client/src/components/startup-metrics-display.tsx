import { useQuery } from "@tanstack/react-query";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  Activity,
  Zap,
  PieChart
} from "lucide-react";

type StartupMetrics = {
  id: number;
  mrr: number;
  cac: number;
  ltv: number;
  churnRate: number;
  growthRate: number;
  activeUsers: number;
  conversionRate: number;
  burnRate: number;
  cashOnHand: number;
  totalRevenue: number;
  totalCosts: number;
  arr: number;
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
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toFixed(0);
  };

  const metricCards = [
    { 
      title: "MRR", 
      value: formatCurrency(safeMetrics.mrr), 
      icon: DollarSign,
      category: "REV",
      testId: "metric-mrr"
    },
    { 
      title: "ARR", 
      value: formatCurrency(safeMetrics.arr), 
      icon: TrendingUp,
      category: "REV",
      testId: "metric-arr"
    },
    { 
      title: "NET REV", 
      value: formatCurrency(safeMetrics.netRevenue), 
      icon: DollarSign,
      category: "REV",
      testId: "metric-net-revenue"
    },
    { 
      title: "MARGIN", 
      value: `${safeMetrics.grossMargin.toFixed(1)}%`, 
      icon: PieChart,
      category: "REV",
      testId: "metric-gross-margin"
    },
    { 
      title: "CAC", 
      value: formatCurrency(safeMetrics.cac), 
      icon: Target,
      category: "EFF",
      testId: "metric-cac"
    },
    { 
      title: "LTV", 
      value: formatCurrency(safeMetrics.ltv), 
      icon: TrendingUp,
      category: "EFF",
      testId: "metric-ltv"
    },
    { 
      title: "LTV:CAC", 
      value: `${safeMetrics.ltvCacRatio.toFixed(1)}x`, 
      icon: Activity,
      status: safeMetrics.ltvCacRatio >= 3 ? "good" : safeMetrics.ltvCacRatio >= 1 ? "warning" : "critical",
      category: "EFF",
      testId: "metric-ltv-cac-ratio"
    },
    { 
      title: "CONV", 
      value: `${safeMetrics.conversionRate.toFixed(1)}%`, 
      icon: TrendingUp,
      category: "EFF",
      testId: "metric-conversion-rate"
    },
    { 
      title: "CHURN", 
      value: `${safeMetrics.churnRate.toFixed(1)}%`, 
      icon: safeMetrics.churnRate > 5 ? TrendingDown : Activity,
      status: safeMetrics.churnRate <= 3 ? "good" : safeMetrics.churnRate <= 5 ? "warning" : "critical",
      category: "RET",
      testId: "metric-churn-rate"
    },
    { 
      title: "GROWTH", 
      value: `${safeMetrics.growthRate.toFixed(1)}%`, 
      icon: TrendingUp,
      status: safeMetrics.growthRate >= 10 ? "good" : safeMetrics.growthRate >= 5 ? "warning" : "critical",
      category: "RET",
      testId: "metric-growth-rate"
    },
    { 
      title: "USERS", 
      value: formatNumber(safeMetrics.activeUsers), 
      icon: Users,
      category: "RET",
      testId: "metric-active-users"
    },
    { 
      title: "BURN", 
      value: formatCurrency(safeMetrics.burnRate), 
      icon: Zap,
      category: "CASH",
      testId: "metric-burn-rate"
    },
    { 
      title: "CASH", 
      value: formatCurrency(safeMetrics.cashOnHand), 
      icon: DollarSign,
      category: "CASH",
      testId: "metric-cash-on-hand"
    },
    { 
      title: "RUNWAY", 
      value: `${safeMetrics.runway.toFixed(1)}mo`, 
      icon: Activity,
      status: safeMetrics.runway >= 12 ? "good" : safeMetrics.runway >= 6 ? "warning" : "critical",
      category: "CASH",
      testId: "metric-runway"
    },
  ];

  const getStatusClass = (status?: string) => {
    switch (status) {
      case "good":
        return "status-online";
      case "warning":
        return "status-warning";
      case "critical":
        return "status-critical";
      default:
        return "";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "REV":
        return "border-l-emerald-500";
      case "EFF":
        return "border-l-cyan-500";
      case "RET":
        return "border-l-violet-500";
      case "CASH":
        return "border-l-amber-500";
      default:
        return "border-l-primary";
    }
  };

  return (
    <div className="space-y-4">
      <div className="section-divider">
        <span className="section-title">System Telemetry</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div 
              key={metric.testId}
              className={`bg-black border border-primary/20 p-3 hover:border-primary/40 transition-all border-l-2 ${getCategoryColor(metric.category)}`}
              data-testid={metric.testId}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="data-label text-[9px]">{metric.title}</span>
                <Icon className="w-3 h-3 text-primary/40" />
              </div>
              <div className={`font-mono text-sm font-bold ${metric.status ? getStatusClass(metric.status) : 'text-white'}`}>
                {metric.value}
              </div>
              <div className="text-[8px] text-gray-600 mt-1 uppercase tracking-wider">
                {metric.category}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
