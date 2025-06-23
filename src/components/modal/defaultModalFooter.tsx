import { Button, ButtonVariant } from "@components/button";
import { ReactNode } from "react";

const DefaultModalFooter = ({
  cancelLabel,
  confirmLabel,
  cancelVariant,
  confirmVariant,
  onCancel,
  onConfirm,
}: {
  cancelLabel?: ReactNode;
  confirmLabel?: ReactNode;
  cancelVariant?: ButtonVariant;
  confirmVariant?: ButtonVariant;
  onCancel?: () => void;
  onConfirm?: () => void;
}) => {
  return (
    <div
      className={`flex items-center ${cancelLabel ? "justify-between" : "justify-end"}`}
    >
      {cancelLabel && (
        <Button variant={cancelVariant} onPress={onCancel}>
          {cancelLabel}
        </Button>
      )}

      <Button variant={confirmVariant} onPress={onConfirm}>
        {confirmLabel}
      </Button>
    </div>
  );
};

export default DefaultModalFooter;
