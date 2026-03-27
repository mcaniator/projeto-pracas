"use client";

import { PublicHeader } from "@/components/header/publicHeader";
import { usePathname } from "next/navigation";

const ConditionalPublicHeader = () => {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return <PublicHeader />;
};

export default ConditionalPublicHeader;
