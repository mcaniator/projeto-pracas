"use client";

import { Button } from "@/components/button";
import { cn } from "@/lib/cn";
import { titillium_web } from "@/lib/fonts";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  IconContrast,
  IconContrastOff,
  IconLogin,
  IconLogin2,
  IconSettings,
  IconTree,
  IconUser,
} from "@tabler/icons-react";
import { VariantProps, cva } from "class-variance-authority";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { HTMLAttributes, forwardRef, useState } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";

const headerVariants = cva("flex w-full pl-14 pr-7 transition-all md:py-1", {
  variants: {
    variant: {
      default:
        "fixed bg-black/30 backdrop-blur-[2px] lg:bg-transparent lg:bg-opacity-0 lg:backdrop-blur-none",
      fixed: "fixed top-0",
      static: "static bg-main",
    },
  },

  defaultVariants: {
    variant: "default",
  },
});

interface headerProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof headerVariants> {
  user: { username: string | null; email: string; image: string | null } | null;
  isAuthHeader?: boolean;
}

const Header = forwardRef<HTMLElement, headerProps>(
  ({ user, isAuthHeader, variant, ...props }, ref) => {
    const [popupContentRef] = useAutoAnimate();

    return (
      <header
        className={cn(titillium_web.className, headerVariants({ variant }))}
        ref={ref}
        {...props}
      >
        <Link className="z-[50] flex items-center" href={"/"}>
          <Button
            type={"button"}
            variant={"ghost"}
            use={"link"}
            className="px-3 py-6"
          >
            <IconTree size={34} />
            <span className="hidden sm:inline sm:text-xl">Projeto Praças</span>
          </Button>
        </Link>
        {user ?
          <DialogTrigger>
            <Button
              variant={"ghost"}
              className="z-[50] ml-auto flex items-center px-3 py-6 pl-2"
            >
              {user !== null && user !== undefined ?
                <div className="flex items-center gap-2">
                  <span className="hidden text-xl md:inline">
                    {user.username ?? user.email}
                  </span>
                  {user.image ?
                    <Image
                      src={user.image}
                      alt="img"
                      width={32}
                      height={32}
                      className="rounded-lg transition hover:cursor-pointer hover:brightness-125"
                    />
                  : <IconUser className="h-8 w-8 rounded-lg hover:bg-off-white hover:text-black" />
                  }
                </div>
              : <div className={"flex"}>
                  <IconLogin size={34} />
                  <span className="pointer-events-none text-2xl sm:text-3xl">
                    Login
                  </span>
                </div>
              }
            </Button>
            <Popover
              className={
                "z-81 rounded-3xl border-0 bg-off-white p-4 shadow-md data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[placement=bottom]:slide-in-from-top-2"
              }
            >
              <Dialog className={"outline-none"}>
                <div ref={popupContentRef}>
                  <UserInfo user={user} />
                </div>
              </Dialog>
            </Popover>
          </DialogTrigger>
        : !isAuthHeader && (
            <div className="z-[50] ml-auto flex flex-wrap gap-1">
              <Link href={"/auth/login"}>
                <Button
                  variant={"ghost"}
                  use={"link"}
                  className="ml-auto flex items-center px-3 py-6 pl-2"
                >
                  <IconLogin2 />
                  Entrar
                </Button>
              </Link>
            </div>
          )
        }
      </header>
    );
  },
);
Header.displayName = "Header";

const UserInfo = ({
  user,
}: {
  user: { username: string | null; email: string };
}) => {
  const [highContrast, setHighContrat] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-1">
          <span className="-mb-1 text-base font-semibold sm:text-xl">
            {user.username ?? "(usuário)"}
          </span>
          <span className="-mb-1 text-xs text-gray-500 sm:text-sm">
            {user.email}
          </span>
        </div>
      </div>
      <div className="my-3 flex gap-4">
        <Link href={"/admin/home"}>
          <Button
            type={"button"}
            className="w-full text-white"
            use={"link"}
            onPress={() => (window.location.href = "/admin")}
          >
            <span className="-mb-1">Painel</span>
          </Button>
        </Link>
      </div>
      <div className="flex w-full items-center">
        <Button variant={"ghost"} size={"icon"}>
          <IconSettings className="text-black" />
        </Button>
        <Button
          variant={"ghost"}
          size={"icon"}
          onPress={() => {
            setHighContrat(!highContrast);
          }}
        >
          {highContrast ?
            <IconContrastOff className="text-black" />
          : <IconContrast className="text-black" />}
        </Button>
        <div className="ml-auto">
          <Button
            className={"hover:bg-redwood/20"}
            variant={"ghost"}
            type="submit"
            onPress={() => {
              void signOut({ redirectTo: "/", redirect: true });
            }}
          >
            <span className="-mb-1 flex gap-1 font-bold text-black">
              <IconLogin2 strokeWidth={3} /> Sair
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export { Header };
