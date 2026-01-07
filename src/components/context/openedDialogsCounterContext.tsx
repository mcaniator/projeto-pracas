import { ReactNode, RefObject, createContext, useContext, useRef } from "react";

type OpenedDialogsCounterContextType = {
  openedDialogsCounterRef: RefObject<number>;
  timeoutRef: RefObject<NodeJS.Timeout | null>;
  openDialog: () => number;
  closeDialog: () => number;
};
export const OpenedDialogsCounterContext = createContext<
  OpenedDialogsCounterContextType | undefined
>(undefined);

export const OpenedDialogsCounterProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const openedDialogsCounterRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const openDialog = () => {
    openedDialogsCounterRef.current += 1;
    return openedDialogsCounterRef.current;
  };
  const closeDialog = () => {
    if (openedDialogsCounterRef.current <= 0) return 0;
    openedDialogsCounterRef.current -= 1;
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
    }, 100);
    return openedDialogsCounterRef.current;
  };
  return (
    <OpenedDialogsCounterContext.Provider
      value={{ openedDialogsCounterRef, timeoutRef, openDialog, closeDialog }}
    >
      {children}
    </OpenedDialogsCounterContext.Provider>
  );
};

export const useOpenedDialogsCounterContext = () => {
  const context = useContext(OpenedDialogsCounterContext);
  if (!context) {
    throw new Error(
      "useOpenedDialogsCounterContext must be used within a OpenedDialogsCounterProvider",
    );
  }
  return context;
};
