import {
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { ReactNode } from "react";

import CDialogFooter from "./cDialogFooter";
import CDialogHeader from "./dDialogHeader";

type CDialogProps = DialogProps & {
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  cancelChildren?: ReactNode;
  confirmChildren?: ReactNode;
  cancelVariant?: ButtonProps["variant"];
  confirmVariant?: ButtonProps["variant"];
  disableConfirmButton?: boolean;
  disableCancelButton?: boolean;
  disableDialogActions?: boolean;
  isForm?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  onClose: () => void;
  action?: (formData: FormData) => void;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
};

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<unknown>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const CDialog = ({
  title,
  subtitle,
  children,
  cancelChildren,
  confirmChildren,
  cancelVariant,
  confirmVariant,
  disableConfirmButton = false,
  disableCancelButton = false,
  disableDialogActions = false,
  fullScreen,
  isForm,
  action,
  onCancel,
  onConfirm,
  onClose,
  onSubmit,
  ...rest
}: CDialogProps) => {
  if (action && !isForm) {
    throw new Error(
      "Action defined in a CDialog that does not have 'isForm' set as true",
    );
  }
  if (onSubmit && !isForm) {
    throw new Error(
      "onSubmit defined in a CDialog that does not have 'isForm' set as true",
    );
  }
  if (isForm) {
    return (
      <Dialog
        onClose={onClose}
        slots={{
          transition: Transition,
        }}
        fullScreen={fullScreen}
        slotProps={{
          backdrop: {
            className: "bg-black/25 backdrop-blur",
          },
          paper: {
            sx: {
              borderRadius: fullScreen ? "0px" : "12px",
              px: { xs: "4px", sm: "16px" },
              py: { xs: "4px", sm: "16px" },
            },
          },
        }}
        {...rest}
      >
        <form action={action} onSubmit={onSubmit}>
          <DialogTitle
            sx={{
              padding: "0px",
            }}
          >
            <CDialogHeader close={onClose} title={title} subtitle={subtitle} />
          </DialogTitle>

          <DialogContent
            sx={{
              px: { xs: "0px", sm: "12px" },
              py: "4px",
            }}
            dividers
          >
            {children}
          </DialogContent>

          {!disableDialogActions && (
            <DialogActions sx={{ padding: "0px", marginTop: "8px" }}>
              <CDialogFooter
                cancelChildren={cancelChildren}
                confirmChildren={confirmChildren}
                cancelVariant={cancelVariant}
                confirmVariant={confirmVariant}
                disableConfirmButton={disableConfirmButton}
                disableCancelButton={disableCancelButton}
                isForm={isForm}
                onCancel={onCancel}
                onConfirm={onConfirm}
              />
            </DialogActions>
          )}
        </form>
      </Dialog>
    );
  }
  return (
    <Dialog
      onClose={onClose}
      slots={{
        transition: Transition,
      }}
      fullScreen={fullScreen}
      slotProps={{
        backdrop: {
          className: "bg-black/25 backdrop-blur",
        },
        paper: {
          sx: {
            borderRadius: fullScreen ? "0px" : "12px",
            px: { xs: "4px", sm: "16px" },
            py: { xs: "4px", sm: "16px" },
          },
        },
      }}
      {...rest}
    >
      <DialogTitle
        sx={{
          padding: "0px",
        }}
      >
        <CDialogHeader close={onClose} title={title} subtitle={subtitle} />
      </DialogTitle>

      <DialogContent
        sx={{
          px: { xs: "0px", sm: "12px" },
          py: "4px",
        }}
        dividers
      >
        {children}
      </DialogContent>

      {!disableDialogActions && (
        <DialogActions sx={{ padding: "0px", marginTop: "8px" }}>
          <CDialogFooter
            cancelChildren={cancelChildren}
            confirmChildren={confirmChildren}
            cancelVariant={cancelVariant}
            confirmVariant={confirmVariant}
            disableConfirmButton={disableConfirmButton}
            disableCancelButton={disableCancelButton}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CDialog;
