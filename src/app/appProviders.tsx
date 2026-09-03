"use client";

import CapacitorAppProvider from "@/components/context/capacitorAppProvider";
import { GeolocationProvider } from "@/components/context/geolocationContext";
import { LoadingOverlayProvider } from "@/components/context/loadingContext";
import { NetworkProvider } from "@/components/context/networkContext";
import MuiThemeProvider from "@/components/theme/MuiThemeProvider";
import { IconButton } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { IconX } from "@tabler/icons-react";
import "dayjs/locale/pt-br";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { SnackbarProvider, closeSnackbar } from "notistack";
import { ReactNode } from "react";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <CapacitorAppProvider>
      <MuiThemeProvider>
        <SnackbarProvider
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          dense
          preventDuplicate
          action={(snackbarId) => (
            <IconButton
              aria-label="Fechar notificação"
              color="inherit"
              size="small"
              onClick={() => closeSnackbar(snackbarId)}
            >
              <IconX size={18} />
            </IconButton>
          )}
        >
          <NetworkProvider>
            <LocalizationProvider
              dateAdapter={AdapterDayjs}
              adapterLocale="pt-br"
            >
              <GeolocationProvider>
                <LoadingOverlayProvider>{children}</LoadingOverlayProvider>
              </GeolocationProvider>

              <ProgressBar
                height="4px"
                color="#F6FAF2"
                options={{ showSpinner: true }}
                shallowRouting
              />
            </LocalizationProvider>
          </NetworkProvider>
        </SnackbarProvider>
      </MuiThemeProvider>
    </CapacitorAppProvider>
  );
};

export default AppProviders;
