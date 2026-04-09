"use client";

import { Button } from "@/components/button";
import ButtonLink from "@/components/ui/buttonLink";
import { cn } from "@/lib/cn";
import { titillium_web } from "@/lib/fonts";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
  IconContrast,
  IconContrastOff,
  IconInfoSquareRounded,
  IconLogin2,
  IconMapSearch,
  IconMenu2,
  IconSettings,
  IconTree,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  forwardRef,
  useEffect,
  useState,
} from "react";
import { Dialog, DialogTrigger, Popover } from "react-aria-components";

type HeaderVariant = "public" | "admin";
type HeaderPosition = "static" | "box";
type HeaderColorType = "filled" | "translucid";

interface HeaderProps extends HTMLAttributes<HTMLElement> {
  user?: {
    username: string | null;
    email: string;
    image: string | null;
  } | null;
  variant: HeaderVariant;
  position?: HeaderPosition;
  colorType?: HeaderColorType;
}

const Header = forwardRef<HTMLElement, HeaderProps>(
  (
    {
      user = null,
      variant,
      position = "static",
      colorType = "filled",
      className,
      ...props
    },
    ref,
  ) => {
    const [popupContentRef] = useAutoAnimate();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const isPublic = variant === "public";
    const isAdmin = variant === "admin";

    useEffect(() => {
      setIsSidebarVisible(false);
    }, []);

    const toggleSidebar = () => setIsSidebarVisible((prev) => !prev);
    const closeSidebar = () => setIsSidebarVisible(false);

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        closeSidebar();
      }
    };

    const sidebarOptions: {
      icon: ReactNode;
      name: string;
      path: string;
    }[] = [
      {
        icon: <IconMapSearch size={34} />,
        name: "Mapa",
        path: "/map",
      },
      {
        icon: <IconInfoSquareRounded size={34} />,
        name: "Sobre",
        path: "/about",
      },
    ];

    return (
      <>
        {isPublic && (
          <>
            <button
              onClick={toggleSidebar}
              type="button"
              aria-label="Abrir menu"
              className="fixed left-4 top-2 z-[61] items-center md:top-3"
            >
              {!isSidebarVisible && <IconMenu2 size={34} />}
            </button>

            {isSidebarVisible && (
              <div
                className="fixed inset-0 z-[61] bg-black bg-opacity-50"
                onClick={handleOverlayClick}
              ></div>
            )}

            <nav
              className={cn(
                "fixed left-0 top-0 z-[62] flex h-full w-64 flex-col bg-main p-5 text-xl shadow-lg transition-transform duration-300",
                isSidebarVisible ? "translate-x-0" : "-translate-x-full",
                titillium_web.className,
              )}
            >
              <div className="mb-4 flex justify-between">
                <Link className="flex items-center" href="/">
                  <Button
                    type={"button"}
                    variant={"ghost"}
                    use={"link"}
                    className="px-1 py-5"
                  >
                    <IconTree size={34} />
                    Projeto Praças
                  </Button>
                </Link>
                <Button
                  variant={"ghost"}
                  onPress={closeSidebar}
                  className="cursor-pointer gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800"
                >
                  <IconX size={34} />
                </Button>
              </div>

              <div className="flex flex-col gap-1">
                {sidebarOptions.map((option) => (
                  <ButtonLink
                    href={option.path}
                    key={option.path}
                    variant={"ghost"}
                    className="w-full justify-start gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800"
                  >
                    {option.icon}
                    <span className="-mb-1">{option.name}</span>
                  </ButtonLink>
                ))}
              </div>
            </nav>
          </>
        )}

        <header
          className={cn(
            titillium_web.className,
            "flex w-full pl-14 pr-7 transition-all md:py-1",
            position === "box" && "relative z-[60] mx-2 mt-2 rounded-2xl",
            colorType === "translucid" ?
              "fixed inset-x-0 top-0 z-[60] bg-main opacity-20 backdrop-blur-[2px]"
            : "static",
            className,
          )}
          ref={ref}
          {...props}
        >
          <Link className="z-[50] flex items-center" href="/">
            <Button
              type={"button"}
              variant={"ghost"}
              use={"link"}
              className="px-3 py-6"
            >
              <IconTree size={34} />
              <span className="text-xl">Projeto Praças</span>
            </Button>
          </Link>

          {isAdmin && user && (
            <DialogTrigger>
              <Button
                variant={"ghost"}
                className="z-[50] ml-auto flex items-center px-3 py-6 pl-2"
              >
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
          )}

          {isAdmin && !user && (
            <div className="z-[50] ml-auto flex flex-wrap gap-1">
              <Link href="/auth/login">
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
          )}
        </header>
      </>
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
        <Link href="/admin/map">
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
export type { HeaderVariant, HeaderPosition, HeaderColorType };
