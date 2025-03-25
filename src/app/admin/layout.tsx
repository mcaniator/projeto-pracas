import { Header } from "@/app/_components/header";
import Sidebar from "@/components/singleUse/admin/sidebar";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

const AdminRoot = ({ children }: { children: ReactNode }) => {
  const user = { type: "ADMIN", username: "placeholder", email: "placeholder" };
  if (user === null || user.type !== "ADMIN") redirect("/error");

  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-gray-950 to-black text-white">
      <Header variant={"static"} user={user} />
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
