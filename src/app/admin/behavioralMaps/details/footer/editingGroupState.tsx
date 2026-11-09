"use client";

import CButton from "@/components/ui/cButton";
import CTextField from "@/components/ui/cTextField";
import { IconArrowLeft, IconTrash } from "@tabler/icons-react";

const EditingGroupState = ({
  label,
  onLabelChange,
  onBack,
  onDelete,
}: {
  label: string;
  onLabelChange: (value: string) => void;
  onBack: () => void;
  onDelete: () => void;
}) => (
  <>
    <div className="min-h-0 flex-1 overflow-auto p-3">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <h2 className="text-lg font-semibold">Grupo selecionado</h2>
        <CTextField
          label="Nome do grupo"
          value={label}
          required
          onChange={(event) => onLabelChange(event.target.value)}
        />
      </div>
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-gray-300 p-3">
      <CButton onClick={onBack}>
        <IconArrowLeft />
        Voltar
      </CButton>
      <CButton color="error" onClick={onDelete}>
        <IconTrash />
        Excluir
      </CButton>
    </div>
  </>
);

export default EditingGroupState;
