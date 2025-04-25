import { Features } from "@prisma/client";
import { IconX } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";

import LoadingIcon from "../../../components/LoadingIcon";
import { Button } from "../../../components/button";
import { Checkbox } from "../../../components/ui/checkbox";
import { updateUsersPermissions } from "../../../serverActions/userUtil";
import { TableUser } from "./usersClient";

const permissionsNamesMap = new Map<Features, string>([
  ["ASSESSMENT_VIEW", "Ver avaliações físicas"],
  ["ASSESSMENT_CREATE", "Criar avaliações físicas"],
  ["ASSESSMENT_EDIT_ANY", "Editar qualquer avaliação física"],
  ["ASSESSMENT_DELETE_ANY", "Excluir qualquer avaliação física"],
  ["ASSESSMENT_EDIT_OWN", "Editar as próprias avaliações físicas"],
  ["ASSESSMENT_DELETE_OWN", "Excluir as próprias avaliações físicas"],
  ["TALLY_VIEW", "Ver contagens"],
  ["TALLY_CREATE", "Criar contagens"],
  ["TALLY_EDIT_ANY", "Editar qualquer contagem"],
  ["TALLY_DELETE_ANY", "Excluir qualquer contagem"],
  ["TALLY_EDIT_OWN", "Editar as próprias contagens"],
  ["TALLY_DELETE_OWN", "Excluir as próprias contagens"],
  ["FORM_VIEW", "Ver questões e formulários."],
  ["FORM_CREATE", "Criar questões e formulários"],
  ["FORM_DELETE", "Excluir questões e formulários"],
  ["PARK_CREATE", "Cadastrar praças"],
  ["PARK_EDIT", "Editar praças"],
  ["PARK_DELETE", "Excluir praças"],
  ["PERMISSION_MANAGE", "Gerenciar permissões de usuários"],
  ["USER_DELETE", "Excluir usuários"],
]);

const PermissionsModal = ({
  isOpen,
  onOpenChange,
  user,
  updateTable,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: TableUser | null;
  updateTable: () => void;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [permissions, setPermissions] = useState(
    Array.from(permissionsNamesMap).map(([key, value]) => ({
      feature: key,
      name: value,
      checked: false,
    })),
  );
  const initialPermissions = useRef<Features[]>([]);
  const changedPermissions = useRef<
    {
      feature: Features;
      removed: boolean;
    }[]
  >([]);
  const handlePermissionChange = (feature: Features) => {
    const isInitial = initialPermissions.current.includes(feature);
    if (isInitial) {
      const removed = permissions.some(
        (p) => p.feature === feature && p.checked,
      );
      const isInChangedPermissions = changedPermissions.current.some(
        (p) => p.feature === feature,
      );
      if (isInChangedPermissions) {
        changedPermissions.current = changedPermissions.current.filter(
          (p) => p.feature !== feature,
        );
      } else {
        if (removed) {
          changedPermissions.current.push({ feature, removed: true });
        } else {
          changedPermissions.current.push({ feature, removed: false });
        }
      }
    }
    setPermissions((prev) => {
      return prev.map((p) => {
        if (p.feature !== feature) {
          return p;
        } else {
          return { ...p, checked: !p.checked };
        }
      });
    });
  };
  const handleUpdatePermissions = async () => {
    if (!user) return;
    setIsLoading(true);
    await updateUsersPermissions(user.id, changedPermissions.current);
    updateTable();
    setIsLoading(false);
    onOpenChange(false);
  };
  useEffect(() => {
    if (!user) {
      return;
    }
    initialPermissions.current = Array.from(permissionsNamesMap).map(
      ([key]) => key,
    );
    changedPermissions.current = [];
    setPermissions(
      Array.from(permissionsNamesMap).map(([key, value]) => ({
        feature: key,
        name: value,
        checked: user.permissions.some(
          (permission) => permission.feature === key,
        ),
      })),
    );
  }, [user]);
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={({ isEntering, isExiting }) =>
        `fixed inset-0 z-50 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur ${
          isEntering ? "duration-300 ease-out animate-in fade-in" : ""
        } ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""}`
      }
      isDismissable
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
                  Permissões
                </h4>
                <Button
                  className="ml-auto text-black"
                  variant={"ghost"}
                  size={"icon"}
                  onPress={() => {
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
              {user && !isLoading ?
                <div className="flex w-full flex-col">
                  <h5 className="text-base font-semibold sm:text-xl">
                    {user.email}
                  </h5>
                  {permissions.map((permission, index) => {
                    return (
                      <div key={index} className="flex flex-row">
                        <Checkbox
                          value={permission.feature}
                          checked={permission.checked}
                          onChange={(e) => {
                            handlePermissionChange(e.target.value as Features);
                          }}
                        />
                        <span>{permission.name}</span>
                      </div>
                    );
                  })}
                </div>
              : <></>}
              <div className="mt-auto flex justify-end pt-5">
                <Button
                  variant={"constructive"}
                  onPress={() => {
                    void handleUpdatePermissions();
                  }}
                  className={"w-24 transition-all"}
                >
                  Salvar
                </Button>
              </div>
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};

export default PermissionsModal;
