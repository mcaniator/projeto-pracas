"use client";

import { titillium_web } from "@/app/fonts";
import { cn } from "@/lib/utils";
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
import { Button } from "./ui/button";
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
        <Button
          variant={"ghost"}
          className={cn(
            currentLocation == "/admin/home" && "bg-transparent/5",
            "justify-start gap-1 px-1 py-5",
          )}
          asChild
        >
          <Link href={"/admin/home"}>
            <IconHome size={34} />
            <p className="-mb-1">Início</p>
          </Link>
        </Button>
        <Button
          variant={"ghost"}
          className={cn(
            currentLocation == "/admin/parks" && "bg-transparent/5",
            "justify-start gap-1 px-1 py-5",
          )}
          asChild
        >
          <Link href={"/admin/parks"}>
            <IconFountain size={34} />
            <p className="-mb-1">Praças</p>
          </Link>
        </Button>
        <Button
          variant={"ghost"}
          className={cn(
            currentLocation == "/admin/users" && "bg-transparent/5",
            "justify-start gap-1 px-1 py-5",
          )}
          asChild
        >
          <Link href={"/admin/users"}>
            <IconUserCog size={34} />
            <p className="-mb-1">Usuários</p>
          </Link>
        </Button>
        <Button
          variant={"ghost"}
          className={cn(
            currentLocation == "/admin/leaflet" && "bg-transparent/5",
            "justify-start gap-1 px-1 py-5",
          )}
          asChild
        >
          <Link href={"/admin/leaflet"}>
            <IconMapSearch size={34} />
            <p className="-mb-1">Leaflet</p>
          </Link>
        </Button>
        <Button
          variant={"ghost"}
          className={cn(
            currentLocation == "/admin/registration" && "bg-transparent/5",
            "justify-start gap-1 px-1 py-5",
          )}
          asChild
        >
          <Link href={"/admin/registration"}>
            <IconListDetails size={34} />
            <p className="-mb-1">Cadastro</p>
          </Link>
        </Button>
        <Button
          variant={"ghost"}
          className={cn(
            currentLocation == "/admin/forms" && "bg-transparent/5",
            "justify-start gap-1 px-1 py-5",
          )}
          asChild
        >
          <Link href={"/admin/forms"}>
            <IconListCheck size={34} />
            <p className="-mb-1">Formulários</p>
          </Link>
        </Button>
      </div>

      <div className="mt-auto flex flex-col gap-1">
        <Button variant={"ghost"} className="justify-start gap-1 px-1 py-5">
          <IconBug size={34} />
          <p className="-mb-1">Erros?</p>
        </Button>
        <Button variant={"ghost"} className="justify-start gap-1 px-1 py-5">
          <IconMail size={34} />
          <p className="-mb-1">Contato</p>
        </Button>
        <Button variant={"ghost"} className="justify-start gap-1 px-1 py-5">
          <IconInfoSquareRounded size={34} />
          <p className="-mb-1">Quem Somos!</p>
        </Button>
      </div>
    </nav>
  );
};

export default Sidebar;
