import { Header } from "@/app/_components/header";
import Sidebar from "@/components/singleUse/admin/sidebar";
import { validateRequest } from "@/lib/lucia";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AdminRoot = async ({ children }: { children: ReactNode }) => {
  const { user } = await validateRequest();
  if (user === null || user.type !== "ADMIN") redirect("/error");

  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-gray-950 to-black">
      <Header variant={"static"} user={user} />
      <div className="flex min-h-0 flex-grow justify-center">
        <Sidebar />
        <div className="max-w-full basis-full rounded-3xl bg-gray-700/10 shadow-inner sm:max-w-[99%] sm:basis-[99%]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
