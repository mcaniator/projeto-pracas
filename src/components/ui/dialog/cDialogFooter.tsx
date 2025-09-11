import CButton from "@components/ui/cButton";
import { ButtonProps } from "@mui/material";
import { ReactNode } from "react";

const CDialogFooter = ({
  cancelChildren,
  confirmChildren,
  cancelVariant,
  confirmVariant,
  onCancel,
  onConfirm,
}: {
  cancelChildren?: ReactNode;
  confirmChildren?: ReactNode;
  cancelVariant?: ButtonProps["variant"];
  confirmVariant?: ButtonProps["variant"];
  onCancel?: () => void;
  onConfirm?: () => void;
}) => {
  return (
    <div
      className={`flex items-center ${cancelChildren ? "justify-between" : "justify-end"}`}
    >
      {cancelChildren && (
        <CButton variant={cancelVariant} onClick={onCancel}>
          {cancelChildren}
        </CButton>
      )}
      {confirmChildren && (
        <CButton variant={confirmVariant} onClick={onConfirm}>
          {confirmChildren}
        </CButton>
      )}
    </div>
  );
};

export default CDialogFooter;
