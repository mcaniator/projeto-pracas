"use client";

import { ReactNode, useEffect, useRef } from "react";
import { titillium_web } from "@/app/fonts";
import { cn } from "@/lib/utils";

const HomeHeader = ({ children }: { children: ReactNode }) => {
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    const getPosition = () => {
      if (header.current != null) {
        if (window.scrollY > window.innerHeight * 0.85) {
          header.current.style.color = "black";
          console.log(window.innerHeight);

          if (window.innerWidth < 1024)
            header.current.style.backgroundColor = "rgb(255 255 255 / 0.3)";
        } else {
          header.current.style.color = "white";

          if (window.innerWidth < 1024)
            header.current.style.backgroundColor = "rgb(0 0 0 / 0.3)";
        }

        if (window.innerWidth >= 1024)
          header.current.style.backgroundColor = "";
      }
    };

    getPosition();

    addEventListener("scroll", getPosition);
    addEventListener("resize", getPosition);

    return () => {
      removeEventListener("scroll", getPosition);
      removeEventListener("resize", getPosition);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed z-20 flex w-full  bg-black/30 px-7 py-5 text-white backdrop-blur-[2px] transition-all lg:bg-transparent lg:bg-opacity-0 lg:backdrop-blur-none",
        titillium_web.className,
      )}
      ref={header}
    >
      {children}
    </header>
  );
};

export default HomeHeader;
