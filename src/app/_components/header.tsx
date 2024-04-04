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
import { revalidateAllCache } from "@/serverActions/revalidateAllCache";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  IconContrast,
  IconContrastOff,
  IconLogin,
  IconLogin2,
  IconPencil,
  IconSettings,
  IconTree,
} from "@tabler/icons-react";
import { VariantProps, cva } from "class-variance-authority";
import { User } from "lucia";
import Link from "next/link";
import { HTMLAttributes, forwardRef, useState } from "react";
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
    const [popupContentRef] = useAutoAnimate();

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
        <Popover>
          <PopoverTrigger className="ml-auto" asChild>
            {user !== null && user !== undefined ?
              <Button
                variant={"ghost"}
                className="flex items-center px-3 py-6 pl-2"
              >
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl">{user.username}</span>
                  <span className="h-8 w-8 rounded-lg bg-off-white" />
                </div>
              </Button>
            : <Button
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
            }
          </PopoverTrigger>

          <PopoverContent
            className={"mr-7 w-96 rounded-2xl border-0 bg-off-white"}
          >
            <div ref={popupContentRef}>
              {user !== null && user !== undefined ?
                <UserInfo user={user} />
              : <AuthForm />}
            </div>
          </PopoverContent>
        </Popover>
      </header>
    );
  },
);
Header.displayName = "Header";

const UserInfo = ({ user }: { user: User }) => {
  const [, formAction] = useFormState(signout, { statusCode: -1 });
  const [highContrast, setHighContrat] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-lg bg-cambridge-blue" />
        <div className="flex items-center gap-1">
          <span className="-mb-1 text-2xl font-semibold">{user.username}</span>
          <span className="-mb-1 text-gray-500">{user.email}</span>
        </div>
        <Button variant={"ghost"} size={"icon"} className="ml-auto">
          <IconPencil />
        </Button>
      </div>
      <div className="my-3 flex gap-4">
        <Link href={"/admin"} className="basis-1/2">
          <Button className="w-full text-white">
            <span className="-mb-1">Painel Admin</span>
          </Button>
        </Link>
        <Button
          variant={"destructive"}
          className="w-full basis-1/2 text-white"
          onClick={() => revalidateAllCache()}
        >
          <span className="-mb-1">Resetar cache</span>
        </Button>
      </div>
      <div className="flex w-full items-center">
        <Button variant={"ghost"} size={"icon"}>
          <IconSettings />
        </Button>
        <Button
          variant={"ghost"}
          size={"icon"}
          onClick={() => {
            setHighContrat(!highContrast);
          }}
        >
          {highContrast ?
            <IconContrastOff />
          : <IconContrast />}
        </Button>
        <form action={formAction} className="ml-auto">
          <Button
            className={"hover:bg-redwood/20"}
            variant={"ghost"}
            role="submit"
          >
            <span className="-mb-1 flex gap-1 font-bold text-black">
              <IconLogin2 strokeWidth={3} /> Sair
            </span>
          </Button>
        </form>
      </div>
    </div>
  );
};

export { Header };
