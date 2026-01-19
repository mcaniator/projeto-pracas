"use client";

import React, { ReactNode, createContext, useContext, useState } from "react";

import LoadingIcon from "../LoadingIcon";

type LoadingOverlayType = {
  setLoadingOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>;
  setLoadingOverlay: ({
    show,
    message,
  }: {
    show: boolean;
    message?: string | null | undefined;
  }) => void;
};

const LoadingOverlay = createContext<LoadingOverlayType | undefined>(undefined);

export const LoadingOverlayProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [visible, setLoadingOverlayVisible] = useState(false);
  const [message, setMessage] = useState<string | null | undefined>(null);
  const setLoadingOverlay = ({
    show,
    message,
  }: {
    show: boolean;
    message?: string | null | undefined;
  }) => {
    setLoadingOverlayVisible(show);
    if (show) {
      setMessage(message);
    } else {
      setMessage(null);
    }
  };
  return (
    <LoadingOverlay.Provider
      value={{ setLoadingOverlayVisible, setLoadingOverlay }}
    >
      {visible && (
        <div className="fixed z-[9999] flex h-screen w-screen flex-col items-center justify-center bg-black/50">
          <LoadingIcon className="text-white" size={72} />
          <div className="text-md font-semibold text-white">{message}</div>
        </div>
      )}
      {children}
    </LoadingOverlay.Provider>
  );
};

export const useLoadingOverlay = () => {
  const context = useContext(LoadingOverlay);
  if (!context) {
    throw new Error(
      "useLoadingOverlay must be used within a HelperCardProvider",
    );
  }
  return context;
};
