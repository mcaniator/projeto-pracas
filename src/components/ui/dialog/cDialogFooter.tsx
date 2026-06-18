import CButton, { CButtonProps } from "@components/ui/cButton";
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
  confirmLoading,
  cancelLoading,
  confirmProps,
  cancelProps,
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
  confirmLoading?: boolean;
  cancelLoading?: boolean;
  confirmProps?: CButtonProps;
  cancelProps?: CButtonProps;
  isForm?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
}) => {
  const renderCancelButton = cancelChildren && !confirmLoading;
  const renderConfirmButton = confirmChildren && !cancelLoading;
  return (
    <div
      className={`flex w-full items-center ${renderCancelButton ? "justify-between" : "justify-end"}`}
    >
      {renderCancelButton && (
        <CButton
          color={cancelColor}
          variant={cancelVariant}
          disabled={disableCancelButton}
          sx={cancelSx}
          loading={cancelLoading}
          onClick={onCancel}
          {...cancelProps}
        >
          {cancelChildren}
        </CButton>
      )}
      {renderConfirmButton && (
        <CButton
          color={confirmColor}
          type={isForm ? "submit" : "button"}
          variant={confirmVariant}
          disabled={disableConfirmButton}
          sx={confirmSx}
          loading={confirmLoading}
          onClick={onConfirm}
          {...confirmProps}
        >
          {confirmChildren}
        </CButton>
      )}
    </div>
  );
};

export default CDialogFooter;
