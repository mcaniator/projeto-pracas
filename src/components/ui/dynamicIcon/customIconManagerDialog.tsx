"use client";

import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

import SaveCustomIconDialog from "./saveCustomIconDialog";

type CustomIconManagerDialogProps = {
  open: boolean;
  onClose: () => void;
};

const CustomIconManagerDialog = ({
  open,
  onClose,
}: CustomIconManagerDialogProps) => {
  const [isSaveCustomIconOpen, setIsSaveCustomIconOpen] = useState(false);

  return (
    <CDialog
      open={open}
      onClose={onClose}
      fullScreen
      title="Gerenciar ícones personalizados"
      disableDialogActions
    >
      <CButton
        type="button"
        square
        tooltip="Adicionar ícone personalizado"
        aria-label="Adicionar ícone personalizado"
        onClick={() => setIsSaveCustomIconOpen(true)}
      >
        <IconPlus />
      </CButton>

      <SaveCustomIconDialog
        open={isSaveCustomIconOpen}
        onClose={() => setIsSaveCustomIconOpen(false)}
      />
    </CDialog>
  );
};

export default CustomIconManagerDialog;
