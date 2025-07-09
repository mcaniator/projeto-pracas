import { HelperCardProvider } from "@components/context/helperCardContext";
import { Header } from "@components/header/header";
import { auth } from "@lib/auth/auth";

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
