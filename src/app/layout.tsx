import { josefin_sans } from "@/lib/fonts";
import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";

import DynamicIconPreloader from "@/components/ui/dynamicIcon/dynamicIconPreloader";
import AppProviders from "./appProviders";
import ConditionalPublicHeader from "./conditionalPublicHeader";
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
      <body
        className={
          josefin_sans.className +
          " flex h-[100dvh] flex-col bg-gradient-to-br from-olivine to-asparagus text-white"
        }
      >
        <AppProviders>
          <DynamicIconPreloader />
          <ConditionalPublicHeader />
          {children}
        </AppProviders>
      </body>
    </html>
  );
};

export { metadata, viewport };
export default RootLayout;
