import { useOpenedDialogsCounterContext } from "@/components/context/openedDialogsCounterContext";
import {
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Fade,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { ReactNode, useEffect, useRef } from "react";

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
  confirmSx?: ButtonProps["sx"];
  cancelSx?: ButtonProps["sx"];
  confirmColor?: ButtonProps["color"];
  cancelColor?: ButtonProps["color"];
  disableDialogActions?: boolean;
  isForm?: boolean;
  disableContentPadding?: boolean;
  disableBackdropClose?: boolean;
  confirmLoading?: boolean;
  cancelLoading?: boolean;
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
  return <Fade ref={ref} {...props} />;
});

/**
 * A Dialog component that can be used to display a modal
 * window for various purposes, such as displaying information,
 * requesting user input, or confirming an action. It can also be used as a form.
 *
 * It integrates with the browser history so that pressing the navigation buttons
 * closes the most recent dialog instead of navigating away.
 */
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
  confirmSx,
  cancelSx,
  confirmColor,
  cancelColor,
  disableDialogActions = false,
  fullScreen,
  isForm,
  disableContentPadding,
  disableBackdropClose,
  confirmLoading,
  cancelLoading,
  action,
  onCancel,
  onConfirm,
  onClose,
  onSubmit,
  ...props
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
  const onCloseRef = useRef(onClose);
  const openDialogCounterContext = useOpenedDialogsCounterContext();
  const dialogIndexRef = useRef(0);
  const handlePopRef = useRef((forceBackNavigation?: boolean) => {
    if (
      openDialogCounterContext.openedDialogsCounterRef.current ===
      dialogIndexRef.current
    ) {
      if (
        !forceBackNavigation &&
        !!openDialogCounterContext.timeoutRef.current
      ) {
        window.history.pushState(
          { dialogIndex: dialogIndexRef.current - 1 },
          "",
        );
      }
      if (
        forceBackNavigation &&
        !!openDialogCounterContext.timeoutRef.current
      ) {
        window.history.back();
      }
      window.removeEventListener("popstate", () => {
        handlePopRef.current();
      });
      openDialogCounterContext.closeDialog();
      dialogIndexRef.current = 0;
      onCloseRef.current();
    }
  });

  const handleEventClose = (
    event: object,
    reason: "backdropClick" | "escapeKeyDown",
  ) => {
    if (disableBackdropClose && reason === "backdropClick") {
      return;
    }
    handlePopRef.current(true);
  };

  useEffect(() => {
    if (!props.open || dialogIndexRef.current !== 0) return;

    dialogIndexRef.current = openDialogCounterContext.openDialog();

    window.history.pushState({ dialogIndex: dialogIndexRef.current - 1 }, "");

    window.addEventListener("popstate", () => {
      handlePopRef.current();
    });
  }, [props.open]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const contentSx =
    disableContentPadding ?
      { px: "0px", py: "0px" }
    : { px: { xs: "4px", sm: "12px" }, py: "4px" };
  //TODO: Study ways to remove code duplication
  if (isForm) {
    return (
      <Dialog
        onClose={handleEventClose}
        slots={{
          transition: Transition,
        }}
        fullScreen={fullScreen}
        slotProps={{
          backdrop: {
            className: "bg-black/25",
          },
          paper: {
            sx: {
              borderRadius: fullScreen ? "0px" : "12px",
              py: { xs: "4px", sm: "16px" },
            },
          },
        }}
        {...props}
      >
        <form action={action} onSubmit={onSubmit}>
          <DialogTitle
            sx={{
              px: { xs: "4px", sm: "16px" },
              py: "0px",
            }}
          >
            <CDialogHeader
              close={() => {
                handlePopRef.current(true);
              }}
              title={title}
              subtitle={subtitle}
            />
          </DialogTitle>

          <DialogContent sx={contentSx} dividers>
            {children}
          </DialogContent>

          {!disableDialogActions && (
            <DialogActions
              sx={{ px: { xs: "4px", sm: "16px" }, marginTop: "8px" }}
            >
              <CDialogFooter
                cancelChildren={cancelChildren}
                confirmChildren={confirmChildren}
                cancelVariant={cancelVariant}
                confirmVariant={confirmVariant}
                disableConfirmButton={disableConfirmButton}
                disableCancelButton={disableCancelButton}
                confirmSx={confirmSx}
                cancelSx={cancelSx}
                confirmColor={confirmColor}
                cancelColor={cancelColor}
                isForm={isForm}
                confirmLoading={confirmLoading}
                cancelLoading={cancelLoading}
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
      onClose={handleEventClose}
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
            py: { xs: "4px", sm: "16px" },
          },
        },
      }}
      {...props}
    >
      <DialogTitle
        sx={{
          px: { xs: "4px", sm: "16px" },
          py: "0px",
        }}
      >
        <CDialogHeader
          close={() => {
            handlePopRef.current(true);
          }}
          title={title}
          subtitle={subtitle}
        />
      </DialogTitle>

      <DialogContent sx={contentSx} dividers>
        {children}
      </DialogContent>

      {!disableDialogActions && (
        <DialogActions sx={{ px: { xs: "4px", sm: "16px" }, marginTop: "8px" }}>
          <CDialogFooter
            cancelChildren={cancelChildren}
            confirmChildren={confirmChildren}
            cancelVariant={cancelVariant}
            confirmVariant={confirmVariant}
            disableConfirmButton={disableConfirmButton}
            disableCancelButton={disableCancelButton}
            confirmSx={confirmSx}
            cancelSx={cancelSx}
            confirmColor={confirmColor}
            cancelColor={cancelColor}
            confirmLoading={confirmLoading}
            cancelLoading={cancelLoading}
            onCancel={onCancel}
            onConfirm={onConfirm}
          />
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CDialog;
