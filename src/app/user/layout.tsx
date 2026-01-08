import { Header } from "@components/header/header";
import { auth } from "@lib/auth/auth";
import { ReactNode } from "react";

const UserRoot = async ({ children }: { children: ReactNode }) => {
  const session = await auth();
  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-olivine to-asparagus text-white">
      <Header variant={"static"} user={session?.user ?? null} />
      <div className="flex min-h-0 flex-grow justify-center text-black">
        <div className="max-w-full basis-full">{children}</div>
      </div>
    </div>
  );
};

export default UserRoot;
