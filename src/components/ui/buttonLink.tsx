import { VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import React, { ReactNode } from "react";

import { cn } from "../../lib/cn";

const buttonLinkVariants = cva(
  "group inline-flex items-center justify-center rounded-lg text-lg font-medium text-white shadow outline-none transition-all data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring disabled:pointer-events-none disabled:select-none",
  {
    variants: {
      variant: {
        default:
          "bg-brand bg-blend-darken hover:bg-brand-dark disabled:bg-gray-500",
        admin: "bg-purpureus hover:bg-eminence disabled:bg-eminence",
        constructive:
          "bg-green-500/90 hover:bg-green-700/90 disabled:bg-green-700/90",
        destructive: "bg-redwood hover:bg-cordovan disabled:bg-cordovan",
        outline:
          "hover:bg-accenthover:text-accent-foreground border border-input bg-transparent",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "bg-transparent shadow-none hover:bg-transparent/10",
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
      use: "link",
    },
  },
);

interface ButtonLinkProps extends VariantProps<typeof buttonLinkVariants> {
  href: string;
  className?: string;
  children: ReactNode;
}
const ButtonLink = ({
  href,
  className,
  children,
  variant,
}: ButtonLinkProps) => {
  return (
    <Link
      href={href}
      className={cn(buttonLinkVariants({ variant, className }))}
    >
      {children}
    </Link>
  );
};

export default ButtonLink;
