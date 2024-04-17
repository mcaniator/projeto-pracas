import { cn } from "@/lib/cn";
import { VariantProps, cva } from "class-variance-authority";
import { AriaButtonProps } from "react-aria";
import { Button as ButtonPrimitive } from "react-aria-components";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-lg font-medium shadow outline-none transition-all aria-disabled:cursor-not-allowed aria-disabled:select-none aria-disabled:text-opacity-50 aria-disabled:active:pointer-events-none data-[focus-visible]:outline-none focus-visible:outline focus-visible:ring-1 focus-visible:ring-ring",
  {
    variants: {
      variant: {
        default:
          "bg-true-blue bg-blend-darken aria-disabled:bg-indigo-dye hover:bg-indigo-dye",
        admin: "bg-purpureus aria-disabled:bg-eminence hover:bg-eminence",
        constructive:
          "bg-cambridge-blue aria-disabled:bg-sea-green hover:bg-sea-green",
        destructive: "bg-redwood aria-disabled:bg-cordovan hover:bg-cordovan",
        outline:
          "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "bg-transparent shadow-none data-[hovered]:bg-transparent/10",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
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
  ...props
}: ButtonProps) => {
  return (
    <ButtonPrimitive
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  );
};

export { Button };
