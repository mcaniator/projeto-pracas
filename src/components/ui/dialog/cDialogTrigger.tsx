import CButton, { CButtonProps } from "@/components/ui/cButton";
import CDialog, { CDialogProps } from "@/components/ui/dialog/cDialog";
import { ReactNode, forwardRef, useImperativeHandle, useState } from "react";

type CDialogTriggerProps = Omit<CDialogProps, "open" | "onClose"> & {
  triggerchildren: ReactNode;
  children: ReactNode;
  triggerProps?: CButtonProps;
};

const CDialogTrigger = forwardRef((props: CDialogTriggerProps, ref) => {
  const { triggerchildren, triggerProps, ...dialogProps } = props;

  const [open, setIsOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    close: () => setIsOpen(false),
    open: () => setIsOpen(true),
  }));

  return (
    <>
      <CButton onClick={() => setIsOpen(true)} {...triggerProps}>
        {triggerchildren}
      </CButton>
      <CDialog open={open} onClose={() => setIsOpen(false)} {...dialogProps} />
    </>
  );
});

CDialogTrigger.displayName = "DialogTrigger";

export default CDialogTrigger;
