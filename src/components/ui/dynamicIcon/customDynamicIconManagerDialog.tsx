"use client";

import CButton from "@/components/ui/cButton";
import CDialog from "@/components/ui/dialog/cDialog";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

import SaveCustomDynamicIconDialog from "./saveCustomDynamicIconDialog";

type CustomDynamicIconManagerDialogProps = {
  open: boolean;
  onClose: () => void;
};

const CustomDynamicIconManagerDialog = ({
  open,
  onClose,
}: CustomDynamicIconManagerDialogProps) => {
  const [isSaveCustomDynamicIconOpen, setIsSaveCustomDynamicIconOpen] =
    useState(false);

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
        onClick={() => setIsSaveCustomDynamicIconOpen(true)}
      >
        <IconPlus />
      </CButton>

      <SaveCustomDynamicIconDialog
        open={isSaveCustomDynamicIconOpen}
        onClose={() => setIsSaveCustomDynamicIconOpen(false)}
      />
    </CDialog>
  );
};

export default CustomDynamicIconManagerDialog;
