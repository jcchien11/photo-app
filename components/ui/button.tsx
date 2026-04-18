import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-sans tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-warm-400 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-neutral-900 text-white hover:bg-neutral-700",
        outline:
          "border border-neutral-300 bg-transparent text-neutral-800 hover:bg-neutral-50 hover:border-neutral-400",
        ghost:
          "bg-transparent text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        secondary:
          "bg-neutral-100 text-neutral-800 hover:bg-neutral-200",
        link:
          "text-neutral-800 underline-offset-4 hover:underline p-0 h-auto",
        warm:
          "bg-warm-400 text-white hover:bg-warm-500",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-7 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
        "icon-sm": "h-7 w-7",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
