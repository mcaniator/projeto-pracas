"use client";

import PermissionGuard from "@components/auth/permissionGuard";
import {
  IconFountain,
  IconListCheck,
  IconLogs,
  IconMap,
  IconTableExport,
  IconUserCog,
} from "@tabler/icons-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useHelperCard } from "../../../components/context/helperCardContext";

const AdminRoot = () => {
  const { setHelperCard } = useHelperCard();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("permissionDenied") === "true") {
      setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Permissão negada</>,
      });
    }
  });

  return (
    <div
      className={
        "flex h-full flex-col items-center justify-center overflow-auto text-center sm:pb-[102px]"
      }
    >
      <h2 className="p-2 text-4xl font-semibold">
        Bem vindo(a) ao Projeto praças
      </h2>
      <div className="flex flex-wrap justify-center gap-2 sm:mt-24">
        <Link
          href="parks"
          className="flex w-64 items-center justify-center rounded-lg bg-sky-500/70 p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-sky-900"
        >
          <IconFountain className="mb-1" size={34} />
          Praças
        </Link>
        <Link
          href="map"
          className="flex w-64 items-center justify-center rounded-lg bg-sky-500/70 p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-sky-900"
        >
          <IconMap className="mb-1" size={34} />
          Mapa
        </Link>

        <PermissionGuard requiresAnyRoleGroups={["FORM"]}>
          <Link
            href="registration/questions"
            className="flex w-64 items-center justify-center rounded-lg bg-sky-500/70 p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-sky-900"
          >
            <IconListCheck className="mb-1" size={34} />
            Formulários
          </Link>
        </PermissionGuard>

        <Link
          href="export"
          className="flex w-64 items-center justify-center rounded-lg bg-sky-500/70 p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-sky-900"
        >
          <IconTableExport className="mb-1" size={34} />
          Exportar
        </Link>
        <PermissionGuard requiresAnyRoleGroups={["ASSESSMENT", "TALLY"]}>
          <Link
            href="activity"
            className="flex w-64 items-center justify-center rounded-lg bg-sky-500/70 p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-sky-900"
          >
            <IconLogs className="mb-1" size={34} />
            Atividade
          </Link>
        </PermissionGuard>
        <PermissionGuard requiresAnyRoleGroups={["USER"]}>
          <Link
            href="users"
            className="flex w-64 items-center justify-center rounded-lg bg-sky-500/70 p-4 text-3xl bg-blend-darken shadow-md transition-all duration-200 hover:bg-sky-900"
          >
            <IconUserCog className="mb-1" size={34} />
            Usuários
          </Link>
        </PermissionGuard>
      </div>
    </div>
  );
};

export default AdminRoot;
