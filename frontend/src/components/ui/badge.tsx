import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground",
        outline: "border border-border text-foreground",
        success: "bg-success/15 text-success border border-success/20",
        warning: "bg-warning/15 text-warning border border-warning/20",
        accent: "bg-accent/15 text-accent border border-accent/20",
        muted: "bg-muted text-muted-foreground",
        veg: "bg-success/15 text-success border-2 border-success",
        nonveg: "bg-destructive/15 text-destructive border-2 border-destructive",
        table: "bg-primary text-primary-foreground font-semibold",
        pending: "bg-warning/15 text-warning border border-warning/30",
        preparing: "bg-accent/15 text-accent border border-accent/30",
        ready: "bg-success/15 text-success border border-success/30",
        served: "bg-muted text-muted-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
