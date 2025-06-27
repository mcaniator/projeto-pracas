"use client";

import { Button } from "@/components/button";
import { cn } from "@/lib/cn";
import { titillium_web } from "@/lib/fonts";
import {
  IconFountain,
  IconHome,
  IconListCheck,
  IconLogs,
  IconMapSearch,
  IconMenu2,
  IconTableExport,
  IconTree,
  IconUserCog,
  IconX,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

import { checkIfRolesArrayContainsAny } from "../../../../lib/auth/rolesUtil";
import { useUserContext } from "../../../context/UserContext";
import ButtonLink from "../../../ui/buttonLink";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  const { user } = useUserContext();
  const currentLocation = usePathname();
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);

  const toggleSidebar = () => setIsSidebarVisible(!isSidebarVisible);
  const closeSidebar = () => setIsSidebarVisible(false);

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

  useEffect(() => {
    closeSidebar();
  }, [currentLocation]);

  const topSidebar: {
    icon: ReactNode;
    name: string;
    path: string;
    show?: boolean;
  }[] = [
    {
      icon: <IconHome size={34} />,
      name: "Início",
      path: "/admin/home",
      show: true,
    },
    {
      icon: <IconFountain size={34} />,
      name: "Praças",
      path: "/admin/parks",
      show: true,
    },
    {
      icon: <IconMapSearch size={34} />,
      name: "Mapa",
      path: "/admin/map",
      show: true,
    },
    {
      icon: <IconListCheck size={34} />,
      name: "Formulários",
      path: "/admin/registration/questions",
      show: checkIfRolesArrayContainsAny(user.roles, { roleGroups: ["FORM"] }),
    },
    {
      icon: <IconTableExport size={34} />,
      name: "Exportar",
      path: "/admin/export",
      show: true,
    },
    {
      icon: <IconLogs size={34} />,
      name: "Atividade",
      path: "/admin/activity",
      show: checkIfRolesArrayContainsAny(user.roles, {
        roleGroups: ["ASSESSMENT", "TALLY"],
      }),
    },
    {
      icon: <IconUserCog size={34} />,
      name: "Usuários",
      path: "/admin/users",
      show: checkIfRolesArrayContainsAny(user.roles, { roleGroups: ["USER"] }),
    },
  ];

  return (
    <div className="relative z-[39]">
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-2 z-[39] items-center md:top-3"
      >
        {!isSidebarVisible && (
          <IconMenu2 size={34} className="hover:text-brand" />
        )}
      </button>

      {isSidebarVisible && (
        <div
          className="fixed inset-0 z-[89] bg-black bg-opacity-50"
          onClick={handleOverlayClick}
        ></div>
      )}

      <nav
        className={cn(
          "fixed left-0 top-0 z-[90] flex h-full w-64 flex-col bg-brand-dark p-5 text-xl shadow-lg transition-all duration-300",
          isSidebarVisible ? "translate-x-0" : "-translate-x-full opacity-0",
          titillium_web.className,
          styles.sidebar,
        )}
      >
        <div className="mb-4 flex justify-between">
          <ButtonLink
            href="/"
            variant={"ghost"}
            className="flex gap-1 px-1 transition-colors hover:bg-white hover:text-brand-dark"
          >
            <IconTree size={34} />
            Projeto praças
          </ButtonLink>
          <Button
            variant={"ghost"}
            onPress={closeSidebar}
            className="cursor-pointer gap-1 px-1 py-5 text-white transition-colors hover:bg-white hover:text-brand-dark"
          >
            <IconX size={34} className=" " />
          </Button>
        </div>

        <div className="flex flex-col gap-1">
          {topSidebar
            .filter((element) => element.show)
            .map((element, index) => (
              <ButtonLink
                href={element.path}
                key={index}
                variant={"ghost"}
                className={cn(
                  currentLocation.startsWith(element.path) &&
                    "bg-white text-black",
                  "w-full justify-start gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-brand-dark",
                )}
              >
                {element.icon}
                <span className="-mb-1">{element.name}</span>
              </ButtonLink>
            ))}
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
