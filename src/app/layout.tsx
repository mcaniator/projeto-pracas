import { josefin_sans } from "@/lib/fonts";
import MuiThemeProvider from "@components/theme/MuiThemeProvider";
import type { Metadata, Viewport } from "next";
import NextTopLoader from "nextjs-toploader";
import { ReactNode } from "react";

import { LoadingOverlayProvider } from "../components/context/loadingContext";
import AppProviders from "./appProviders";
import "./globals.css";

const metadata: Metadata = {
  title: "Projeto Praças",
  description: "Sistema de acompanhamento e avaliação de praças",
};

const viewport: Viewport = {
  themeColor: "#608E66",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body className={josefin_sans.className}>
        <MuiThemeProvider>
          <AppProviders>
            <NextTopLoader showSpinner={false} />
            <LoadingOverlayProvider>{children}</LoadingOverlayProvider>
          </AppProviders>
        </MuiThemeProvider>
      </body>
    </html>
  );
};

export { metadata, viewport };
export default RootLayout;
