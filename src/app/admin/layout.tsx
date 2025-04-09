import { Header } from "@/app/_components/header";
import Sidebar from "@/components/singleUse/admin/sidebar";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { auth } from "../../lib/auth/auth";
import { getUsernameById } from "../../serverActions/userUtil";

const AdminRoot = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  const username = await getUsernameById(session?.user.id ?? "");
  console.log("session", session);
  if (!username) {
    redirect("/user/usernameWarning");
  }
  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-gray-950 to-black text-white">
      <Header variant={"static"} user={session?.user ?? null} />
      <div className="flex min-h-0 flex-grow justify-center">
        <Sidebar />
        <div className="max-w-full basis-full rounded-3xl bg-gray-700/10 shadow-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
