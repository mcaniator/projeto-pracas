"use client";

import { AuthForm } from "@/app/_components/authForm";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/cn";
import { titillium_web } from "@/lib/fonts";
import { signout } from "@/serverActions/auth";
import { IconLogin, IconTree } from "@tabler/icons-react";
import { VariantProps, cva } from "class-variance-authority";
import { User } from "lucia";
import Link from "next/link";
import { HTMLAttributes, forwardRef } from "react";
import { useFormState } from "react-dom";

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
    VariantProps<typeof headerVariants> {
  user: User | null;
}

const Header = forwardRef<HTMLElement, headerProps>(
  ({ user, variant, ...props }, ref) => {
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
        {user !== null && user !== undefined ?
          <UserInfo user={user} />
        : <LoginButton />}
      </header>
    );
  },
);
Header.displayName = "Header";

const LoginButton = () => {
  return (
    <Popover>
      <PopoverTrigger className="ml-auto">
        <Button
          asChild
          variant={"ghost"}
          className="flex items-center px-3 py-6 pl-2"
        >
          <div>
            <IconLogin size={34} />
            <span className="pointer-events-none text-2xl sm:text-3xl">
              Login
            </span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="mr-7 w-96 rounded-2xl border-0 bg-off-white">
        <AuthForm />
      </PopoverContent>
    </Popover>
  );
};

const UserInfo = ({ user }: { user: User }) => {
  const [, formAction] = useFormState(signout, { statusCode: -1 });

  return (
    <Popover>
      <PopoverTrigger className="ml-auto">
        <Button
          asChild
          variant={"ghost"}
          className="flex items-center px-3 py-6 pl-2"
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl">{user.username}</span>
            <span className="h-8 w-8 rounded-lg bg-off-white"></span>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="mr-7 w-96 rounded-2xl border-0 bg-off-white">
        <div className="flex gap-2">
          <Link href={"/admin"}>
            <Button className="text-white" variant={"destructive"}>
              <span className="-mb-1">Ir para admin</span>
            </Button>
          </Link>
          <form action={formAction}>
            <Button variant={"destructive"}>
              <span className="-mb-1 text-white">Sair</span>
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export { Header };
