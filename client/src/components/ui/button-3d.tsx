import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import "../ui/3d-effects.css";

const button3dVariants = cva(
  "button-3d inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      depth: {
        low: "button-3d-low",
        medium: "button-3d-medium",
        high: "button-3d-high",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      depth: "medium",
    },
  }
);

export interface Button3DProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button3dVariants> {
  asChild?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  glow?: boolean;
}

const Button3D = React.forwardRef<HTMLButtonElement, Button3DProps>(
  ({ className, variant, size, depth, asChild = false, iconLeft, iconRight, glow = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    const glowClass = glow ? "shadow-glow-sm hover:shadow-glow-md" : "";
    
    return (
      <Comp
        className={cn(button3dVariants({ variant, size, depth, className }), glowClass)}
        ref={ref}
        {...props}
      >
        {iconLeft && <span className="mr-2 icon-3d">{iconLeft}</span>}
        {children}
        {iconRight && <span className="ml-2 icon-3d">{iconRight}</span>}
      </Comp>
    );
  }
);

Button3D.displayName = "Button3D";

export { Button3D, button3dVariants };