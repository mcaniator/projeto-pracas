"use client";

import { Header } from "@components/header/header";
import { useFetchCurrentUser } from "@lib/serverFunctions/apiCalls/auth";
import { ReactNode, useEffect, useState } from "react";

import type { CurrentUser } from "@/lib/serverFunctions/apiCalls/auth";

const UserRoot = ({ children }: { children: ReactNode }) => {
  const [fetchCurrentUser] = useFetchCurrentUser();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const response = await fetchCurrentUser({
        projectOptions: { silent: true },
      });
      setUser(response.data?.user ?? null);
    };

    void loadUser();
  }, []);

  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-olivine to-asparagus text-white">
      <Header
        variant="admin"
        position="static"
        colorType="filled"
        user={user}
      />
      <div className="flex min-h-0 flex-grow justify-center text-black">
        <div className="max-w-full basis-full">{children}</div>
      </div>
    </div>
  );
};

export default UserRoot;
