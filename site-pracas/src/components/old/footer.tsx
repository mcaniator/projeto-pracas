import { Button } from "../ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  InfoCircledIcon,
  EnvelopeOpenIcon,
  TwitterLogoIcon,
  InstagramLogoIcon,
} from "@radix-ui/react-icons";

const Footer = ({
  className,
  isLogin = false,
}: {
  className?: string;
  isLogin?: boolean;
}) => {
  return (
    <footer
      className={cn("mb-4 mt-28 flex bg-white px-20 align-middle", className)}
    >
      <div>
        <Button
          variant={"ghost"}
          className={isLogin ? "hover:text-gray-400" : ""}
          asChild
        >
          <Link href={"/"} className="whitespace-pre-wrap">
            <InfoCircledIcon className="h-4 w-4" />
            <span> Quem somos</span>
          </Link>
        </Button>

        <Button
          variant={"ghost"}
          className={isLogin ? "hover:text-gray-400" : ""}
          asChild
        >
          <Link href={"/"} className="whitespace-pre-wrap">
            <EnvelopeOpenIcon className="h-4 w-4" />
            <span> Contato</span>
          </Link>
        </Button>
      </div>

      <div className="ml-auto">
        <Button
          variant={"ghost"}
          className={isLogin ? "hover:text-gray-400" : ""}
          asChild
        >
          <Link href={"/"}>
            <TwitterLogoIcon className="h-4 w-4" />
          </Link>
        </Button>

        <Button
          variant={"ghost"}
          className={isLogin ? "hover:text-gray-400" : ""}
          asChild
        >
          <Link href={"/"}>
            <InstagramLogoIcon className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </footer>
  );
};

export default Footer;
