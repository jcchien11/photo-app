import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center text-xs font-sans tracking-widest uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "bg-neutral-900 text-white px-2.5 py-0.5",
        outline: "border border-neutral-300 text-neutral-600 px-2.5 py-0.5",
        warm: "bg-warm-100 text-warm-700 px-2.5 py-0.5",
        ghost: "text-neutral-500 px-0",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
