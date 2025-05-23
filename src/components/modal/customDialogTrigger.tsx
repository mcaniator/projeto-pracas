import { Button, ButtonVariant } from "@components/button";
import { ReactNode } from "react";
import { DialogTrigger } from "react-aria-components";

import CustomModal from "./customModal";

const customDialogTrigger = ({
  icon,
  title,
  cancelLabel,
  confirmLabel,
  cancelVariant,
  confirmVariant,
  children,
  onOpenChange,
}: {
  icon?: ReactNode;
  title?: string;
  children?: ReactNode;
  cancelLabel?: ReactNode;
  confirmLabel?: ReactNode;
  cancelVariant?: ButtonVariant;
  confirmVariant?: ButtonVariant;
  onOpenChange: () => void;
}) => {
  return (
    <DialogTrigger onOpenChange={onOpenChange}>
      <Button
        className="items-center p-2 text-sm sm:text-xl"
        variant={"destructive"}
      >
        {icon}
      </Button>
      <CustomModal
        title={title}
        cancelLabel={cancelLabel}
        confirmLabel={confirmLabel}
        cancelVariant={cancelVariant}
        confirmVariant={confirmVariant}
      >
        {children}
      </CustomModal>
    </DialogTrigger>
  );
};

export default customDialogTrigger;
