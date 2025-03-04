
import { useEffect, useRef } from "react";
import { Goal, GoalDependency } from "@shared/schema";

type GoalNode = Goal & { dependencies?: number[]; dependents?: number[] };

interface GoalDependencyGraphProps {
  goal: Goal;
  dependencies: (GoalDependency & { dependsOnGoal: Goal })[];
  dependents: (GoalDependency & { goal: Goal })[];
}

export function GoalDependencyGraph({ goal, dependencies, dependents }: GoalDependencyGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Prepare data structure for the graph
  const nodes: GoalNode[] = [
    { ...goal, dependencies: dependencies.map(d => d.dependsOnGoalId), dependents: dependents.map(d => d.goalId) }
  ];
  
  // Add dependency nodes
  dependencies.forEach(dep => {
    if (!nodes.some(n => n.id === dep.dependsOnGoalId)) {
      nodes.push({
        ...dep.dependsOnGoal,
        dependents: [goal.id]
      });
    }
  });
  
  // Add dependent nodes
  dependents.forEach(dep => {
    if (!nodes.some(n => n.id === dep.goalId)) {
      nodes.push({
        ...dep.goal,
        dependencies: [goal.id]
      });
    }
  });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Calculate positions based on simple force-directed layout
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.7;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw the main goal in the center
    const positions: Record<number, { x: number; y: number }> = {};
    positions[goal.id] = { x: centerX, y: centerY };
    
    // Position dependencies on top half of circle
    const numDependencies = dependencies.length;
    dependencies.forEach((dep, i) => {
      const angle = Math.PI * (1 + i / (numDependencies || 1));
      positions[dep.dependsOnGoalId] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    // Position dependents on bottom half of circle
    const numDependents = dependents.length;
    dependents.forEach((dep, i) => {
      const angle = Math.PI * (2 + i / (numDependents || 1));
      positions[dep.goalId] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      };
    });
    
    // Draw connections (edges) first so they're behind the nodes
    ctx.lineWidth = 2;
    
    // Draw dependencies as incoming arrows
    dependencies.forEach(dep => {
      const fromPos = positions[dep.dependsOnGoalId];
      const toPos = positions[goal.id];
      
      // Calculate impact-based color (red for high impact, blue for low)
      const impactNormalized = dep.impact / 10;
      const r = Math.floor(200 * impactNormalized);
      const g = 100;
      const b = Math.floor(200 * (1 - impactNormalized));
      
      // Draw line
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();
      
      // Draw arrow
      const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
      const arrowSize = 10;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.moveTo(
        toPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
        toPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(toPos.x, toPos.y);
      ctx.lineTo(
        toPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
        toPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.fill();
      
      // Add impact label
      const labelX = (fromPos.x + toPos.x) / 2;
      const labelY = (fromPos.y + toPos.y) / 2;
      ctx.fillStyle = "black";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Impact: ${dep.impact}`, labelX, labelY - 5);
    });
    
    // Draw dependents as outgoing arrows
    dependents.forEach(dep => {
      const fromPos = positions[goal.id];
      const toPos = positions[dep.goalId];
      
      // Calculate impact-based color
      const impactNormalized = dep.impact / 10;
      const r = Math.floor(100);
      const g = Math.floor(100 + 100 * impactNormalized);
      const b = Math.floor(200);
      
      // Draw line
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.moveTo(fromPos.x, fromPos.y);
      ctx.lineTo(toPos.x, toPos.y);
      ctx.stroke();
      
      // Draw arrow
      const angle = Math.atan2(toPos.y - fromPos.y, toPos.x - fromPos.x);
      const arrowSize = 10;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.beginPath();
      ctx.moveTo(
        toPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
        toPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(toPos.x, toPos.y);
      ctx.lineTo(
        toPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
        toPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      ctx.fill();
      
      // Add impact label
      const labelX = (fromPos.x + toPos.x) / 2;
      const labelY = (fromPos.y + toPos.y) / 2;
      ctx.fillStyle = "black";
      ctx.font = "12px sans-serif";
      ctx.fillText(`Impact: ${dep.impact}`, labelX, labelY - 5);
    });
    
    // Draw nodes (circles with labels)
    Object.keys(positions).forEach(idStr => {
      const id = parseInt(idStr);
      const pos = positions[id];
      const currentNode = nodes.find(n => n.id === id);
      
      if (!currentNode) return;
      
      // Draw circle
      const isMainGoal = id === goal.id;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, isMainGoal ? 45 : 35, 0, 2 * Math.PI);
      ctx.fillStyle = isMainGoal ? "#a855f7" : "#6366f1";
      ctx.fill();
      
      // Draw progress
      const progress = currentNode.current / currentNode.target;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.arc(pos.x, pos.y, isMainGoal ? 45 : 35, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress);
      ctx.closePath();
      ctx.fillStyle = isMainGoal ? "#d8b4fe" : "#a5b4fc";
      ctx.fill();
      
      // Draw label
      ctx.fillStyle = "white";
      ctx.font = isMainGoal ? "bold 14px sans-serif" : "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Create multiline text - split on spaces to create lines that fit
      const words = currentNode.name.split(" ");
      let line = "";
      const lines = [];
      const maxLineWidth = isMainGoal ? 70 : 50;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && i > 0) {
          lines.push(line);
          line = words[i] + " ";
        } else {
          line = testLine;
        }
      }
      lines.push(line);
      
      // Draw multiline text
      const lineHeight = isMainGoal ? 18 : 14;
      const totalHeight = lineHeight * lines.length;
      let yStart = pos.y - totalHeight / 2 + lineHeight / 2;
      
      lines.forEach(textLine => {
        ctx.fillText(textLine, pos.x, yStart);
        yStart += lineHeight;
      });
      
      // Draw progress text below
      ctx.fillStyle = "white";
      ctx.font = "12px sans-serif";
      ctx.fillText(
        `${currentNode.current}/${currentNode.target}${currentNode.unit}`,
        pos.x,
        pos.y + (isMainGoal ? 30 : 22)
      );
    });
    
  }, [goal, dependencies, dependents]);
  
  return (
    <div className="flex justify-center py-8">
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={600} 
        className="border rounded-lg shadow-md"
      />
    </div>
  );
}
