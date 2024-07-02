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
  IconTableExport,
  IconUserCog,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const Sidebar = () => {
  const currentLocation = usePathname();

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
    {
      icon: <IconTableExport size={34} />,
      name: "Exportar",
      path: "/admin/export",
    },
  ];

  return (
    <nav
      className={cn(
        "flex h-full w-64 flex-col p-5 text-xl text-white",
        titillium_web.className,
      )}
    >
      <div className="flex flex-col gap-1">
        {topSidebar.map((element, index) => (
          <Link href={element.path} key={index}>
            <Button
              type="button"
              variant={"ghost"}
              use={"link"}
              className={cn(
                currentLocation.startsWith(element.path) && "bg-transparent/5",
                "w-full justify-start gap-1 px-1 py-5",
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
          className="justify-start gap-1 px-1 py-5"
        >
          <IconBug size={34} />
          <p className="-mb-1">Erros?</p>
        </Button>
        <Button
          type="button"
          variant={"ghost"}
          className="justify-start gap-1 px-1 py-5"
        >
          <IconMail size={34} />
          <p className="-mb-1">Contato</p>
        </Button>
        <Button
          type="button"
          variant={"ghost"}
          className="justify-start gap-1 px-1 py-5"
        >
          <IconInfoSquareRounded size={34} />
          <p className="-mb-1">Quem Somos!</p>
        </Button>
      </div>
    </nav>
  );
};

export default Sidebar;
