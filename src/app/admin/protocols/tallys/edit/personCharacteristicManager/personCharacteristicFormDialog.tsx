"use client";

import CTextField from "@/components/ui/cTextField";
import CDialog from "@/components/ui/dialog/cDialog";
import DynamicIconPicker from "@/components/ui/dynamicIcon/dynamicIconPicker";
import { useSavePersonCharacteristic } from "@/lib/serverFunctions/apiCalls/personCharacteristic";
import { useEffect, useState } from "react";

import type {
  PersonCharacteristic,
  PersonCharacteristicGroup,
} from "./types";

const PersonCharacteristicFormDialog = ({
  group,
  characteristic,
  open,
  onClose,
  onSaved,
  onRequestDelete,
}: {
  group: PersonCharacteristicGroup | null;
  characteristic: PersonCharacteristic | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  onRequestDelete: () => void;
}) => {
  const isEditing = !!characteristic;
  const [name, setName] = useState("");
  const [iconKey, setIconKey] = useState<string | null>(null);
  const [color, setColor] = useState("#648A4B");

  const [savePersonCharacteristic, isSaving] = useSavePersonCharacteristic({
    callbacks: {
      onSuccess: () => {
        onSaved();
        onClose();
      },
    },
  });

  useEffect(() => {
    if (!open) return;
    setName(characteristic?.name ?? "");
    setIconKey(characteristic?.iconKey ?? null);
    setColor(characteristic?.color ?? "#648A4B");
  }, [characteristic, open]);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      fullScreen
      title={isEditing ? "Editar característica" : "Criar característica"}
      confirmChildren={isEditing ? "Salvar" : "Criar"}
      cancelChildren={isEditing ? "Excluir" : undefined}
      cancelColor="error"
      confirmLoading={isSaving}
      disableConfirmButton={!group || !name.trim() || !iconKey || isSaving}
      onCancel={() => {
        if (isEditing) {
          onClose();
          onRequestDelete();
          return;
        }
        onClose();
      }}
      onConfirm={() => {
        if (!group || !iconKey) return;
        void savePersonCharacteristic({
          data: {
            personCharacteristicId: characteristic?.id,
            personCharacteristicGroupId: group.id,
            name,
            iconKey,
            color,
          },
          projectOptions: { loadingMessage: "Salvando característica..." },
        });
      }}
    >
      <div className="flex h-full flex-col gap-4">
        <CTextField label="Grupo" value={group?.title ?? ""} readOnly />
        <CTextField
          label="Nome"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <CTextField
          label="Cor"
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
        />
        <DynamicIconPicker selectedIconKey={iconKey} onChange={setIconKey} />
      </div>
    </CDialog>
  );
};

export default PersonCharacteristicFormDialog;
