import LoadingIcon from "@components/LoadingIcon";
import { Button } from "@components/button";
import { useHelperCard } from "@components/context/helperCardContext";
import { Input } from "@components/ui/input";
import { Role } from "@prisma/client";
import { _createInvite, _updateInvite } from "@serverActions/inviteUtil";
import { IconClipboard, IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";

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

const InviteCRUDModal = ({
  isOpen,
  onOpenChange,
  inviteProp,
  updateTable,
  openInviteDeletionModal,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  inviteProp: Invite | null;
  updateTable: () => void;
  openInviteDeletionModal: () => void;
}) => {
  const helperCardContext = useHelperCard();
  const [isLoading, setIsLoading] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [parkRoleWarning, setParkRoleWarning] = useState(false);
  const [invite, setInvite] = useState<Invite | null>(null);
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
          (r) => r === "FORM_MANAGER" || r === "FORM_VIEWER",
        ) ?? null,
    },
    {
      section: "PARK",
      role:
        invite?.roles.find(
          (r) => r === "PARK_MANAGER" || r === "PARK_VIEWER",
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
    setParkRoleWarning(false);
    if (invite) return;
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
        (ur) => ur.role === "PARK_VIEWER" || ur.role === "PARK_MANAGER",
      )
    ) {
      setParkRoleWarning(true);
      return;
    }
    setIsLoading(true);
    try {
      if (!invite) {
        const inviteReturn = await _createInvite(
          newInviteEmail,
          userRoles
            .filter((ur) => ur.role !== null)
            .map((ur) => ur.role as Role),
        );
        if (inviteReturn.statusCode === 201) {
          setInvite(inviteReturn.invite);
          helperCardContext.setHelperCard({
            show: true,
            helperCardType: "CONFIRM",
            content: <>Convite criado!</>,
          });
        } else if (inviteReturn.statusCode === 401) {
          helperCardContext.setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Sem permissão para criar convites!</>,
          });
        } else {
          helperCardContext.setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Erro ao criar convite!</>,
          });
        }
      } else {
        const result = await _updateInvite(
          invite.token,
          userRoles
            .filter((ur) => ur.role !== null)
            .map((ur) => ur.role as Role),
        );
        if (result.statusCode === 200) {
          helperCardContext.setHelperCard({
            show: true,
            helperCardType: "CONFIRM",
            content: <>Convite atualizado!</>,
          });
        } else if (result.statusCode === 401) {
          helperCardContext.setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Sem permissão para atualizar convites!</>,
          });
        } else {
          helperCardContext.setHelperCard({
            show: true,
            helperCardType: "ERROR",
            content: <>Erro ao atualizar convite!</>,
          });
        }
      }
    } catch (e) {
      helperCardContext.setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao atualizar convite!</>,
      });
      return;
    } finally {
      setParkRoleWarning(false);
      updateTable();
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setInvite(inviteProp);
  }, [inviteProp, isOpen]);
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
            (r) => r === "FORM_MANAGER" || r === "FORM_VIEWER",
          ) ?? null,
      },
      {
        section: "PARK",
        role:
          invite?.roles.find(
            (r) => r === "PARK_MANAGER" || r === "PARK_VIEWER",
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
              {!isLoading && (
                <div className="flex w-full flex-col">
                  <h5 className="text-base font-semibold sm:text-xl">
                    {invite ? invite.email : "Convites são válidos por 15 dias"}
                  </h5>
                  <div className="mt-2 flex flex-col gap-2">
                    {!invite && (
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
                    )}

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
              )}
              <div className={`mt-auto flex flex-col gap-2 pt-5`}>
                {invite && (
                  <Button
                    onPress={() => {
                      void navigator.clipboard.writeText(
                        `${process.env.BASE_URL}/auth/register?inviteToken=${invite?.token}`,
                      );
                      helperCardContext.setHelperCard({
                        show: true,
                        helperCardType: "CONFIRM",
                        content: <>Link copiado!</>,
                      });
                    }}
                  >
                    <IconClipboard className="mb-1" />
                    Clique para copiar o link de registro
                  </Button>
                )}

                <div
                  className={`flex ${invite ? "justify-between" : "justify-end"}`}
                >
                  {invite && (
                    <Button
                      variant={"destructive"}
                      onPress={() => {
                        void openInviteDeletionModal();
                      }}
                    >
                      Excluir
                    </Button>
                  )}
                  <Button
                    variant={invite ? "default" : "constructive"}
                    onPress={() => {
                      void handleUpdateUserRoles();
                    }}
                    className={"w-24 transition-all"}
                  >
                    {invite ? "Atualizar" : "Salvar"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};

export default InviteCRUDModal;
export { roles };
export type { SystemSection };
