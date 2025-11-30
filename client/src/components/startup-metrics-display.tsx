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
    { title: "MRR", value: formatCurrency(safeMetrics.mrr), code: "FIN-01", icon: DollarSign, sector: "ALPHA" },
    { title: "ARR", value: formatCurrency(safeMetrics.arr), code: "FIN-02", icon: TrendingUp, sector: "ALPHA" },
    { title: "NET REV", value: formatCurrency(safeMetrics.netRevenue), code: "FIN-03", icon: DollarSign, sector: "ALPHA" },
    { title: "MARGIN", value: `${safeMetrics.grossMargin.toFixed(1)}%`, code: "FIN-04", icon: PieChart, sector: "ALPHA" },
    { title: "CAC", value: formatCurrency(safeMetrics.cac), code: "EFF-01", icon: Target, sector: "BRAVO" },
    { title: "LTV", value: formatCurrency(safeMetrics.ltv), code: "EFF-02", icon: TrendingUp, sector: "BRAVO" },
    { 
      title: "LTV:CAC", 
      value: `${safeMetrics.ltvCacRatio.toFixed(1)}x`, 
      code: "EFF-03", 
      icon: Activity, 
      sector: "BRAVO",
      status: safeMetrics.ltvCacRatio >= 3 ? 'nominal' : safeMetrics.ltvCacRatio >= 1 ? 'caution' : 'critical'
    },
    { title: "CONV", value: `${safeMetrics.conversionRate.toFixed(1)}%`, code: "EFF-04", icon: TrendingUp, sector: "BRAVO" },
    { 
      title: "CHURN", 
      value: `${safeMetrics.churnRate.toFixed(1)}%`, 
      code: "RET-01", 
      icon: safeMetrics.churnRate > 5 ? TrendingDown : Activity, 
      sector: "CHARLIE",
      status: safeMetrics.churnRate <= 3 ? 'nominal' : safeMetrics.churnRate <= 5 ? 'caution' : 'critical'
    },
    { 
      title: "GROWTH", 
      value: `${safeMetrics.growthRate.toFixed(1)}%`, 
      code: "RET-02", 
      icon: TrendingUp, 
      sector: "CHARLIE",
      status: safeMetrics.growthRate >= 10 ? 'nominal' : safeMetrics.growthRate >= 5 ? 'caution' : 'critical'
    },
    { title: "USERS", value: formatNumber(safeMetrics.activeUsers), code: "RET-03", icon: Users, sector: "CHARLIE" },
    { title: "BURN", value: formatCurrency(safeMetrics.burnRate), code: "OPS-01", icon: Zap, sector: "DELTA", status: 'caution' },
    { title: "CASH", value: formatCurrency(safeMetrics.cashOnHand), code: "OPS-02", icon: DollarSign, sector: "DELTA" },
    { 
      title: "RUNWAY", 
      value: `${safeMetrics.runway.toFixed(1)}mo`, 
      code: "OPS-03", 
      icon: Activity, 
      sector: "DELTA",
      status: safeMetrics.runway >= 12 ? 'nominal' : safeMetrics.runway >= 6 ? 'caution' : 'critical'
    },
  ];

  const getStatusClass = (status?: string) => {
    switch (status) {
      case 'nominal': return 'text-primary';
      case 'caution': return 'text-yellow-500';
      case 'critical': return 'text-red-500 animate-pulse';
      default: return 'text-white';
    }
  };

  const getSectorColor = (sector: string) => {
    switch (sector) {
      case 'ALPHA': return 'border-l-emerald-500';
      case 'BRAVO': return 'border-l-cyan-500';
      case 'CHARLIE': return 'border-l-violet-500';
      case 'DELTA': return 'border-l-amber-500';
      default: return 'border-l-primary';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <span className="section-title">TELEMETRY FEED</span>
        </div>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/50 to-transparent" />
        <span className="classified-badge">LIVE DATA</span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div 
              key={metric.code}
              className={`bg-black border border-primary/20 hover:border-primary/50 transition-all border-l-2 ${getSectorColor(metric.sector)} relative group`}
              data-testid={`metric-${metric.title.toLowerCase().replace(/[:\s]/g, '-')}`}
            >
              <div className="absolute top-0 right-0 bg-primary/20 px-1.5 py-0.5">
                <span className="text-[8px] text-primary font-mono font-bold">{metric.code}</span>
              </div>
              <div className="p-3 pt-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="data-label text-[9px]">{metric.title}</span>
                  <Icon className="w-3 h-3 text-primary/30 group-hover:text-primary/60 transition-colors" />
                </div>
                <div className={`font-mono text-sm font-bold ${getStatusClass(metric.status)}`} style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  {metric.value}
                </div>
                <div className="text-[8px] text-gray-600 mt-1 uppercase tracking-widest font-mono">
                  {metric.sector}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
