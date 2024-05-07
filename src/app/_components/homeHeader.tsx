"use client";

import { Header } from "@/app/_components/header";
import { User } from "lucia";
import { useEffect, useRef } from "react";

const HomeHeader = ({ user }: { user: User | null }) => {
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    const getPosition = () => {
      if (header.current == null) return;

      if (window.scrollY > window.innerHeight * 0.85) {
        header.current.style.color = "black";

        if (window.innerWidth < 1024)
          header.current.style.backgroundColor = "rgb(255 255 255 / 0.3)";
      } else {
        header.current.style.color = "white";

        if (window.innerWidth < 1024)
          header.current.style.backgroundColor = "rgb(0 0 0 / 0.3)";
      }

      if (window.innerWidth >= 1024) header.current.style.backgroundColor = "";
    };

    getPosition();

    addEventListener("scroll", getPosition);
    addEventListener("resize", getPosition);

    return () => {
      removeEventListener("scroll", getPosition);
      removeEventListener("resize", getPosition);
    };
  }, []);

  return <Header variant={"default"} user={user} ref={header} />;
};

export { HomeHeader };
