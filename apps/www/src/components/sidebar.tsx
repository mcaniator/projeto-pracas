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

const Sidebar = () => {
  return (
    <nav
      className={cn(
        "flex h-full w-64 flex-col p-5 text-xl text-white",
        titillium_web.className,
      )}
    >
      <div className="flex flex-col gap-1">
        <Button variant={"ghost"} className="justify-start gap-1 px-1 py-5">
          <IconHome size={34} />
          <p className="-mb-1">Início</p>
        </Button>
        <Button variant={"ghost"} className="justify-start gap-1 px-1 py-5">
          <IconFountain size={34} />
          <p className="-mb-1">Praças</p>
        </Button>
        <Button variant={"ghost"} className="justify-start gap-1 px-1 py-5">
          <IconUserCog size={34} />
          <p className="-mb-1">Usuários</p>
        </Button>
        <Button variant={"ghost"} className="justify-start gap-1 px-1 py-5">
          <IconMapSearch size={34} />
          <p className="-mb-1">Leaflet</p>
        </Button>
        <Button variant={"ghost"} className="justify-start gap-1 px-1 py-5">
          <IconListDetails size={34} />
          <p className="-mb-1">Cadastro</p>
        </Button>
        <Button variant={"ghost"} className="justify-start gap-1 px-1 py-5">
          <IconListCheck size={34} />
          <p className="-mb-1">Formulários</p>
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
