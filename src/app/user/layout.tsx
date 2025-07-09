import { Header } from "@components/header/header";
import { auth } from "@lib/auth/auth";
import { ReactNode } from "react";

const UserRoot = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
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
