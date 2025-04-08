import { SessionProvider } from "next-auth/react";

import UsernameForm from "./usernameForm";

const usernameWarning = () => {
  return (
    <SessionProvider>
      <UsernameForm />
    </SessionProvider>
  );
};

export default usernameWarning;
