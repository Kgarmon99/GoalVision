import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function Empty({
  icon,
  title,
  description,
  action,
  className,
}: EmptyProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center text-center p-8 rounded-lg border border-dashed border-muted-foreground/30 bg-background/60 backdrop-blur-sm",
      className
    )}>
      {icon && (
        <div className="mb-4 text-muted-foreground">
          {icon}
        </div>
      )}
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      )}
      {action && (
        <div className="mt-2">{action}</div>
      )}
    </div>
  );
}