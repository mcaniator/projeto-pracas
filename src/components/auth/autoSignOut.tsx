"use client";

import { signOut } from "next-auth/react";
import { ReactNode, useEffect } from "react";

const AutoSignOut = ({
  children,
  userActive,
}: {
  children: ReactNode;
  userActive?: boolean | null;
}) => {
  useEffect(() => {
    if (!userActive) void signOut({ redirect: true, redirectTo: "/" });
  }, [userActive]);

  return children;
};

export default AutoSignOut;
