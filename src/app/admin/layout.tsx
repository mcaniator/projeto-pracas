"use client";

import { Header } from "@/components/header/header";
import Sidebar from "@/components/singleUse/admin/sidebar";
import adminSQLiteDb from "@/lib/capacitor/sqlite/adminSQLiteDb/adminSQLiteDb";
import { Capacitor } from "@capacitor/core";
import { Network } from "@capacitor/network";
import AutoSignOut from "@components/auth/autoSignOut";
import { UserContextProvider } from "@components/context/UserContext";
import { useFetchCurrentUser } from "@lib/serverFunctions/apiCalls/auth";
import type { CurrentUser } from "@lib/serverFunctions/queries/user";
import { CircularProgress } from "@mui/material";
import { Role } from "@prisma/client";
import { useRouter } from "next-nprogress-bar";
import { ReactNode, useCallback, useEffect, useState } from "react";

const AdminRoot = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const [fetchCurrentUser] = useFetchCurrentUser();
  const [user, setUser] = useState<CurrentUser | null>();

  const offlineLogin = useCallback(async () => {
    const user = await adminSQLiteDb.query({
      statement: `SELECT * FROM "current_user"`,
    });
    const SQLiteUserRaw = user.values[0];
    if (!SQLiteUserRaw) {
      setUser(null);
      router.replace("/auth/login");
      return;
    }

    const SQLiteUserParsed = {
      id: SQLiteUserRaw.id,
      email: SQLiteUserRaw.email,
      image: SQLiteUserRaw.image,
      username: SQLiteUserRaw.username,
      roles: JSON.parse(String(SQLiteUserRaw.roles)) as Role[],
      active: SQLiteUserRaw.active === 1,
    } as CurrentUser;
    setUser(SQLiteUserParsed);
  }, [router]);

  useEffect(() => {
    //This is the user login check.
    //TODO: The code is too complex to be declared inside the component. Check if it can be refactored
    const loadUser = async () => {
      const capacitorNetWorkStatus = await Network.getStatus();
      if (!Capacitor.isNativePlatform() || capacitorNetWorkStatus.connected) {
        const response = await fetchCurrentUser({
          projectOptions: { silent: true },
        });
        if (!response.data?.user) {
          if (response.responseInfo.statusCode === 401) {
            // API responded, but user is not logged in or not active
            if (Capacitor.isNativePlatform()) {
              await adminSQLiteDb.clear();
              await adminSQLiteDb.executeTransaction([
                {
                  statement: `DELETE FROM "current_user";`,
                },
              ]);
            }

            setUser(null);
            router.replace("/auth/login");
            return;
          } else {
            //Server malfunction
            if (Capacitor.isNativePlatform()) {
              void offlineLogin();
            }

            return;
          }
        }
        if (Capacitor.isNativePlatform()) {
          await adminSQLiteDb.executeTransaction([
            {
              statement: `DELETE FROM "current_user";`,
            },
            {
              statement: `INSERT INTO "current_user" (id, email, image, username, roles, active) VALUES (?, ?, ?, ?, ?, ?);`,
              values: [
                response.data.user.id,
                response.data.user.email,
                response.data.user.image,
                response.data.user.username,
                JSON.stringify(response.data.user.roles),
                response.data.user.active ? 1 : 0,
              ],
            },
          ]);
        }

        setUser(response.data.user);
      } else {
        if (Capacitor.isNativePlatform()) {
          // If offline, get user from SQLite
          void offlineLogin();
        }
      }
    };

    void loadUser();
  }, [router, fetchCurrentUser, offlineLogin]);

  useEffect(() => {
    if (user && user.roles.length === 0) {
      router.replace("/user/accessDenied");
    }
  }, [router, user]);

  if (!user || user.roles.length === 0) {
    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center bg-white">
        <CircularProgress size={128} />
        <p className="text-2xl">Carregando dados de usuário...</p>
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
