import { Role } from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";

import LoadingIcon from "../../../../components/LoadingIcon";
import { Button } from "../../../../components/button";
import { useHelperCard } from "../../../../components/context/helperCardContext";
import { Input } from "../../../../components/ui/input";
import { createInvite } from "../../../../serverActions/inviteUtil";
import PermissionSelectRow from "../permissionSelectRow";
import { Invite } from "./invitesClient";

type SystemSection = "PARK" | "FORM" | "ASSESSMENT" | "TALLY" | "USER";

const warningColors = {
  none: "bg-gray-400 hover:bg-gray-500",
  level0: "bg-white hover:bg-gray-100",
  level1: "bg-yellow-500 hover:bg-yellow-600",
  level2: "bg-orange-600 hover:bg-orange-700",
  level3: "bg-red-500 hover:bg-red-600",
};

const roles = [
  {
    section: "PARK",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "PARK",
    name: "Visualizador",
    value: "PARK_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "PARK",
    name: "Editor",
    value: "PARK_EDITOR",
    color: warningColors.level2,
  },
  {
    section: "PARK",
    name: "Administrador",
    value: "PARK_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "FORM",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "FORM",
    name: "Visualizador",
    value: "FORM_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "FORM",
    name: "Editor",
    value: "FORM_EDITOR",
    color: warningColors.level2,
  },
  {
    section: "FORM",
    name: "Administrador",
    value: "FORM_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "ASSESSMENT",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "ASSESSMENT",
    name: "Visualizador",
    value: "ASSESSMENT_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "ASSESSMENT",
    name: "Editor",
    value: "ASSESSMENT_EDITOR",
    color: warningColors.level2,
  },
  {
    section: "ASSESSMENT",
    name: "Administrador",
    value: "ASSESSMENT_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "TALLY",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "TALLY",
    name: "Visualizador",
    value: "TALLY_VIEWER",
    color: warningColors.level1,
  },
  {
    section: "TALLY",
    name: "Editor",
    value: "TALLY_EDITOR",
    color: warningColors.level2,
  },
  {
    section: "TALLY",
    name: "Administrador",
    value: "TALLY_MANAGER",
    color: warningColors.level3,
  },
  {
    section: "USER",
    name: "Nenhuma",
    value: null,
    color: warningColors.none,
  },
  {
    section: "USER",
    name: "Visualizador",
    value: "USER_VIEWER",
    color: warningColors.level2,
  },
  {
    section: "USER",
    name: "Administrador",
    value: "USER_MANAGER",
    color: warningColors.level3,
  },
];

const rows: { title: string; section: SystemSection }[] = [
  {
    title: "Praças",
    section: "PARK",
  },
  {
    title: "Formulários",
    section: "FORM",
  },
  {
    title: "Avaliações físicas",
    section: "ASSESSMENT",
  },
  {
    title: "Contagens",
    section: "TALLY",
  },
  {
    title: "Usuários",
    section: "USER",
  },
];

