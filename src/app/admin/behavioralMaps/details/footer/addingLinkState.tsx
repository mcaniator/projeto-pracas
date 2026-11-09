"use client";

import CButton from "@/components/ui/cButton";
import CCheckbox from "@/components/ui/cCheckbox";
import CTextField from "@/components/ui/cTextField";
import { IconArrowLeft, IconCheck } from "@tabler/icons-react";

const AddingLinkState = ({
  description,
  selectedCount,
  hasSource,
  isSelfLinkSelected,
  onDescriptionChange,
  onSelfLinkChange,
  onCancel,
  onConfirm,
}: {
  description: string;
  selectedCount: number;
  hasSource: boolean;
  isSelfLinkSelected: boolean;
  onDescriptionChange: (value: string) => void;
  onSelfLinkChange: (checked: boolean) => void;
  onCancel: () => void;
  onConfirm: () => void;
}) => (
  <>
    <div className="min-h-0 flex-1 overflow-auto p-3">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <h2 className="text-lg font-semibold">Adicionar ligação</h2>
        <p className="text-sm text-gray-600">
          {hasSource ?
            "Origem selecionada. Agora escolha as observações que deseja ligar."
          : "Clique primeiro na observação de origem e depois escolha as observações que deseja ligar."
          }
          {selectedCount > 0 ? ` ${selectedCount} selecionada(s).` : ""}
        </p>
        <CTextField
          label="Descrição da ligação"
          value={description}
          required
          onChange={(event) => onDescriptionChange(event.target.value)}
        />
        <CCheckbox
          checked={isSelfLinkSelected}
          disabled={!hasSource}
          onChange={(event) => onSelfLinkChange(event.target.checked)}
          label="Ligar a si próprio"
        />
      </div>
    </div>
    <div className="flex items-center justify-between gap-2 border-t border-gray-300 p-3">
      <CButton onClick={onCancel}>
        <IconArrowLeft />
        Cancelar
      </CButton>
      <CButton
        disabled={!hasSource || !description.trim() || selectedCount === 0}
        onClick={onConfirm}
      >
        <IconCheck />
        Confirmar
      </CButton>
    </div>
  </>
);

export default AddingLinkState;
