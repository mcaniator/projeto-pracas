"use client";

import { Role } from "@prisma/client";
import React, { ReactNode, createContext } from "react";

type UserContextType = {
  id: string;
  username: string | null;
  email: string;
  image: string | null;
  roles: Role[];
};

const UserContext = createContext<UserContextType | null>(null);

const UserContextProvider = ({
  user,
  children,
}: {
  user: UserContextType;
  children: ReactNode;
}) => {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
};

const useUserContext = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};

export { UserContext, UserContextProvider, useUserContext };
