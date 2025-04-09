import { redirect } from "next/navigation";
import { ReactNode } from "react";

import { auth } from "../../lib/auth/auth";
import { Header } from "../_components/header";

const UserRoot = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  /*if (!session?.user) {
    redirect("/login");
  }*/
  console.log("session", session);
  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-gray-950 to-black text-white">
      <Header variant={"static"} user={session?.user ?? null} />
      <div className="flex min-h-0 flex-grow justify-center">
        <div className="max-w-full basis-full rounded-3xl bg-gray-700/10 shadow-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserRoot;
