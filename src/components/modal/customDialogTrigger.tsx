"use client";

import { Button, ButtonVariant } from "@components/button";
import { ReactNode } from "react";
import { DialogTrigger } from "react-aria-components";

import CustomModal from "./customModal";

const CustomDialogTrigger = ({
  buttonContent,
  title,
  subtitle,
  cancelLabel,
  confirmLabel,
  variant,
  cancelVariant,
  confirmVariant,
  children,
  onCancel,
  onConfirm,
  onOpenChange,
}: {
  buttonContent?: ReactNode;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  cancelLabel?: ReactNode;
  confirmLabel?: ReactNode;
  variant?: ButtonVariant;
  cancelVariant?: ButtonVariant;
  confirmVariant?: ButtonVariant;
  onCancel?: () => void;
  onConfirm?: () => void;
  onOpenChange?: () => void;
}) => {
  return (
    <DialogTrigger onOpenChange={onOpenChange}>
      <Button
        className="items-center p-2 text-sm sm:text-xl"
        variant={variant ?? "default"}
      >
        {buttonContent}
      </Button>
      <CustomModal
        title={title}
        subtitle={subtitle}
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        cancelVariant={cancelVariant}
        confirmVariant={confirmVariant}
        onCancel={onCancel}
        onConfirm={onConfirm}
        onOpenChange={onOpenChange}
      >
        {children}
      </CustomModal>
    </DialogTrigger>
  );
};

export default CustomDialogTrigger;
