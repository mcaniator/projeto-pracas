// NetworkProvider.tsx
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";
import { enqueueSnackbar } from "notistack";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type NetworkContextType = {
  isConnected: boolean;
  isConnectedRef: React.MutableRefObject<boolean>;
  setServerOnline: Dispatch<SetStateAction<boolean>>;
  setNetworkStatus: Dispatch<SetStateAction<boolean>>;
};

const NetworkContext = createContext<NetworkContextType | null>(null);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [serverOnline, setServerOnline] = useState(true);
  const [networkStatus, setNetworkStatus] = useState(true);
  const [hasReceivedInitialNetworkStatus, setHasReceivedInitialNetworkStatus] =
    useState(false);
  const lastConnectedRef = useRef(true);

  useEffect(() => {
    if (!serverOnline) {
      enqueueSnackbar(
        "Servidor não encontrado! App alternado para modo offline!",
        { variant: "error" },
      );
    }
  }, [serverOnline]);

  const isConnectedRef = useRef(true);

  const isConnected = useMemo(() => {
    const val = serverOnline && networkStatus;
    isConnectedRef.current = val;
    return val;
  }, [serverOnline, networkStatus]);

  useEffect(() => {
    const initialNetworkCheck = async () => {
      if (Capacitor.isNativePlatform()) {
        const networkStatus = await Network.getStatus();
        lastConnectedRef.current = networkStatus.connected;
        setNetworkStatus(networkStatus.connected);
        setHasReceivedInitialNetworkStatus(true);
        if (!networkStatus.connected) {
          enqueueSnackbar("Sem conexão!", {
            variant: "error",
          });
        }
      } else {
        setHasReceivedInitialNetworkStatus(true);
      }
    };

    void initialNetworkCheck();
  }, []);

  useEffect(() => {
    let listener: { remove: () => Promise<void> } | undefined;

    const init = async () => {
      listener = await Network.addListener(
        "networkStatusChange",
        ({ connected }) => {
          if (lastConnectedRef.current === connected) {
            return;
          }
          lastConnectedRef.current = connected;
          if (connected) {
            setNetworkStatus(true);
            setServerOnline(true);
            enqueueSnackbar("Conectado!", { variant: "success" });
          } else {
            setNetworkStatus(false);
            enqueueSnackbar("Sem conexão! App alternado para modo offline!", {
              variant: "error",
            });
          }
        },
      );
    };
    if (Capacitor.isNativePlatform()) {
      void init();
    }

    return () => {
      void listener?.remove();
    };
  }, []);

  return (
    <NetworkContext.Provider
      value={{ isConnected, isConnectedRef, setServerOnline, setNetworkStatus }}
    >
      {hasReceivedInitialNetworkStatus && children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error("useNetwork must be used within a NetworkProvider");
  }
  return context;
}
