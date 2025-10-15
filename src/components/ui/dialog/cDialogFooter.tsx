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
  confirmSx,
  cancelSx,
  confirmColor,
  cancelColor,
  isForm,
  onCancel,
  onConfirm,
}: {
  cancelChildren?: ReactNode;
  confirmChildren?: ReactNode;
  cancelVariant?: ButtonProps["variant"];
  confirmVariant?: ButtonProps["variant"];
  disableConfirmButton: boolean;
  disableCancelButton: boolean;
  confirmSx?: ButtonProps["sx"];
  cancelSx?: ButtonProps["sx"];
  confirmColor?: ButtonProps["color"];
  cancelColor?: ButtonProps["color"];
  isForm?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}) => {
  return (
    <div
      className={`flex w-full items-center ${cancelChildren ? "justify-between" : "justify-end"}`}
    >
      {cancelChildren && (
        <CButton
          color={cancelColor}
          variant={cancelVariant}
          disabled={disableCancelButton}
          sx={cancelSx}
          onClick={onCancel}
        >
          {cancelChildren}
        </CButton>
      )}
      {confirmChildren && (
        <CButton
          color={confirmColor}
          type={isForm ? "submit" : "button"}
          variant={confirmVariant}
          disabled={disableConfirmButton}
          sx={confirmSx}
          onClick={onConfirm}
        >
          {confirmChildren}
        </CButton>
      )}
    </div>
  );
};

export default CDialogFooter;
