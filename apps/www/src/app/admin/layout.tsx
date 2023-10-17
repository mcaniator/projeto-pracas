import Sidebar from "@/app/admin/sidebar";
import Header from "@/components/header";
import { ReactNode } from "react";

const AdminRoot = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-cambridge-blue to-mauve ">
      <Header variant={"static"} />
      <div className="flex min-h-0 flex-grow">
        <Sidebar />
        <div className="w-full rounded-tl-3xl bg-gray-700/10 shadow-inner">{children}</div>
      </div>
    </div>
  );
};

export default AdminRoot;
