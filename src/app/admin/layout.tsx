import { Header } from "@/components/header/header";
import Sidebar from "@/components/singleUse/admin/sidebar";
import AutoSignOut from "@components/auth/autoSignOut";
import { UserContextProvider } from "@components/context/UserContext";
import { HelperCardProvider } from "@components/context/helperCardContext";
import { auth } from "@lib/auth/auth";
import { getUserAuthInfo } from "@queries/user";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AdminRoot = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  const user = await getUserAuthInfo(session?.user?.id);

  if (!user) {
    redirect("/auth/login");
  }
  if (!user?.username) {
    redirect("/user/usernameWarning");
  }
  if (user?.roles.length === 0) {
    redirect("/user/accessDenied");
  }
  return (
    <AutoSignOut userActive={user.active}>
      <UserContextProvider initialUserInfo={user}>
        <HelperCardProvider>
          <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-gray-950 to-black text-white">
            <Header variant={"static"} user={user ?? null} />
            <div className="flex min-h-0 flex-grow justify-center">
              <Sidebar />
              <div className="max-w-full basis-full rounded-3xl bg-gray-700/10 shadow-inner">
                {children}
              </div>
            </div>
          </div>
        </HelperCardProvider>
      </UserContextProvider>
    </AutoSignOut>
  );
};

export default AdminRoot;
