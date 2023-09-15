import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import { ReactNode } from "react";

const AdminRoot = ({ children }: { children: ReactNode }) => {
  return (
    <main className="flex h-[100vh] flex-col bg-gradient-to-br from-cambridge-blue to-mauve ">
      <Header className="static" />
      <div className="flex h-full">
        <Sidebar />
        <div className="w-full rounded-tl-3xl bg-white/20">{children}</div>
      </div>
    </main>
  );
};

export default AdminRoot;
