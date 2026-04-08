"use client";

import { Header } from "@/components/header/header";
import { usePathname } from "next/navigation";

const ConditionalPublicHeader = () => {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/auth");
  const isUserRoute = pathname.startsWith("/user");

  if (isAdminRoute || isAuthRoute || isUserRoute) {
    return null;
  }

  return <Header variant="public" position="static" colorType="filled" />;
};

export default ConditionalPublicHeader;
