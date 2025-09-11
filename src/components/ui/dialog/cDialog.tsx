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
  disableModalActions?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  onClose: () => void;
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
  disableModalActions = false,
  fullScreen,
  onCancel,
  onConfirm,
  onClose,
  ...rest
}: CDialogProps) => {
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
          sx: { borderRadius: fullScreen ? "0px" : "12px", padding: "16px" },
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
          padding: "0px 12px",
        }}
        dividers
      >
        {children}
      </DialogContent>

      {!disableModalActions && (
        <DialogActions sx={{ padding: "0px", marginTop: "8px" }}>
          <CDialogFooter
            cancelChildren={cancelChildren}
            confirmChildren={confirmChildren}
            cancelVariant={cancelVariant}
            confirmVariant={confirmVariant}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CDialog;
