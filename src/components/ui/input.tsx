import { cn } from "@/lib/cn";
import { VariantProps, cva } from "class-variance-authority";
import { InputHTMLAttributes, forwardRef } from "react";

import styles from "./Input.module.css";

const inputVariants = cva(
  "text-md flex h-10 rounded-xl border-2 bg-white/35 px-3 py-1 [appearance:textfield] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  {
    variants: {
      variant: {
        gray: "bg-gray-400/50",
        white: "bg-white/35",
      },
      state: {
        neutral:
          "border-gray-800 placeholder:text-gray-600 focus-visible:border-brand focus-visible:outline focus-visible:outline-1 focus-visible:outline-brand",
        constructive: "border-sea-green/80",
        destructive: "border-cordovan/80",
      },
    },
    defaultVariants: {
      variant: "white",
      state: "neutral",
    },
  },
);

interface InputProps
  extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  label?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ variant, state, className, type, label, ...props }, ref) => {
    return (
      <div className="flex w-full flex-col">
        <span className="ml-2">{label}</span>
        <input
          type={type}
          className={cn(
            inputVariants({ variant, state, className }),
            styles.input,
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps };
