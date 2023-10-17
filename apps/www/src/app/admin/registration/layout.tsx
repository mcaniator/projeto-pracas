import { NavBar } from "@/app/admin/registration/elements/navBar";
import { ReactNode } from "react";

const RegistrationLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className={"flex h-full flex-col"}>
      <NavBar />
      {children}
    </main>
  );
};

export default RegistrationLayout;
