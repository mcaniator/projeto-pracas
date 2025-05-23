import { ReactNode } from "react";
import { Dialog, Modal, ModalOverlay } from "react-aria-components";

import { ButtonVariant } from "../button";
import DefaultModalFooter from "./defaultModalFooter";
import DefaultModalHeader from "./defaultModalHeader";

const CustomModal = ({
  isOpen,
  title,
  subtitle,
  cancelLabel,
  confirmLabel,
  cancelVariant,
  confirmVariant,
  children,
  onCancel,
  onConfirm,
  onOpenChange,
}: {
  isOpen?: boolean;
  title?: string;
  subtitle?: string;
  children?: ReactNode;
  cancelLabel?: ReactNode;
  confirmLabel?: ReactNode;
  cancelVariant?: ButtonVariant;
  confirmVariant?: ButtonVariant;
  onCancel?: () => void;
  onConfirm?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
}) => {
  return (
    <ModalOverlay
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      className={({ isEntering, isExiting }) =>
        `fixed inset-0 z-30 flex min-h-full items-center justify-center overflow-y-auto bg-black/25 p-4 text-center backdrop-blur ${
          isEntering ? "duration-300 ease-out animate-in fade-in" : ""
        } ${isExiting ? "duration-200 ease-in animate-out fade-out" : ""}`
      }
      isDismissable
    >
      <Modal
        className={({ isEntering, isExiting }) =>
          `overlow-auto mb-auto mt-auto min-w-[32rem] max-w-[90%] transform rounded-2xl bg-off-white p-6 text-left align-middle shadow-xl ${
            isEntering ? "duration-300 ease-out animate-in zoom-in-95" : ""
          } ${isExiting ? "duration-200 ease-in animate-out zoom-out-95" : ""}`
        }
      >
        <Dialog className="outline-none data-[focus-visible]:outline data-[focus-visible]:ring-1 data-[focus-visible]:ring-ring">
          {({ close }) => (
            <div className="flex flex-col gap-2">
              <DefaultModalHeader
                close={() => {
                  close();
                  onOpenChange;
                }}
                title={title}
                subtitle={subtitle}
              />
              {children}
              <DefaultModalFooter
                cancelLabel={cancelLabel}
                confirmLabel={confirmLabel}
                cancelVariant={cancelVariant}
                confirmVariant={confirmVariant}
                onCancel={onCancel}
                onConfirm={onConfirm}
              />
            </div>
          )}
        </Dialog>
      </Modal>
    </ModalOverlay>
  );
};

export default CustomModal;
