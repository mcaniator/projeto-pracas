"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import PermissionDeniedPopup from "../popups/PermissionDeniedPopup";

interface PermissionDeniedContextType {
  setPermissionDenied: (show: boolean) => void;
}

const PermissionDeniedContext = createContext<
  PermissionDeniedContextType | undefined
>(undefined);

export const PermissionDeniedProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [visible, setVisible] = useState(false);

  const setPermissionDenied = (show: boolean) => {
    setVisible(show);
  };

  useEffect(() => {
    if (!visible) return;
    setTimeout(() => {
      setVisible(false);
    }, 2000);
  }, [visible]);

  return (
    <PermissionDeniedContext.Provider value={{ setPermissionDenied }}>
      {children}
      {visible && (
        <PermissionDeniedPopup setPermissionDenied={setPermissionDenied} />
      )}
    </PermissionDeniedContext.Provider>
  );
};

export const usePermissionDenied = () => {
  const context = useContext(PermissionDeniedContext);
  if (!context) {
    throw new Error(
      "usePermissionDenied must be used within a PermissionDeniedProvider",
    );
  }
  return context;
};
