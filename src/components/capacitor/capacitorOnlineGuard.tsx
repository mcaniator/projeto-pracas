import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";
import { ReactNode, useEffect, useState } from "react";

const CapacitorOnlineGuard = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(false);
  useEffect(() => {
    const checkIfIsOnline = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
    };
    void checkIfIsOnline();
  }, []);
  if (!Capacitor.isNativePlatform()) {
    return <>{children}</>;
  } else if (isOnline) {
    return <>{children}</>;
  }
  return null;
};

export default CapacitorOnlineGuard;
