"use client";

import LoadingIcon from "@/components/LoadingIcon";
import { Header } from "@/components/header/header";
import Sidebar from "@/components/singleUse/admin/sidebar";
import AutoSignOut from "@components/auth/autoSignOut";
import { UserContextProvider } from "@components/context/UserContext";
import {
  CurrentUser,
  useFetchCurrentUser,
} from "@lib/serverFunctions/apiCalls/auth";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect, useState } from "react";

const AdminRoot = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [fetchCurrentUser] = useFetchCurrentUser();
  const [user, setUser] = useState<CurrentUser | null>();

  useEffect(() => {
    const loadUser = async () => {
      const response = await fetchCurrentUser({
        projectOptions: { silent: true },
      });
      if (!response.data?.user) {
        setUser(null);
        router.replace("/auth/login");
        return;
      }

      setUser(response.data.user);
    };

    void loadUser();
  }, [router, fetchCurrentUser]);

  useEffect(() => {
    if (user && user.roles.length === 0) {
      router.replace("/user/accessDenied");
    }
  }, [router, user]);

  if (!user || user.roles.length === 0) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-white">
        <LoadingIcon size={128} />
      </div>
    );
  }

  return (
    <AutoSignOut userActive={user.active}>
      <UserContextProvider initialUserInfo={user}>
        <div className="white flex h-[100dvh] flex-col bg-gradient-to-br from-olivine to-asparagus text-white">
          <Header
            variant="admin"
            position="static"
            colorType="filled"
            user={user}
          />
          <div className="flex min-h-0 flex-grow justify-center">
            <Sidebar />
            <div className="max-w-full basis-full bg-white">{children}</div>
          </div>
        </div>
      </UserContextProvider>
    </AutoSignOut>
  );
};

export default AdminRoot;