const InviteModal = ({
  isOpen,
  onOpenChange,
  invite,
  updateTable,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  invite: Invite | null;
  updateTable: () => void;
}) => {
  const helperCardContext = useHelperCard();
  const [isLoading, setIsLoading] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteCreated, setNewInviteCreated] = useState(false);
  const [parkRoleWarning, setParkRoleWarning] = useState(false);
  const [newInvite, setNewInvite] = useState<Invite | null>(null);
  const [userRoles, setUserRoles] = useState<
    { section: SystemSection; role: string | null }[]
  >([
    {
      section: "ASSESSMENT",
      role:
        invite?.roles.find(
          (r) =>
            r === "ASSESSMENT_MANAGER" ||
            r === "ASSESSMENT_EDITOR" ||
            r === "ASSESSMENT_VIEWER",
        ) ?? null,
    },
    {
      section: "FORM",
      role:
        invite?.roles.find(
          (r) =>
            r === "FORM_MANAGER" || r === "FORM_EDITOR" || r === "FORM_VIEWER",
        ) ?? null,
    },
    {
      section: "PARK",
      role:
        invite?.roles.find(
          (r) =>
            r === "PARK_MANAGER" || r === "PARK_EDITOR" || r === "PARK_VIEWER",
        ) ?? null,
    },
    {
      section: "TALLY",
      role:
        invite?.roles.find(
          (r) =>
            r === "TALLY_MANAGER" ||
            r === "TALLY_EDITOR" ||
            r === "TALLY_VIEWER",
        ) ?? null,
    },
    {
      section: "USER",
      role:
        invite?.roles.find(
          (r) => r === "USER_MANAGER" || r === "USER_VIEWER",
        ) ?? null,
    },
  ]);

  const handleSetUserRoles = (section: SystemSection, role: string | null) => {
    setUserRoles((prev) =>
      prev.map((p) => {
        if (p.section !== section) {
          return p;
        } else {
          return {
            section: section,
            role: role,
          };
        }
      }),
    );
  };

  const resetModal = () => {
    setNewInviteEmail("");
    setNewInviteCreated(false);
    setParkRoleWarning(false);
    setUserRoles([
      {
        section: "ASSESSMENT",
        role: null,
      },
      {
        section: "FORM",
        role: null,
      },
      {
        section: "PARK",
        role: null,
      },
      {
        section: "TALLY",
        role: null,
      },
      {
        section: "USER",
        role: null,
      },
    ]);
  };

  const handleUpdateUserRoles = async () => {
    const userRolesFiltered = userRoles.filter((ur) => ur.role);

    if (userRolesFiltered.length === 0) {
      helperCardContext.setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Selecione ao menos uma permissão!</>,
      });
      return;
    }
    if (
      userRolesFiltered.length > 0 &&
      !userRoles.some(
        (ur) =>
          ur.role === "PARK_VIEWER" ||
          ur.role === "PARK_EDITOR" ||
          ur.role === "PARK_MANAGER",
      )
    ) {
      setParkRoleWarning(true);
      return;
    }
    setIsLoading(true);
    try {
      if (!invite) {
        const inviteReturn = await createInvite(
          newInviteEmail,
          userRoles
            .filter((ur) => ur.role !== null)
            .map((ur) => ur.role as Role),
        );
        if (!inviteReturn) {
          throw new Error("Erro ao criar convite");
        }
        setNewInvite(inviteReturn);
      }

      helperCardContext.setHelperCard({
        show: true,
        helperCardType: "CONFIRM",
        content: <>Convite criado!</>,
      });
    } catch (e) {
      helperCardContext.setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao criar convite!</>,
      });
      return;
    } finally {
      setParkRoleWarning(false);
      updateTable();
      setIsLoading(false);
      if (!invite) {
        setNewInviteCreated(true);
      }
      //onOpenChange(false);
    }
  };

  useEffect(() => {
    setUserRoles([
      {
        section: "ASSESSMENT",
        role:
          invite?.roles.find(
            (r) =>
              r === "ASSESSMENT_MANAGER" ||
              r === "ASSESSMENT_EDITOR" ||
              r === "ASSESSMENT_VIEWER",
          ) ?? null,
      },
      {
        section: "FORM",
        role:
          invite?.roles.find(
            (r) =>
              r === "FORM_MANAGER" ||
              r === "FORM_EDITOR" ||
              r === "FORM_VIEWER",
          ) ?? null,
      },
      {
        section: "PARK",
        role:
          invite?.roles.find(
            (r) =>
              r === "PARK_MANAGER" ||
              r === "PARK_EDITOR" ||
              r === "PARK_VIEWER",
          ) ?? null,
      },
      {
        section: "TALLY",
        role:
          invite?.roles.find(
            (r) =>
              r === "TALLY_MANAGER" ||
              r === "TALLY_EDITOR" ||
              r === "TALLY_VIEWER",
          ) ?? null,
      },
      {
        section: "USER",
        role:
          invite?.roles.find(
            (r) => r === "USER_MANAGER" || r === "USER_VIEWER",
          ) ?? null,
      },
    ]);
  }, [invite]);

  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={({ isEntering, isExiting }) =>
        `fixed inset-0 z-40 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-0 text-center backdrop-blur ${
          isEntering ? "duration-300 ease-out animate-in fade-in" : ""
        } ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""}`
      }
    >
      <Modal
        className={({ isEntering, isExiting }) =>
          `mb-auto mt-auto w-[90%] max-w-lg overflow-auto rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
            isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
          } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}`
        }
      >
        <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
          {({ close }) => (
            <div className="flex flex-col gap-2">
              <div className="flex">
                <h4 className="text-2xl font-semibold sm:text-4xl">
                  {invite ? "Editar convite" : "Criar convite"}
                </h4>
                <Button
                  className="ml-auto text-black"
                  variant={"ghost"}
                  size={"icon"}
                  onPress={() => {
                    resetModal();
                    close();
                  }}
                >
                  <IconX />
                </Button>
              </div>
              {isLoading && (
                <div className="flex items-center justify-center">
                  <LoadingIcon className="h-32 w-32" />
                </div>
              )}
              {!isLoading && !newInviteCreated ?
                <div className="flex w-full flex-col">
                  <h5 className="text-base font-semibold sm:text-xl">
                    {invite ? invite.email : "Convites são válidos por 15 dias"}
                  </h5>
                  <div className="mt-2 flex flex-col gap-2">
                    <div>
                      <label htmlFor="email">E-mail</label>
                      <Input
                        className="w-full"
                        id="email"
                        type="email"
                        value={newInviteEmail}
                        onChange={(e) => {
                          setNewInviteEmail(e.target.value);
                        }}
                      />
                    </div>
                    <div>
                      {rows.map((row, index) => (
                        <PermissionSelectRow
                          key={index}
                          title={row.title}
                          section={row.section}
                          userRoles={userRoles}
                          darkBackground={index % 2 !== 0}
                          parkRoleWarning={parkRoleWarning}
                          handleSetUserRoles={handleSetUserRoles}
                        />
                      ))}
                    </div>
                  </div>

                  {parkRoleWarning && (
                    <p className="py-1 text-red-500">
                      É necessário ter ao menos permissão de visualizador de
                      praças para ter acesso a outras permissões
                    </p>
                  )}
                </div>
              : <></>}
              {!isLoading && newInviteCreated && (
                <div className="flex w-full flex-col">
                  <h5 className="text-base font-semibold sm:text-xl">
                    {"Convite criado!"}
                  </h5>
                  <div className="flex flex-col gap-2">
                    <span>E-mail: {newInvite?.email}</span>
                    <span>
                      Link de registro: /register?inviteToken={newInvite?.token}
                    </span>
                    <span>
                      Válido até:{" "}
                      {newInvite?.expiresAt.toLocaleString("pt-BR", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              )}
              {!newInviteCreated && (
                <div className="mt-auto flex justify-end pt-5">
                  <Button
                    variant={"constructive"}
                    onPress={() => {
                      void handleUpdateUserRoles();
                    }}
                    className={"w-24 transition-all"}
                  >
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};

export default InviteModal;
export { roles };
export type { SystemSection };
