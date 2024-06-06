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
  IconUserCog,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Sidebar = () => {
  const currentLocation = usePathname();

  return (
    <nav
      className={cn(
        "flex h-full w-64 flex-col p-5 text-xl text-white",
        titillium_web.className,
      )}
    >
      <div className="flex flex-col gap-1">
        <Link href={"/admin/home"}>
          <Button
            type="button"
            variant={"ghost"}
            className={cn(
              currentLocation == "/admin/home" && "bg-transparent/5",
              "justify-start gap-1 px-1 py-5",
            )}
          >
            <IconHome size={34} />
            <p className="-mb-1">Início</p>
          </Button>
        </Link>
        <Link href={"/admin/parks"}>
          <Button
            type="button"
            variant={"ghost"}
            className={cn(
              currentLocation == "/admin/parks" && "bg-transparent/5",
              "justify-start gap-1 px-1 py-5",
            )}
          >
            <IconFountain size={34} />
            <p className="-mb-1">Praças</p>
          </Button>
        </Link>
        <Link href={"/admin/users"}>
          <Button
            type="button"
            variant={"ghost"}
            className={cn(
              currentLocation == "/admin/users" && "bg-transparent/5",
              "justify-start gap-1 px-1 py-5",
            )}
          >
            <IconUserCog size={34} />
            <p className="-mb-1">Usuários</p>
          </Button>
        </Link>
        <Link href={"/admin/map"}>
          <Button
            type="button"
            variant={"ghost"}
            className={cn(
              currentLocation == "/admin/map" && "bg-transparent/5",
              "justify-start gap-1 px-1 py-5",
            )}
          >
            <IconMapSearch size={34} />
            <p className="-mb-1">Mapa</p>
          </Button>
        </Link>
        <Link href={"/admin/registration"}>
          <Button
            type="button"
            variant={"ghost"}
            className={cn(
              currentLocation.includes("/admin/registration") &&
                "bg-transparent/5",
              "justify-start gap-1 px-1 py-5",
            )}
          >
            <IconListDetails size={34} />
            <p className="-mb-1">Cadastro</p>
          </Button>
        </Link>
        <Link href={"/admin/forms"}>
          <Button
            type="button"
            variant={"ghost"}
            className={cn(
              currentLocation == "/admin/forms" && "bg-transparent/5",
              "justify-start gap-1 px-1 py-5",
            )}
          >
            <IconListCheck size={34} />
            <p className="-mb-1">Formulários</p>
          </Button>
        </Link>
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
