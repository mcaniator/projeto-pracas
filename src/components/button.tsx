"use client";

import { cn } from "@/lib/cn";
import { VariantProps, cva } from "class-variance-authority";
import { AriaButtonProps } from "react-aria";
import { Button as ButtonPrimitive } from "react-aria-components";

type ButtonVariant =
  | "default"
  | "admin"
  | "constructive"
  | "destructive"
  | "outline"
  | "secondary";

const buttonVariants = cva(
  "group inline-flex items-center justify-center rounded-lg text-lg font-medium shadow outline-none transition-all data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring disabled:pointer-events-none disabled:select-none",
  {
    variants: {
      variant: {
        default:
          "bg-sky-500/70 text-white bg-blend-darken data-[hovered]:bg-sky-900 disabled:bg-sky-900",
        admin:
          "bg-purpureus text-white data-[hovered]:bg-eminence disabled:bg-eminence",
        constructive:
          "bg-green-500/90 text-white data-[hovered]:bg-green-700/90 disabled:bg-green-700/90",
        destructive:
          "bg-redwood text-white data-[hovered]:bg-cordovan disabled:bg-cordovan",
        outline:
          "border border-input bg-transparent text-white data-[hovered]:bg-accent data-[hovered]:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm data-[hovered]:bg-secondary/80",
        ghost: "bg-transparent shadow-none data-[hovered]:bg-transparent/10",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
      use: {
        default: "cursor-default",
        link: "cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      use: "default",
    },
  },
);

interface ButtonProps
  extends AriaButtonProps,
    VariantProps<typeof buttonVariants> {
  className?: string;
}

const Button = ({
  className,
  variant,
  size,
  children,
  use,
  ...props
}: ButtonProps) => {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, size, use, className }))}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
};

export { Button };
export type { ButtonVariant };
