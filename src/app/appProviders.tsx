"use client";

import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/pt-br";
import { ReactNode } from "react";

const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      {children}
    </LocalizationProvider>
  );
};

export default AppProviders;
