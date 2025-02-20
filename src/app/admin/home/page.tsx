"use server";

import {
  IconFountain,
  IconListCheck,
  IconLogs,
  IconMap,
  IconTableExport,
} from "@tabler/icons-react";
import Link from "next/link";

const AdminRoot = () => {
  return (
    <div
      className={
        "flex h-full flex-col items-center overflow-auto text-center text-white"
      }
    >
      <h2 className="p-2 text-4xl font-semibold">
        Bem vindo(a) ao Projeto praças
      </h2>
      <div className="flex flex-wrap justify-center gap-2 sm:mt-24">
        <Link
          href="parks"
          className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
        >
          <IconFountain className="mb-1" size={34} />
          Praças
        </Link>
        <Link
          href="map"
          className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
        >
          <IconMap className="mb-1" size={34} />
          Mapa
        </Link>
        <Link
          href="registration"
          className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
        >
          <IconListCheck className="mb-1" size={34} />
          Formulários
        </Link>
        <Link
          href="registration"
          className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
        >
          <IconTableExport className="mb-1" size={34} />
          Exportar
        </Link>
        <Link
          href="activity"
          className="flex w-64 items-center justify-center rounded-lg bg-true-blue p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-indigo-dye"
        >
          <IconLogs className="mb-1" size={34} />
          Atividade
        </Link>
      </div>
    </div>
  );
};

export default AdminRoot;
