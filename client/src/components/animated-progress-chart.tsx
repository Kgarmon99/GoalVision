import React, { useState, useEffect, useRef } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Scatter,
  Brush,
  ReferenceLine,
  Label,
  ReferenceArea,
  ZAxis,
  ScatterChart,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
} from 'recharts';
import { Goal, GoalStatus, ExecutionTask } from '@shared/schema';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { ParticleEffect } from './ui/particle-effect';
import { CursorEffect } from './ui/cursor-effect';
import { AnimatedComponent } from './ui/animated-component';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { 
  ChevronDown, 
  ChevronUp, 
  BarChart2, 
  PieChart as PieChartIcon, 
  TrendingUp,
  Activity,
  Target,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  Share2,
  Download,
  Bookmark,
  Flag,
  Eye,
  MessageCircle,
  Edit,
  Copy,
  ListFilter,
  Info
} from 'lucide-react';

// Chart types that user can toggle between
type ChartType = 'area' | 'bar' | 'pie' | 'line' | 'radial' | 'combo' | 'forecast' | 'radar' | 'heatmap' | 'multiaxis';

// Component to display a small preview of each chart type for selection
const ChartTypeSelector = ({ 
  activeType, 
  onChange 
}: { 
  activeType: ChartType; 
  onChange: (type: ChartType) => void 
}) => {
  // Chart options with icons
  const chartOptions: { type: ChartType; icon: React.ReactNode; label: string }[] = [
    { type: 'area', icon: <TrendingUp size={14} />, label: 'Area' },
    { type: 'bar', icon: <BarChart2 size={14} />, label: 'Bar' },
    { type: 'pie', icon: <PieChartIcon size={14} />, label: 'Pie' },
    { type: 'line', icon: <Activity size={14} />, label: 'Line' },
    { type: 'radial', icon: <Target size={14} />, label: 'Radial' },
    { type: 'combo', icon: <Zap size={14} />, label: 'Combo' },
    { type: 'forecast', icon: <ArrowUpRight size={14} />, label: 'Forecast' },
    { type: 'radar', icon: <Target size={14} />, label: 'Radar' },
    { type: 'heatmap', icon: <Activity size={14} />, label: 'Heatmap' },
    { type: 'multiaxis', icon: <ListFilter size={14} />, label: 'Multi-Axis' }
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4 justify-center">
      {chartOptions.map((option) => (
        <Button
          key={option.type}
          variant={activeType === option.type ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.type)}
          className="flex items-center gap-1.5"
        >
          {option.icon}
          <span>{option.label}</span>
        </Button>
      ))}
    </div>
  );
};

// Generate progress data points based on the current and target values
// This creates a more interesting visualization than just two data points
const generateProgressData = (goal: Goal, pointCount: number = 8) => {
  // Defensive validation to ensure goal is properly defined
  if (!goal) {
    return [
      { name: 'Start', value: 0, pv: 0, fullMark: 100 },
      { name: 'Current', value: 0, pv: 0, fullMark: 100 },
      { name: 'Target', value: 100, pv: 100, fullMark: 100 }
    ];
  }
  
  const { current, target, name } = goal;
  const result = [];
  
  // Use actual recorded data if available, otherwise use safe defaults
  const currentValue = typeof current === 'number' ? current : 0;
  const targetValue = typeof target === 'number' && target > 0 ? target : 100;
  
  // Create the first point (starting value, which may be 0 or some initial progress)
  let initialValue = 0;
  if (currentValue > targetValue * 0.15) {
    // If there's already significant progress, start from a smaller value
    initialValue = currentValue * 0.3;
  }
  
  result.push({
    name: 'Start',
    value: initialValue,
    pv: initialValue,
    fullMark: targetValue
  });
  
  // Generate intermediate points with some variation to make the chart interesting
  for (let i = 1; i < pointCount - 1; i++) {
    // Create a somewhat realistic progression curve
    let progress;
    if (i < pointCount / 2) {
      // Slower progress at the beginning
      progress = initialValue + (currentValue - initialValue) * (i / (pointCount - 1)) * 0.7;
    } else {
      // Faster progress later
      progress = initialValue + (currentValue - initialValue) * (i / (pointCount - 1)) * 1.2;
    }
    
    // Add some random variation (but ensure we don't exceed current value)
    const variation = Math.random() * 0.1 * currentValue;
    const value = Math.min(progress + variation, currentValue);
    
    result.push({
      name: `Point ${i}`,
      value,
      pv: value,
      fullMark: targetValue
    });
  }
  
  // The last point is the current actual value
  result.push({
    name: 'Current',
    value: currentValue,
    pv: currentValue,
    fullMark: targetValue
  });
  
  // Add the target as a reference point
  result.push({
    name: 'Target',
    value: targetValue,
    pv: targetValue,
    fullMark: targetValue
  });
  
  return result;
};

