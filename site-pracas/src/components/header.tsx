import { titillium_web } from "@/app/fonts";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import Link from "next/link";
import { IconLogin, IconTree } from "@tabler/icons-react";
import { forwardRef } from "react";

const Header = ({
  className = "",
  isLogin = false,
}: {
  className?: string;
  isLogin?: boolean;
}) => {
  return (
    <header
      className={cn(
        "fixed flex w-full px-7 py-5 text-white transition-all",
        titillium_web.className,
        className,
      )}
    >
      <div>
        <Button asChild variant={"ghost"} className="px-3 py-6 pl-1">
          <Link className="flex items-center" href={"/"}>
            <IconTree size={34} />
            <span className="text-2xl sm:text-3xl">Projeto Praças</span>
          </Link>
        </Button>
      </div>

      {!isLogin ? (
        <div className="ml-auto">
          <Button asChild variant={"ghost"} className="px-3 py-6 pl-2">
            <Link href={"/login"} className="flex items-center">
              <IconLogin size={34} />
              <span className="text-2xl sm:text-3xl"> Login</span>
            </Link>
          </Button>
        </div>
      ) : (
        <div />
      )}
    </header>
  );
};

export default Header;
