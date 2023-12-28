import { cn } from "@/lib/cn";
import { VariantProps, cva } from "class-variance-authority";
import { InputHTMLAttributes, forwardRef } from "react";

const inputVariants = cva(
  "text-md flex h-10 w-full rounded-lg border-2 bg-gray-400/50 px-3 py-1 shadow-md [appearance:textfield] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  {
    variants: {
      variant: {
        neutral: "border-off-white/80",
        constructive: "border-sea-green/80",
        destructive: "border-cordovan/80",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  },
);

interface InputProps extends InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ variant, className, type, ...props }, ref) => {
  return <input type={type} className={cn(inputVariants({ variant, className }))} ref={ref} {...props} />;
});
Input.displayName = "Input";

export { Input };
export type { InputProps };
