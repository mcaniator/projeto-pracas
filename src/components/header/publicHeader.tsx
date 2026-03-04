"use client";

import { Button } from "@/components/button";
import ButtonLink from "@/components/ui/buttonLink";
import { cn } from "@/lib/cn";
import { titillium_web } from "@/lib/fonts";
import {
  IconInfoSquareRounded,
  IconMapSearch,
  IconMenu2,
  IconTree,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HTMLAttributes,
  MouseEvent,
  ReactNode,
  forwardRef,
  useEffect,
  useState,
} from "react";

interface PublicHeaderProps extends HTMLAttributes<HTMLElement> {}

const PublicHeader = forwardRef<HTMLElement, PublicHeaderProps>(
  ({ className, ...props }, ref) => {
    const currentLocation = usePathname();
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);

    const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);
    const closeSidebar = () => setIsSidebarVisible(false);

    const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        closeSidebar();
      }
    };

    useEffect(() => {
      closeSidebar();
    }, [currentLocation]);

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
        <button
          onClick={toggleSidebar}
          type="button"
          aria-label="Abrir menu"
          className="fixed left-4 top-2 z-[51] items-center md:top-3"
        >
          {!isSidebarVisible && <IconMenu2 size={34} />}
        </button>

        {isSidebarVisible && (
          <div
            className="fixed inset-0 z-[51] bg-black bg-opacity-50"
            onClick={handleOverlayClick}
          ></div>
        )}

        <nav
          className={cn(
            "fixed left-0 top-0 z-[51] flex h-full w-64 flex-col bg-main p-5 text-xl shadow-lg transition-transform duration-300",
            isSidebarVisible ? "translate-x-0" : "-translate-x-full",
            titillium_web.className,
          )}
        >
          <div className="mb-4 flex justify-between">
            <Link className="flex items-center" href={"/"}>
              <Button
                type={"button"}
                variant={"ghost"}
                use={"link"}
                className="px-1 py-5"
              >
                <IconTree size={34} />
                Projeto Pracas
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
                className={cn(
                  currentLocation.startsWith(option.path) &&
                    "bg-transparent/50",
                  "w-full justify-start gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800",
                )}
              >
                {option.icon}
                <span className="-mb-1">{option.name}</span>
              </ButtonLink>
            ))}
          </div>
        </nav>

        <header
          className={cn(
            titillium_web.className,
            "static flex w-full pl-14 pr-7 transition-all md:py-1",
            className,
          )}
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
              <span className="sm:inline sm:text-xl">Projeto Pracas</span>
            </Button>
          </Link>
        </header>
      </>
    );
  },
);

PublicHeader.displayName = "PublicHeader";

export { PublicHeader };
