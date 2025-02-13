"use client";

import { AuthForm } from "@/app/_components/authForm";
import { Button } from "@/components/button";
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
import { useActionState } from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";

const headerVariants = cva(
  "flex w-full py-1 pl-14 pr-7 text-white transition-all md:py-5",
  {
    variants: {
      variant: {
        default:
          "fixed z-30 bg-black/30 backdrop-blur-[2px] lg:bg-transparent lg:bg-opacity-0 lg:backdrop-blur-none",
        fixed: "fixed top-0",
        static: "static",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

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
        <Link className="flex items-center" href={"/"}>
          <Button
            type={"button"}
            variant={"ghost"}
            use={"link"}
            className="px-3 py-6"
          >
            <IconTree size={34} />
            <span className="text-lg sm:text-3xl">Projeto Praças</span>
          </Button>
        </Link>

        <DialogTrigger>
          <Button
            variant={"ghost"}
            className="ml-auto flex items-center px-3 py-6 pl-2"
          >
            {user !== null && user !== undefined ?
              <div className="flex items-center gap-2">
                <span className="hidden text-3xl md:inline">
                  {user.username}
                </span>
                <span className="h-8 w-8 rounded-lg bg-off-white" />
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
              "z-50 rounded-3xl border-0 bg-off-white p-4 shadow-md data-[entering]:animate-in data-[exiting]:animate-out data-[entering]:fade-in-0 data-[exiting]:fade-out-0 data-[placement=bottom]:slide-in-from-top-2"
            }
          >
            <Dialog className={"outline-none"}>
              <div ref={popupContentRef}>
                {user !== null && user !== undefined ?
                  <UserInfo user={user} />
                : <AuthForm />}
              </div>
            </Dialog>
          </Popover>
        </DialogTrigger>
      </header>
    );
  },
);
Header.displayName = "Header";

const UserInfo = ({ user }: { user: User }) => {
  const [, formAction] = useActionState(signout, { statusCode: -1 });
  const [highContrast, setHighContrat] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-lg bg-cambridge-blue" />
        <div className="flex items-center gap-1">
          <span className="-mb-1 text-2xl font-semibold">{user.username}</span>
          <span className="-mb-1 text-gray-500">{user.email}</span>
        </div>
        <Button
          type={"button"}
          variant={"ghost"}
          size={"icon"}
          className="ml-auto"
        >
          <IconPencil />
        </Button>
      </div>
      <div className="my-3 flex gap-4">
        <Link href={"/admin"} className="basis-1/2">
          <Button
            type={"button"}
            className="w-full text-white"
            use={"link"}
            onPress={() => (window.location.href = "/admin")}
          >
            <span className="-mb-1">Painel Admin</span>
          </Button>
        </Link>
        <Button
          variant={"destructive"}
          className="w-full basis-1/2 text-nowrap text-white"
          onPress={() => {
            void revalidateAllCache();
          }}
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
          onPress={() => {
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
            type="submit"
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
