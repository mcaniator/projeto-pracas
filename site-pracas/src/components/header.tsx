import { titillium_web } from "@/app/fonts";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { IconTree } from "@tabler/icons-react";
import { HTMLAttributes, forwardRef } from "react";
import LoginButton from "@/components/loginButton";
import clsx from "clsx";
import { VariantProps, cva } from "class-variance-authority";

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
        className={clsx(titillium_web.className, headerVariants({ variant }))}
        ref={ref}
        {...props}
      >
        <div>
          <Button asChild variant={"ghost"} className="px-3 py-6 pl-1">
            <Link className="flex items-center" href={"/"}>
              <IconTree size={34} />
              <span className="text-2xl sm:text-3xl">Projeto Praças</span>
            </Link>
          </Button>
        </div>

        <LoginButton />
      </header>
    );
  },
);
Header.displayName = "Header";

export default Header;
