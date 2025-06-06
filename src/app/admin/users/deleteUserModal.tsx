"use client";

import { IconAlertCircle } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";

import LoadingIcon from "../../../components/LoadingIcon";
import { useHelperCard } from "../../../components/context/helperCardContext";
import CustomModal from "../../../components/modal/customModal";
import {
  deleteUser,
  getUserContentAmount,
} from "../../../serverActions/userUtil";
import { TableUser } from "./usersClient";

const DeleteUserModal = ({
  isOpen,
  user,
  onOpenChange,
  updateTable,
}: {
  isOpen: boolean;
  user: TableUser | null;
  onOpenChange: (isOpen: boolean) => void;
  updateTable: () => void;
}) => {
  const helperCardContext = useHelperCard();
  const [userCreatedItems, setUserCreatedItems] = useState<{
    assessments: number;
    tallys: number;
  }>({ assessments: 0, tallys: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const handleDeleteUser = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const deleteUserResult = await deleteUser(user.id);
      if (deleteUserResult.statusCode === 200) {
        helperCardContext.setHelperCard({
          show: true,
          helperCardType: "CONFIRM",
          content:
            deleteUserResult.type === "DELETE" ?
              <>Usuário excluído!</>
            : <>Usuário desativado!</>,
        });
      } else if (deleteUserResult.statusCode === 401) {
        helperCardContext.setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Sem permissão para atualizar usuário!</>,
        });
      } else {
        helperCardContext.setHelperCard({
          show: true,
          helperCardType: "ERROR",
          content: <>Erro ao atualizar usuário!</>,
        });
      }

      updateTable();
      onOpenChange(false);
    } catch (e) {
      helperCardContext.setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao excluir usuário!</>,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetUserCreatedContent = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const userContent = await getUserContentAmount(user.id);
      setUserCreatedItems(userContent);
    } catch (e) {
      helperCardContext.setHelperCard({
        show: true,
        helperCardType: "ERROR",
        content: <>Erro ao obter dados do usuário!</>,
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, helperCardContext]);

  useEffect(() => {
    void handleGetUserCreatedContent();
  }, [handleGetUserCreatedContent]);

  return (
    <CustomModal
      isOpen={isOpen}
      title="Excluir usuário"
      subtitle={user?.email}
      confirmLabel="Excluir"
      confirmVariant="destructive"
      onOpenChange={onOpenChange}
      onConfirm={() => {
        void handleDeleteUser();
      }}
    >
      {(userCreatedItems.assessments > 0 || userCreatedItems.tallys > 0) &&
        !isLoading && (
          <div className="flex flex-col items-center text-lg text-red-500">
            <IconAlertCircle size={48} />
            <div>Atenção!</div>
            <div>{`Este usuário possui ${userCreatedItems.assessments} avaliações e ${userCreatedItems.tallys} contagens associadas. O usuário não será excluído, apenas desativado.`}</div>
            <div>{`Para excluir um usuário, é necessário excluir os conteúdos gerados por ele.`}</div>
            <div className="w-full text-black">Desativar usuário?</div>
          </div>
        )}
      {userCreatedItems.assessments === 0 &&
        userCreatedItems.tallys === 0 &&
        !isLoading && (
          <div className="flex flex-col">
            <div className="text-lg font-semibold">Excluir usuário?</div>
          </div>
        )}
      {isLoading && (
        <div className="flex justify-center text-lg">
          <LoadingIcon size={64} />
        </div>
      )}
    </CustomModal>
  );
};

export default DeleteUserModal;
