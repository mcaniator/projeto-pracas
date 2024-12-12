"use client";

import { Button } from "@/components/button";
import { cn } from "@/lib/cn";
import { titillium_web } from "@/lib/fonts";
import {
  IconBug,
  IconFountain,
  IconHome,
  IconInfoSquareRounded,
  IconListCheck,
  IconListDetails,
  IconMail,
  IconMapSearch,
  IconMenu2,
  IconUserCog,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";

const Sidebar = () => {
  const currentLocation = usePathname();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);

  const topSidebar: { icon: ReactNode; name: string; path: string }[] = [
    { icon: <IconHome size={34} />, name: "Início", path: "/admin/home" },
    { icon: <IconFountain size={34} />, name: "Praças", path: "/admin/parks" },
    { icon: <IconUserCog size={34} />, name: "Usuários", path: "/admin/users" },
    { icon: <IconMapSearch size={34} />, name: "Mapa", path: "/admin/map" },
    {
      icon: <IconListDetails size={34} />,
      name: "Cadastro",
      path: "/admin/registration",
    },
    {
      icon: <IconListCheck size={34} />,
      name: "Formulários",
      path: "/admin/forms",
    },
  ];

  return (
    <div className="relative z-50">
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-50 text-white"
      >
        {!isSidebarVisible && <IconMenu2 size={34} />}
      </button>

      <nav
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 bg-gray-800 p-5 text-xl text-white shadow-lg transition-transform duration-300",
          isSidebarVisible ? "translate-x-0" : "-translate-x-full",
          titillium_web.className,
        )}
      >
        <div className="mb-4 flex justify-end">
          <button onClick={toggleSidebar} className="text-white">
            <IconX size={34} />
          </button>
        </div>

        <div className="flex flex-col gap-1">
          {topSidebar.map((element, index) => (
            <Link href={element.path} key={index}>
              <Button
                type="button"
                variant={"ghost"}
                use={"link"}
                className={cn(
                  currentLocation.startsWith(element.path) &&
                    "bg-transparent/5",
                  "w-full justify-start gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800",
                )}
              >
                {element.icon}
                <span className="-mb-1">{element.name}</span>
              </Button>
            </Link>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-1">
          <Button
            type="button"
            variant={"ghost"}
            className="justify-start gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800"
          >
            <IconBug size={34} />
            <p className="-mb-1">Erros?</p>
          </Button>
          <Button
            type="button"
            variant={"ghost"}
            className="justify-start gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800"
          >
            <IconMail size={34} />
            <p className="-mb-1">Contato</p>
          </Button>
          <Button
            type="button"
            variant={"ghost"}
            className="justify-start gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800"
          >
            <IconInfoSquareRounded size={34} />
            <p className="-mb-1">Quem Somos!</p>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
