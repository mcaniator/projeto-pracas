import { useNetwork } from "@/components/context/networkContext";
import { ReactNode } from "react";

const CapacitorOnlineGuard = ({ children }: { children: ReactNode }) => {
  const { isConnected } = useNetwork();
  if (isConnected) {
    return <>{children}</>;
  }
  return null;
};

export default CapacitorOnlineGuard;
