import { auth } from "../../lib/auth/auth";
import { Header } from "../_components/header";

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  return (
    <div className="min-h-screen">
      <Header user={session?.user ?? null} isAuthHeader />
      {children}
    </div>
  );
};

export default AuthLayout;
