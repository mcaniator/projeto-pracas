import {
  ButtonProps,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  Fade,
  PaperProps,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { ReactNode, useEffect, useMemo, useRef } from "react";

import CDialogFooter from "./cDialogFooter";
import CDialogHeader from "./dDialogHeader";

export type CDialogProps = DialogProps & {
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
  mobileFullScreen?: boolean;
  removeCloseButton?: boolean;
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
  mobileFullScreen,
  isForm,
  disableContentPadding,
  disableBackdropClose,
  confirmLoading,
  cancelLoading,
  removeCloseButton,
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
  // This code is used to close the dialog when the user presses the navigation buttons.
  // It is commented out because it breaks if the dialog is closed from the 'open' prop.
  /*const onCloseRef = useRef(onClose);
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
  }, [onClose]);*/

  const handleEventClose = (
    event: object,
    reason: "backdropClick" | "escapeKeyDown",
  ) => {
    if (disableBackdropClose && reason === "backdropClick") {
      return;
    }

    onClose?.();
  };

  const theme = useTheme();
  const isMobileView = useMediaQuery(theme.breakpoints.down("sm"));
  const memoFullScreen = useMemo(
    () => fullScreen || (isMobileView && mobileFullScreen),
    [fullScreen, isMobileView, mobileFullScreen],
  );

  const onCloseRef = useRef(onClose);
  const skipNextPopStateRef = useRef(false);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!props.open || !memoFullScreen) {
      return;
    }

    const handlePopState = () => {
      if (skipNextPopStateRef.current) {
        skipNextPopStateRef.current = false;
        return;
      }

      const shouldNavigate = window.confirm(
        "Deseja sair desta página? Alteracoes não salvas serão perdidas.",
      );

      if (!shouldNavigate) {
        skipNextPopStateRef.current = true;
        window.history.go(1);
        return;
      }

      onCloseRef.current?.();
    };

    window.history.pushState({ cDialogFullscreenGuard: true }, "");
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [props.open, memoFullScreen]);

  const contentSx =
    disableContentPadding ?
      { px: "0px", py: "0px" }
    : { px: { xs: "4px", sm: "12px" }, py: "4px" };
  //TODO: Study ways to remove code duplication
  if (isForm) {
    const formPaperProps: PaperProps & React.ComponentPropsWithoutRef<"form"> =
      {
        component: "form",
        sx: {
          borderRadius: memoFullScreen ? "0px" : "12px",
          py: { xs: "4px", sm: "16px" },
          overflow: "hidden",
        },
        action,
        onSubmit,
      };

    return (
      <Dialog
        onClose={handleEventClose}
        slots={{
          transition: Transition,
        }}
        fullScreen={memoFullScreen}
        slotProps={{
          backdrop: {
            className: "bg-black/25",
          },
          paper: formPaperProps,
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
            close={onClose}
            title={title}
            subtitle={subtitle}
            removeCloseButton={removeCloseButton}
          />
        </DialogTitle>

        <DialogContent sx={contentSx} dividers={!!children}>
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
      </Dialog>
    );
  }
  return (
    <Dialog
      onClose={handleEventClose}
      slots={{
        transition: Transition,
      }}
      fullScreen={memoFullScreen}
      slotProps={{
        backdrop: {
          className: "bg-black/25",
        },
        paper: {
          sx: {
            borderRadius: memoFullScreen ? "0px" : "12px",
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
          close={onClose}
          title={title}
          subtitle={subtitle}
          removeCloseButton={removeCloseButton}
        />
      </DialogTitle>

      <DialogContent sx={contentSx} dividers={!!children}>
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
