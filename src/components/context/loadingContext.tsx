"use client";

import React, { ReactNode, createContext, useContext, useState } from "react";

import LoadingIcon from "../LoadingIcon";

type LoadingOverlayType = {
  setLoadingOverlayVisible: React.Dispatch<React.SetStateAction<boolean>>;
};

const LoadingOverlay = createContext<LoadingOverlayType | undefined>(undefined);

export const LoadingOverlayProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [visible, setLoadingOverlayVisible] = useState(false);
  return (
    <LoadingOverlay.Provider value={{ setLoadingOverlayVisible }}>
      {visible && (
        <div className="fixed z-[99] flex h-screen w-screen items-center justify-center bg-black/50">
          <LoadingIcon className="text-white" size={72} />
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
