import { HelperCardProvider } from "@components/context/helperCardContext";

import { auth } from "../../lib/auth/auth";
import { Header } from "../_components/header";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  return (
    <HelperCardProvider>
      <div className="min-h-screen">
        <Header user={session?.user ?? null} isAuthHeader />
        {children}
      </div>
    </HelperCardProvider>
  );
};

export default AuthLayout;
