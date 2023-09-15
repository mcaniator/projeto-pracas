import Link from "next/link";
import { Button } from "./ui/button";
import { IconInfoSquareRounded, IconMail } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { titillium_web } from "@/app/fonts";

const Footer = ({ className }: { className?: string }) => {
  return (
    <footer
      className={cn("flex px-7 pb-5", titillium_web.className, className)}
    >
      <div>
        <Button asChild variant={"ghost"} className="px-3 py-5 pl-2">
          <Link className="flex items-center gap-1" href={"/about"}>
            <IconInfoSquareRounded size={27} />
            <span className="text-2xl">Sobre nós!</span>
          </Link>
        </Button>
      </div>

      <div className="ml-auto">
        <Button asChild variant={"ghost"} className="px-3 py-5">
          <Link
            className="flex items-center gap-1"
            href={"mailto:email@email.com"}
          >
            <IconMail size={27} />
            <span className="text-2xl">Contato</span>
          </Link>
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