// Animation variants for the chart container
const chartContainerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { 
      duration: 0.3 
    }
  }
};

// Animation variants for chart elements
const chartElementVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      duration: 0.5
    }
  }
};

// Custom tooltip component for the charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background/90 backdrop-blur-sm border border-border p-2 rounded-md shadow-lg">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-primary">
          Value: {payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">
          Target: {payload[0].payload.fullMark.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

// The component that renders the appropriate chart based on the selected type
const GoalChart = ({ 
  data, 
  chartType, 
  goalName,
  goalUnit,
  goalColor = "hsl(150, 100%, 33%)" 
}: { 
  data: any[]; 
  chartType: ChartType;
  goalName: string;
  goalUnit?: string | null;
  goalColor?: string;
}) => {
  // Extract first and last data points for pie chart
  // Check if data array has sufficient elements before accessing
  const currentValue = data && data.length >= 2 ? data[data.length - 2].value : 0;
  const targetValue = data && data.length >= 1 ? data[data.length - 1].value : 100;
  const remainingValue = targetValue - currentValue;
  
  // Calculate progress percentage
  const progressPercentage = (currentValue / targetValue) * 100;
  
  // Pie chart data
  const pieData = [
    { name: 'Completed', value: currentValue, color: goalColor },
    { name: 'Remaining', value: remainingValue, color: '#1e293b' }
  ];
  
  // Radial chart data
  const radialData = [
    {
      name: 'Progress',
      uv: progressPercentage,
      fill: goalColor
    }
  ];

  // Colors for the charts
  const COLORS = [goalColor, '#1e293b', '#475569', '#94a3b8'];
  
  // Formatter for displaying values with units
  const valueFormatter = (value: number) => {
    if (goalUnit) {
      return `${value.toLocaleString()} ${goalUnit}`;
    }
    return value.toLocaleString();
  };

  // Render the appropriate chart based on the selected type
  switch (chartType) {
    case 'area':
      return (
        <motion.div 
          className="h-64 w-full" 
          variants={chartElementVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={goalColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={goalColor} stopOpacity={0.2}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis tickFormatter={valueFormatter} className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={goalColor} 
                fillOpacity={1} 
                fill="url(#colorValue)" 
                strokeWidth={2}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      );
      
    case 'bar':
      return (
        <motion.div 
          className="h-64 w-full" 
          variants={chartElementVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis tickFormatter={valueFormatter} className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill={goalColor} 
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      );
      
    case 'pie':
      return (
        <motion.div 
          className="h-64 w-full" 
          variants={chartElementVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={valueFormatter} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      );
      
    case 'line':
      return (
        <motion.div 
          className="h-64 w-full" 
          variants={chartElementVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis tickFormatter={valueFormatter} className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={goalColor} 
                strokeWidth={2}
                dot={{ fill: goalColor, r: 4 }}
                activeDot={{ r: 6, fill: goalColor }}
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      );
      
    case 'radial':
      return (
        <motion.div 
          className="h-64 w-full" 
          variants={chartElementVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="10%" 
              outerRadius="80%" 
              barSize={20} 
              data={radialData}
              startAngle={90} 
              endAngle={-270}
            >
              <RadialBar
                background
                dataKey="uv"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
                label={{ 
                  position: 'center', 
                  fill: '#fff', 
                  formatter: () => `${progressPercentage.toFixed(1)}%` 
                }}
              />
              <text 
                x="50%" 
                y="40%" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-xl font-bold"
                fill="#fff"
              >
                Progress
              </text>
              <text 
                x="50%" 
                y="70%" 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-xs"
                fill="#cbd5e1"
              >
                {valueFormatter(currentValue)} / {valueFormatter(targetValue)}
              </text>
            </RadialBarChart>
          </ResponsiveContainer>
        </motion.div>
      );
    
    case 'radar':
      // Radar data needs a different structure
      const radarData = [
        { subject: 'Start', A: data[0].value, fullMark: targetValue },
        { subject: 'Progress 1', A: data[1]?.value || currentValue * 0.2, fullMark: targetValue },
        { subject: 'Progress 2', A: data[2]?.value || currentValue * 0.4, fullMark: targetValue },
        { subject: 'Progress 3', A: data[3]?.value || currentValue * 0.6, fullMark: targetValue },
        { subject: 'Progress 4', A: data[4]?.value || currentValue * 0.8, fullMark: targetValue },
        { subject: 'Current', A: currentValue, fullMark: targetValue },
      ];
      
      return (
        <motion.div 
          className="h-64 w-full" 
          variants={chartElementVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart outerRadius={90} width={730} height={250} data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <PolarRadiusAxis angle={30} domain={[0, targetValue]} tickFormatter={valueFormatter} />
              <Radar name="Progress" dataKey="A" stroke={goalColor} fill={goalColor} fillOpacity={0.6} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      );
      
    case 'forecast':
      // Create forecast data extending beyond current progress
      // This simulates a prediction of future progress
      const forecastData = [...data];
      
      // Calculate estimated time to completion based on current progress
      const progressRate = currentValue / data.length;
      const estimatedPointsToCompletion = Math.ceil((targetValue - currentValue) / progressRate);
      
      // Add forecast points
      for (let i = 1; i <= 3; i++) {
        const forecastValue = Math.min(currentValue + (progressRate * 2 * i), targetValue);
        forecastData.push({
          name: `Forecast ${i}`,
          value: forecastValue,
          pv: forecastValue,
          fullMark: targetValue,
          isForecast: true
        });
      }
      
      return (
        <motion.div 
          className="h-64 w-full" 
          variants={chartElementVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={forecastData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis tickFormatter={valueFormatter} className="text-xs" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={targetValue} label="Target" stroke="red" strokeDasharray="3 3" />
              <Area 
                type="monotone" 
                dataKey="value" 
                name="Progress"
                stroke={goalColor} 
                fillOpacity={0.8} 
                strokeWidth={2}
                fill={"url(#colorValue)"}
                animationDuration={1500}
                animationEasing="ease-in-out"
              />
              <Line 
                type="monotone" 
                name="Forecast"
                dataKey="value" 
                stroke="#ff7300" 
                strokeDasharray="5 5"
                activeDot={{ r: 8 }}
                strokeWidth={2}
                dot={{ fill: "#ff7300", r: 4 }}
                connectNulls
                isAnimationActive={true}
                animationDuration={1800}
                animationEasing="ease-in-out"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      );
      
    case 'combo':
      return (
        <motion.div 
          className="h-64 w-full" 
          variants={chartElementVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis yAxisId="left" tickFormatter={valueFormatter} className="text-xs" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(value) => `${(value / targetValue * 100).toFixed(0)}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={targetValue} label="Target" stroke="red" strokeDasharray="3 3" />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="value" 
                name="Actual"
                stroke={goalColor} 
                fill={"url(#colorValue)"}
                fillOpacity={0.6}
              />
              <Bar 
                yAxisId="left"
                dataKey="value" 
                name="Progress" 
                barSize={20} 
                fill={goalColor}
                fillOpacity={0.8}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="pv" 
                name="Trending" 
                stroke="#ff7300"
                strokeWidth={2}
                dot={{ fill: "#ff7300", r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      );
    
    case 'heatmap':
      // Create heatmap data to visualize progress intensity
      const heatMapData = data.map((point, index) => ({
        name: point.name,
        value: point.value,
        intensity: point.value / targetValue * 100
      }));
      
      return (
        <motion.div 
          className="h-64 w-full" 
          variants={chartElementVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="name"
                name="Stage"
                className="text-xs"
              />
              <YAxis 
                dataKey="value" 
                name="Value" 
                tickFormatter={valueFormatter} 
                domain={[0, targetValue * 1.1]}
                className="text-xs"
              />
              <ZAxis
                dataKey="intensity"
                range={[20, 400]}
                name="Intensity"
              />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                content={<CustomTooltip />}
              />
              <Scatter name="Progress Intensity" data={heatMapData} fill={goalColor}>
                {heatMapData.map((entry, index) => {
                  // Calculate color based on intensity
                  const intensity = entry.intensity;
                  const hue = Math.max(120 - intensity, 0); // From green (120) to red (0)
                  const color = `hsl(${hue}, 100%, 50%)`;
                  
                  return <Cell key={`cell-${index}`} fill={color} />;
                })}
              </Scatter>
              <ReferenceLine y={targetValue} label="Target" stroke="red" strokeDasharray="3 3" />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      );
      
    case 'multiaxis':
      // Create multi-axis view to show multiple dimensions of the goal
      return (
        <motion.div 
          className="h-64 w-full" 
          variants={chartElementVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="name" className="text-xs" />
              <YAxis 
                yAxisId="left" 
                tickFormatter={valueFormatter} 
                className="text-xs"
                orientation="left"
                label={{ value: 'Progress', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickFormatter={(value) => `${(value / targetValue * 100).toFixed(0)}%`}
                className="text-xs"
                label={{ value: 'Completion %', angle: 90, position: 'insideRight' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <ReferenceLine y={targetValue} label="Target" stroke="red" strokeDasharray="3 3" />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="value"
                name="Value"
                stroke={goalColor}
                dot={{ fill: goalColor, r: 4 }}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
              <Bar
                yAxisId="right"
                dataKey="value"
                name="% of Target"
                barSize={10}
                fill="#8884d8"
                fillOpacity={0.6}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </motion.div>
      );
            
    default:
      return <div>Select a chart type</div>;
  }
};

// Main component that renders the animated goal progress chart with controls
export function AnimatedProgressChart({ 
  goal,
  className = '',
  showControls = true,
  enableParticles = true,
  defaultChartType = 'area'
}: { 
  goal: Goal;
  className?: string;
  showControls?: boolean;
  enableParticles?: boolean;
  defaultChartType?: ChartType;
}) {
  // State for current chart type
  const [chartType, setChartType] = useState<ChartType>(defaultChartType);
  // State for expanded view
  const [expanded, setExpanded] = useState(false);
  // State for data (we'll animate this in)
  const [data, setData] = useState<any[]>([]);
  // State to control particle effect
  const [showParticles, setShowParticles] = useState(false);

  // Calculate progress percentage
  const progressPercentage = goal.target ? (goal.current || 0) / goal.target * 100 : 0;
  const isComplete = progressPercentage >= 100;
  
  // Generate progress data on initial render
  useEffect(() => {
    // Ensure we have a valid goal object to avoid errors
    if (goal) {
      try {
        const progressData = generateProgressData(goal);
        setData(progressData || []);
      } catch (error) {
        console.error('Error generating progress data:', error);
        // Provide default data if generation fails
        setData([
          { name: 'Start', value: 0, pv: 0, fullMark: 100 },
          { name: 'Current', value: goal.current || 0, pv: goal.current || 0, fullMark: goal.target || 100 },
          { name: 'Target', value: goal.target || 100, pv: goal.target || 100, fullMark: goal.target || 100 }
        ]);
      }
    }
  }, [goal]);
  
  // Show particles when progress is good
  useEffect(() => {
    if (enableParticles && progressPercentage >= 75) {
      const timer = setTimeout(() => {
        setShowParticles(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [progressPercentage, enableParticles]);

  return (
    <Card className={`overflow-hidden bg-gradient-to-br from-gray-950 to-gray-900 shadow-lg border-gray-800 ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              {goal.name}
              {isComplete && (
                <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                  Completed
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-gray-400">
              Progress: {progressPercentage.toFixed(1)}%
            </CardDescription>
          </div>
          
          {showControls && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setExpanded(!expanded)}
              className="text-white hover:bg-gray-800"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {enableParticles && showParticles && (
          <div className="absolute inset-0 pointer-events-none">
            <ParticleEffect 
              type="sparkles"
              count={20}
              colors={['#10b981', '#d4d4d8', '#22d3ee']}
              areaWidth={undefined}
              areaHeight={undefined}
              particleSize={[3, 6]}
              speed={1}
              gravity={0.1}
            />
          </div>
        )}
        
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={chartType}
              variants={chartContainerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="relative"
            >
              {/* Current vs Target Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-400">Current</div>
                  <div className="text-lg font-semibold text-white">
                    {goal.current?.toLocaleString() || 0}{goal.unit ? ` ${goal.unit}` : ''}
                  </div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg">
                  <div className="text-xs text-gray-400">Target</div>
                  <div className="text-lg font-semibold text-white">
                    {goal.target?.toLocaleString() || 0}{goal.unit ? ` ${goal.unit}` : ''}
                  </div>
                </div>
              </div>
              
              {/* Chart Type Selector - Only show when expanded */}
              {expanded && showControls && (
                <ChartTypeSelector activeType={chartType} onChange={setChartType} />
              )}
              
              {/* The actual chart */}
              <AnimatedComponent
                animation="fadeIn"
                duration={0.7}
                delay={0.2}
              >
                <GoalChart 
                  data={data} 
                  chartType={chartType} 
                  goalName={goal.name}
                  goalUnit={goal.unit}
                  goalColor={goal.color || undefined}
                />
              </AnimatedComponent>
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}