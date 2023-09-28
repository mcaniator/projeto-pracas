import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { ReactNode } from "react";

const AdminRoot = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex h-[100dvh] flex-col bg-gradient-to-br from-cambridge-blue to-mauve ">
      <Header variant={"static"} />
      <div className="flex h-full">
        <Sidebar />
        <div className="w-full rounded-tl-3xl bg-gray-700/10 shadow-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminRoot;
