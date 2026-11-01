"use client";

import CSwitch from "@/components/ui/cSwtich";
import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import { useSavePersonCharacteristicGroup } from "@/lib/serverFunctions/apiCalls/personCharacteristic";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";

import type { PersonCharacteristicGroup } from "./types";

const PersonCharacteristicGroupFormDialog = ({
  group,
  open,
  onClose,
  onSaved,
  onRequestDelete,
}: {
  group: PersonCharacteristicGroup | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onRequestDelete: () => void;
}) => {
  const isEditing = !!group;
  const [title, setTitle] = useState("");
  const [isTagGroup, setIsTagGroup] = useState(false);

  const [savePersonCharacteristicGroup, isSaving] =
    useSavePersonCharacteristicGroup({
      callbacks: {
        onSuccess: () => {
          onSaved();
          onClose();
        },
      },
    });

  useEffect(() => {
    if (!open) return;
    setTitle(group?.title ?? "");
    setIsTagGroup(group?.isTagGroup ?? false);
  }, [group, open]);

  const handleCancel = () => {
    if (isEditing) {
      onClose();
      onRequestDelete();
      return;
    }

    onClose();
  };

  return (
    <CDialog
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar grupo" : "Criar grupo"}
      confirmChildren={<IconCheck />}
      cancelChildren={isEditing ? <IconTrash /> : undefined}
      cancelColor={isEditing ? "error" : "primary"}
      disableConfirmButton={!title.trim() || isSaving}
      confirmLoading={isSaving}
      onCancel={handleCancel}
      onConfirm={() => {
        void savePersonCharacteristicGroup({
          data: {
            personCharacteristicGroupId: group?.id,
            title,
            isTagGroup,
          },
          projectOptions: { loadingMessage: "Salvando grupo..." },
        });
      }}
    >
      <div className="flex flex-col gap-4">
        {isEditing && (
          <p className="text-sm text-gray-700">
            Alterações no nome serão refletidas nos protocolos que usam este
            grupo.
          </p>
        )}
        <CTextField
          label="Título"
          required
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <CSwitch
          checked={isTagGroup}
          disabled={isEditing}
          label="Grupo de tags"
          onChange={(_, checked) => setIsTagGroup(checked)}
        />
        <p className="text-sm text-gray-700">
          Desativado: cada pessoa recebe obrigatoriamente uma única
          característica. Ativado: cada pessoapode receber nenhuma, uma ou
          várias tags.
        </p>
      </div>
    </CDialog>
  );
};

export default PersonCharacteristicGroupFormDialog;
