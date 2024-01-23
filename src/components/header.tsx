import LoginButton from "@/components/loginButton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { titillium_web } from "@/lib/fonts";
import { IconTree } from "@tabler/icons-react";
import { VariantProps, cva } from "class-variance-authority";
import Link from "next/link";
import { HTMLAttributes, forwardRef } from "react";

const headerVariants = cva("flex w-full px-7 py-5 text-white transition-all", {
  variants: {
    variant: {
      default:
        "fixed z-20 bg-black/30  backdrop-blur-[2px] lg:bg-transparent lg:bg-opacity-0 lg:backdrop-blur-none",
      fixed: "fixed top-0",
      static: "static",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface headerProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof headerVariants> {}

const Header = forwardRef<HTMLElement, headerProps>(
  ({ variant, ...props }, ref) => {
    return (
      <header
        className={cn(titillium_web.className, headerVariants({ variant }))}
        ref={ref}
        {...props}
      >
        <Button asChild variant={"ghost"} className="px-3 py-6 pl-1">
          <Link className="flex items-center" href={"/"}>
            <IconTree size={34} />
            <span className="text-2xl sm:text-3xl">Projeto Praças</span>
          </Link>
        </Button>
        <LoginButton />
      </header>
    );
  },
);
Header.displayName = "Header";

export { Header };
