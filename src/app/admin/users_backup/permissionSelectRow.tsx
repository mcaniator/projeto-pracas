"use client";

import { Button } from "@components/button";
import { useHelperCard } from "@components/context/helperCardContext";
import { Role } from "@prisma/client";
import { IconHelp, IconSelector } from "@tabler/icons-react";
import {
  Button as Bu,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
} from "react-aria-components";

import { SystemSection, roles } from "./permissionsModal";

type SectionInfoValue = {
  title: string;
  viewer: string | null;
  editor: string | null;
  manager: string | null;
};

const sectionInfoMap = new Map<SystemSection, SectionInfoValue>([
  [
    "ASSESSMENT",
    {
      title: "Avaliações",
      viewer: "Pode visualizar as avaliações físicas finalizadas.",
      editor: "Pode realizar avaliações físicas, editá-las e excluí-las.",
      manager:
        "Pode realizar avaliações físicas, editá-las e excluí-las, além de editar e excluir qualquer avaliação.",
    },
  ],
  [
    "FORM",
    {
      title: "Formulários",
      viewer: "Pode visualizar formulários.",
      editor: "Pode criar formularios, editá-los e excluí-los.",
      manager:
        "Pode criar formulários, editá-los e excluí-los, além de editar e excluir qualquer formulário.",
    },
  ],
  [
    "PARK",
    {
      title: "Praças",
      viewer: "Pode visualizar praças.",
      editor: "Pode cadastrar e editar praças.",
      manager: "Pode cadastrar, editar e excluir praças.",
    },
  ],
  [
    "TALLY",
    {
      title: "Contagens",
      viewer: "Pode visualizar contagens finalizadas.",
      editor: "Pode realizar contagens, editá-las e excluí-las.",
      manager:
        "Pode realizar contagens, editá-las e excluí-las, além de editar e excluir qualquer contagem.",
    },
  ],
  [
    "USER",
    {
      title: "Usuários",
      viewer: "Pode visualizar usuários cadastrados.",
      editor: null,
      manager: "Pode gerenciar permissões e excluir usuários.",
    },
  ],
]);

const PermissionSelectRow = ({
  title,
  section,
  userRoles,
  darkBackground,
  parkRoleWarning,
  handleSetUserRoles,
}: {
  title: string;
  section: SystemSection;
  darkBackground: boolean;
  userRoles: { section: SystemSection; role: string | null }[];
  parkRoleWarning: boolean;
  handleSetUserRoles: (section: SystemSection, role: string | null) => void;
}) => {
  const helperCardContext = useHelperCard();
  const showInfo = () => {
    helperCardContext.setHelperCard({
      show: true,
      helperCardType: "INFO",
      customTimeout: 20000,
      content: (
        <div className="flex w-full flex-col justify-start gap-1">
          <h1 className="font-bold">{sectionInfoMap.get(section)?.title}</h1>
          <div className="flex w-full flex-col items-start">
            <span>
              <span className="font-bold">Visualizador: </span>
              {sectionInfoMap.get(section)?.viewer ?? "-"}
            </span>
            <span>
              <span className="font-bold">Editor: </span>
              {sectionInfoMap.get(section)?.editor ?? "-"}
            </span>
            <span>
              <span className="font-bold">Administrador: </span>
              {sectionInfoMap.get(section)?.manager ?? "-"}
            </span>
          </div>
        </div>
      ),
    });
  };
  return (
    <div
      className={`flex items-center justify-between rounded-sm p-1 ${darkBackground ? "bg-gray-400/70" : "bg-gray-400/50"} ${parkRoleWarning && section === "PARK" ? "outline outline-2 outline-red-500" : ""}`}
    >
      <span>{title}</span>
      <div className="flex items-center justify-end">
        <Select
          selectedKey={
            userRoles.find((userRole) => userRole.section === section)?.role
          }
          onSelectionChange={(e) => {
            const role = e === "NONE" ? null : (e as string);
            handleSetUserRoles(section, role);
          }}
          className={`${
            roles.find(
              (role) =>
                role.section === section &&
                role.value ===
                  (userRoles.find((role) => role.section === section)
                    ?.role as Role),
            )?.color ?? "bg-gray-400/50"
          } appearance-none rounded-lg border-2 border-off-white/80 px-3 py-1 text-lg shadow-md`}
        >
          <Bu>
            <SelectValue>
              {({ defaultChildren, isPlaceholder }) => {
                return isPlaceholder ? <>Nenhuma</> : defaultChildren;
              }}
            </SelectValue>
            <span aria-hidden="true">
              <IconSelector className="inline" />
            </span>
          </Bu>
          <Popover>
            <ListBox>
              {roles
                .filter((role) => role.section === section)
                .map((role, index) => (
                  <ListBoxItem
                    key={index}
                    id={role.value ?? "NONE"}
                    className={`${role.color} cursor-pointer`}
                  >
                    {role.name}
                  </ListBoxItem>
                ))}
            </ListBox>
          </Popover>
        </Select>
        <Button
          className="px-2 text-black"
          variant={"ghost"}
          onPress={showInfo}
        >
          <IconHelp />
        </Button>
      </div>
    </div>
  );
};

export default PermissionSelectRow;
