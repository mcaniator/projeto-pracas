import CButton, { CButtonProps } from "@/components/ui/cButton";
import CDialog, { CDialogProps } from "@/components/ui/dialog/cDialog";
import { ReactNode, forwardRef, useImperativeHandle, useState } from "react";

type CDialogTriggerProps = Omit<CDialogProps, "open" | "onClose"> & {
  triggerChildren: ReactNode;
  children: ReactNode;
  triggerProps: CButtonProps;
};

const DialogTrigger = forwardRef((props: CDialogTriggerProps, ref) => {
  const [open, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    close: () => setIsOpen(false),
    open: () => setIsOpen(true),
  }));

  return (
    <>
      <CButton {...props.triggerProps}>{props.triggerChildren}</CButton>
      <CDialog open={open} onClose={() => setIsOpen(false)} {...props} />
    </>
  );
});

DialogTrigger.displayName = "DialogTrigger";

export default DialogTrigger;
