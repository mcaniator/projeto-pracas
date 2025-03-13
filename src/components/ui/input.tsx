import { cn } from "@/lib/cn";
import { VariantProps, cva } from "class-variance-authority";
import { InputHTMLAttributes, forwardRef } from "react";

const inputVariants = cva(
  "text-md flex h-10 rounded-xl border-2 bg-white/35 px-3 py-1 shadow-md [appearance:textfield] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  {
    variants: {
      variant: {
        gray: "bg-gray-400/50",
        white: "bg-white/35",
      },
      state: {
        neutral: "border-off-white/80 placeholder:text-gray-200",
        constructive: "border-sea-green/80",
        destructive: "border-cordovan/80",
      },
    },
    defaultVariants: {
      variant: "gray",
      state: "neutral",
    },
  },
);

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant, state, className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(inputVariants({ variant, state, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps };
