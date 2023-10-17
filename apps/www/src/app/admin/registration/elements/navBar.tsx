"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NavBar = () => {
  const isComponents = usePathname() == "/admin/registration/components";

  return (
    <div className={"flex gap-3 p-5 pb-0"}>
      {isComponents ? (
        <>
          <h2 className={"-mb-1 text-3xl font-bold text-white"}>Criação de Componentes</h2>
          <Link href={"/admin/registration/forms"} className={"-mb-1 text-3xl font-bold text-white text-white/50 transition-all hover:text-white/80"}>
            Criação de Formulários
          </Link>
        </>
      ) : (
        <>
          <Link
            href={"/admin/registration/components"}
            className={"-mb-1 text-3xl font-bold text-white text-white/50 transition-all hover:text-white/80"}
          >
            Criação de Componentes
          </Link>
          <h2 className={"-mb-1 text-3xl font-bold text-white"}>Criação de Formulários</h2>
        </>
      )}
    </div>
  );
};

export { NavBar };
