"use client";

import { ReactNode, createContext, useContext, useRef, useState } from "react";

import HelperCard, { HelperCardType } from "../popups/HelperCard";

interface HelperCardContextType {
  setHelperCard: ({
    show,
    helperCardType,
    customTimeout,
    content,
  }: {
    show: boolean;
    helperCardType: HelperCardType;
    customTimeout?: number;
    content: ReactNode;
  }) => void;
}

const HelperCardContext = createContext<HelperCardContextType | undefined>(
  undefined,
);

const sleep = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

export const HelperCardProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [helperCardType, setHelperCardType] = useState<HelperCardType>("INFO");
  const [helperContent, setHelperContent] = useState<ReactNode>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayedCardUpdate = async (
    content: ReactNode,
    helperCardType: HelperCardType,
    show: boolean,
    customTimeout?: number,
  ) => {
    await sleep(200);
    setHelperContent(content);
    setHelperCardType(helperCardType);
    setVisible(show);
    if (show) {
      timeoutRef.current = setTimeout(
        () => {
          setVisible(false);
          setHelperContent(null);
        },
        customTimeout ?? (helperCardType === "INFO" ? 10000 : 5000),
      );
    }
  };
  const setHelperCard = ({
    show,
    helperCardType,
    customTimeout,
    content,
  }: {
    show: boolean;
    helperCardType: HelperCardType;
    customTimeout?: number;
    content: ReactNode;
  }) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      if (visible) {
        setVisible(false);
        void delayedCardUpdate(content, helperCardType, show, customTimeout);
        return;
      }
    }
    setHelperContent(content);
    setHelperCardType(helperCardType);
    setVisible(show);
    if (show) {
      timeoutRef.current = setTimeout(
        () => {
          setVisible(false);
          setHelperContent(null);
        },
        customTimeout ?? (helperCardType === "INFO" ? 10000 : 5000),
      );
    }
  };

  const close = () => {
    setVisible(false);
    setHelperContent(null);
  };

  return (
    <HelperCardContext.Provider value={{ setHelperCard }}>
      {children}
      {
        <div
          className={`${visible ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"} fixed bottom-4 left-1/2 z-50 flex w-full items-center justify-between transition-all duration-500`}
        >
          <HelperCard helperCardType={helperCardType} close={close}>
            {helperContent}
          </HelperCard>
        </div>
      }
    </HelperCardContext.Provider>
  );
};

export const useHelperCard = () => {
  const context = useContext(HelperCardContext);
  if (!context) {
    throw new Error("useHelperCard must be used within a HelperCardProvider");
  }
  return context;
};
