"use client";

import CButton from "@/components/ui/cButton";
import {
  IconClipboardCheck,
  IconDeviceFloppy,
  IconFileText,
  IconLink,
} from "@tabler/icons-react";

const IdleState = ({
  onOpenForm,
  onOpenEvaluation,
  onOpenSave,
}: {
  onOpenForm?: () => void;
  onOpenEvaluation?: () => void;
  onOpenSave?: () => void;
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
      <CButton sx={{ width: "100%" }}>
        <IconLink />
        Ligações
      </CButton>
      <CButton sx={{ width: "100%" }} onClick={onOpenSave}>
        <IconDeviceFloppy />
        Salvar
      </CButton>
    </div>
  </>
);

export default IdleState;
