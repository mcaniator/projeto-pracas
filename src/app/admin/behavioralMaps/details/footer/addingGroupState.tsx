"use client";

import CButton from "@/components/ui/cButton";
import CTextField from "@/components/ui/cTextField";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

const AddingGroupState = ({
  label,
  selectedCount,
  onLabelChange,
  onCancel,
  onConfirm,
}: {
  label: string;
  selectedCount: number;
  onLabelChange: (value: string) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <>
    <div className="min-h-0 flex-1 overflow-auto p-3">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <h2 className="text-lg font-semibold">Criar grupo</h2>
        <p className="text-sm text-gray-600">
          Selecione no mapa as observações que farão parte deste grupo.{" "}
          {selectedCount} selecionada(s).
        </p>
        <CTextField
          label="Nome do grupo"
          value={label}
          required
          onChange={(event) => onLabelChange(event.target.value)}
        />
      </div>
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-gray-300 p-3">
      <CButton onClick={onCancel}>
        <IconArrowLeft />
        Cancelar
      </CButton>
      <CButton
        disabled={!label.trim() || selectedCount < 1}
        onClick={onConfirm}
      >
        <IconCheck />
        Confirmar
      </CButton>
    </div>
  </>
);

export default AddingGroupState;
