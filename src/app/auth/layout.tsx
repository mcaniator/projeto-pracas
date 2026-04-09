import { HelperCardProvider } from "@components/context/helperCardContext";
import { Header } from "@components/header/header";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <HelperCardProvider>
      <div className="flex h-full min-h-0 flex-1 flex-col">
        <Header variant="public" position="static" colorType="filled" />
        {children}
      </div>
    </HelperCardProvider>
  );
};

export default AuthLayout;
