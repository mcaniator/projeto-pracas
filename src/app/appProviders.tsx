"use client";

import { HelperCardProvider } from "@/components/context/helperCardContext";
import { LoadingOverlayProvider } from "@/components/context/loadingContext";
import { OpenedDialogsCounterProvider } from "@/components/context/openedDialogsCounterContext";
import MuiThemeProvider from "@/components/theme/MuiThemeProvider";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/pt-br";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { ReactNode } from "react";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <OpenedDialogsCounterProvider>
      <MuiThemeProvider>
        <HelperCardProvider>
          <LocalizationProvider
            dateAdapter={AdapterDayjs}
            adapterLocale="pt-br"
          >
            <LoadingOverlayProvider>{children}</LoadingOverlayProvider>

            <ProgressBar
              height="4px"
              color="#F6FAF2"
              options={{ showSpinner: true }}
              shallowRouting
            />
          </LocalizationProvider>
        </HelperCardProvider>
      </MuiThemeProvider>
    </OpenedDialogsCounterProvider>
  );
};

export default AppProviders;
