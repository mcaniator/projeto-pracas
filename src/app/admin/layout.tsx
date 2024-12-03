import { Header } from "@/app/_components/header";
import Sidebar from "@/components/singleUse/admin/sidebar";
import { validateRequest } from "@/lib/lucia";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AdminRoot = async ({ children }: { children: ReactNode }) => {
  const { user } = await validateRequest();
  if (user === null || user.type !== "ADMIN") redirect("/error");

  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-gray-600 to-gray-500">
      <Header variant={"static"} user={user} />
      <div className="flex min-h-0 flex-grow">
        <Sidebar />
        <div className="max-w-[85%] basis-[85%] rounded-tl-3xl bg-gray-700/10 shadow-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
