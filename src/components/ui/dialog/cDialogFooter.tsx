import CButton from "@components/ui/cButton";
import { ButtonProps } from "@mui/material";
import { ReactNode } from "react";

const CDialogFooter = ({
  cancelChildren,
  confirmChildren,
  cancelVariant,
  confirmVariant,
  disableConfirmButton,
  disableCancelButton,
  onCancel,
  onConfirm,
}: {
  cancelChildren?: ReactNode;
  confirmChildren?: ReactNode;
  cancelVariant?: ButtonProps["variant"];
  confirmVariant?: ButtonProps["variant"];
  disableConfirmButton: boolean;
  disableCancelButton: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}) => {
  return (
    <div
      className={`flex w-full items-center ${cancelChildren ? "justify-between" : "justify-end"}`}
    >
      {cancelChildren && (
        <CButton
          variant={cancelVariant}
          disabled={disableCancelButton}
          onClick={onCancel}
        >
          {cancelChildren}
        </CButton>
      )}
      {confirmChildren && (
        <CButton
          variant={confirmVariant}
          disabled={disableConfirmButton}
          onClick={onConfirm}
        >
          {confirmChildren}
        </CButton>
      )}
    </div>
  );
};

export default CDialogFooter;
