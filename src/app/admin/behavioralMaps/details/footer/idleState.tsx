"use client";

import CButton from "@/components/ui/cButton";
import {
  IconClipboardCheck,
  IconDeviceFloppy,
  IconFileText,
  IconLink,
  IconUsersGroup,
} from "@tabler/icons-react";

const IdleState = ({
  onOpenForm,
  onOpenEvaluation,
  onOpenSave,
  onCreateGroup,
  onCreateLink,
}: {
  onOpenForm?: () => void;
  onOpenEvaluation?: () => void;
  onOpenSave?: () => void;
  onCreateGroup?: () => void;
  onCreateLink?: () => void;
}) => (
  <>
    <div className="flex min-h-0 flex-1 items-center justify-center p-4 text-center text-lg">
      Clique no mapa para registrar uma ou mais pessoas
    </div>
    <div className="grid grid-cols-2 gap-2 p-3">
      <CButton
        sx={{ width: "100%" }}
        disabled={!onOpenForm}
        onClick={onOpenForm}
      >
        <IconFileText />
        Formulário
      </CButton>
      <CButton sx={{ width: "100%" }} onClick={onOpenEvaluation}>
        <IconClipboardCheck />
        Avaliação
      </CButton>
      <CButton sx={{ width: "100%" }} onClick={onCreateGroup}>
        <IconUsersGroup />
        Criar grupo
      </CButton>
      <CButton sx={{ width: "100%" }} onClick={onCreateLink}>
        <IconLink />
        Adicionar ligação
      </CButton>
      <CButton
        sx={{ width: "100%" }}
        className="col-span-2"
        onClick={onOpenSave}
      >
        <IconDeviceFloppy />
        Salvar
      </CButton>
    </div>
  </>
);

export default IdleState;
