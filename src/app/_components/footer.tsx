import { titillium_web } from "@/lib/fonts";
import { IconInfoSquareRounded, IconMail } from "@tabler/icons-react";
import { VariantProps, cva } from "class-variance-authority";
import clsx from "clsx";
import Link from "next/link";
import { HTMLAttributes, forwardRef } from "react";

import { Button } from "../../components/ui/button";

const footerVariants = cva("flex px-7 pb-5", {
  variants: {
    variant: {
      default: "",
      fixed: "fixed bottom-0 w-full text-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface FooterProps extends HTMLAttributes<HTMLElement>, VariantProps<typeof footerVariants> {}

const Footer = forwardRef<HTMLElement, FooterProps>(({ variant, ...props }, ref) => {
  return (
    <footer className={clsx(footerVariants({ variant }), titillium_web.className)} ref={ref} {...props}>
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
          <Link className="flex items-center gap-1" href={"mailto:email@email.com"}>
            <IconMail size={27} />
            <span className="text-2xl">Contato</span>
          </Link>
        </Button>
      </div>
    </footer>
  );
});
Footer.displayName = "Footer";

export { Footer };
