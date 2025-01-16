"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const isComponents = usePathname() == "/admin/registration/questions";

  return (
    <div className={"flex gap-3 p-2"}>
      {isComponents ?
        <>
          <h2 className={"-mb-1 text-2xl font-bold text-white sm:text-3xl"}>
            Questões
          </h2>
          <Link
            href={"/admin/registration/forms"}
            className={
              "-mb-1 text-2xl font-bold text-white text-white/50 transition-all hover:text-white/80 sm:text-3xl"
            }
          >
            Formulários
          </Link>
        </>
      : <>
          <Link
            href={"/admin/registration/questions"}
            className={
              "-mb-1 text-2xl font-bold text-white text-white/50 transition-all hover:text-white/80 sm:text-3xl"
            }
          >
            Questões
          </Link>
          <h2 className={"-mb-1 text-2xl font-bold text-white sm:text-3xl"}>
            Formulários
          </h2>
        </>
      }
    </div>
  );
};

export { NavBar };
