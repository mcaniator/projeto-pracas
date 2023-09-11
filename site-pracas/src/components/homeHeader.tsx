"use client";

import { useEffect, useRef } from "react";
import Header from "./header";

const HomeHeader = () => {
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
    <Header
      ref={header}
      className="z-20 bg-black/30  backdrop-blur-[2px] lg:bg-transparent lg:bg-opacity-0 lg:backdrop-blur-none"
    />
  );
};

export default HomeHeader;
