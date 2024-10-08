import { josefin_sans } from "@/lib/fonts";
import type { Metadata, Viewport } from "next";
import { ReactNode } from "react";

import "./globals.css";

const metadata: Metadata = {
  title: "Projeto Praças",
};

const viewport: Viewport = {
  themeColor: "#608E66",
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html lang="en">
      <body className={josefin_sans.className}>{children}</body>
    </html>
  );
};

export { metadata, viewport };
export default RootLayout;
