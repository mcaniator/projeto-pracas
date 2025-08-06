"use client";

import muiTheme from "@/lib/theme/muiTheme";
import { ThemeProvider } from "@mui/material/styles";
import { ReactNode } from "react";

const MuiThemeProvider = ({ children }: { children: ReactNode }) => {
  return <ThemeProvider theme={muiTheme}>{children}</ThemeProvider>;
};

export default MuiThemeProvider;
