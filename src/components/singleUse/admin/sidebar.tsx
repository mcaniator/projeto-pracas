"use client";

import { Button } from "@/components/button";
import { cn } from "@/lib/cn";
import { titillium_web } from "@/lib/fonts";
import {
  IconBug,
  IconClipboard,
  IconInfoSquareRounded,
  IconListCheck,
  IconLogs,
  IconMail,
  IconMapSearch,
  IconMenu2,
  IconTableExport,
  IconTree,
  IconUserCog,
  IconX,
} from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";
import { GrGroup } from "react-icons/gr";

import { checkIfRolesArrayContainsAny } from "../../../lib/auth/rolesUtil";
import { useUserContext } from "../../context/UserContext";
import ButtonLink from "../../ui/buttonLink";

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
      icon: <IconMapSearch size={34} />,
      name: "Mapa",
      path: "/admin/map",
      show: true,
    },
    {
      icon: <IconClipboard size={34} />,
      name: "Avaliações",
      path: "/admin/assessments",
      show: checkIfRolesArrayContainsAny(user.roles, {
        roleGroups: ["ASSESSMENT"],
      }),
    },
    {
      icon: <GrGroup size={34} />,
      name: "Contagens",
      path: "/admin/tallys",
      show: checkIfRolesArrayContainsAny(user.roles, { roleGroups: ["TALLY"] }),
    },
    {
      icon: <IconListCheck size={34} />,
      name: "Formulários",
      path: "/admin/forms",
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
    <div className="relative z-[51]">
      <button
        onClick={toggleSidebar}
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
          <ButtonLink
            href="/"
            variant={"ghost"}
            className="flex gap-1 px-1 transition-colors hover:bg-white hover:text-gray-800"
          >
            <IconTree size={34} />
            Projeto praças
          </ButtonLink>
          <Button
            variant={"ghost"}
            onPress={closeSidebar}
            className="cursor-pointer gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800"
          >
            <IconX size={34} />
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
                    "bg-transparent/50",
                  "w-full justify-start gap-1 px-1 py-5 transition-colors hover:bg-white hover:text-gray-800",
                )}
              >
                {element.icon}
                <span className="-mb-1">{element.name}</span>
              </ButtonLink>
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
