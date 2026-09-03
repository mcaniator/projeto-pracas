"use client";

import { useLogout } from "@/lib/serverFunctions/apiCalls/auth";
import { useRouter } from "next-nprogress-bar";
import { ReactNode, useEffect } from "react";

const AutoSignOut = ({
  children,
  userActive,
}: {
  children: ReactNode;
  userActive?: boolean | null;
}) => {
  const router = useRouter();
  const [logout] = useLogout({
    callbacks: {
      onSuccess: () => {
        router.replace("/");
      },
    },
  });

  useEffect(() => {
    if (userActive) return;

    void logout();
  }, [logout, router, userActive]);

  return children;
};

export default AutoSignOut;
