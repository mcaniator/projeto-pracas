import { Header } from "@components/header/header";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <Header variant="public" position="static" colorType="filled" />
      {children}
    </div>
  );
};

export default AuthLayout;
