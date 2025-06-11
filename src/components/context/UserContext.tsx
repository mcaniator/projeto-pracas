"use client";

import { Role } from "@prisma/client";
import React, { ReactNode, createContext, useState } from "react";

import {
  RoleGroup,
  checkIfRolesArrayContainsAll,
  checkIfRolesArrayContainsAny,
} from "../../lib/auth/rolesUtil";

type UserData = {
  id: string;
  username: string | null;
  email: string;
  image: string | null;
  roles: Role[];
};

type UserContextType = {
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
  updateUser: (newUserInfo: Partial<UserData>) => void;
  checkIfLoggedInUserHasAccess: ({
    requiredAnyRoleGroups,
    requiredAnyRoles,
    requiredAllRolesGroups,
    requiredAllRoles,
  }: {
    requiredAnyRoleGroups?: RoleGroup[];
    requiredAnyRoles?: Role[];
    requiredAllRolesGroups?: RoleGroup[];
    requiredAllRoles?: Role[];
  }) => boolean;
};

const UserContext = createContext<UserContextType | null>(null);

const UserContextProvider = ({
  initialUserInfo,
  children,
}: {
  initialUserInfo: UserData;
  children: ReactNode;
}) => {
  const [user, setUser] = useState<UserData>(initialUserInfo);
  const updateUser = (newUserInfo: Partial<UserData>) => {
    setUser((prevUser) => ({
      ...prevUser,
      ...newUserInfo,
    }));
  };
  const checkIfLoggedInUserHasAccess = ({
    requiredAnyRoleGroups,
    requiredAnyRoles,
    requiredAllRolesGroups,
    requiredAllRoles,
  }: {
    requiredAnyRoleGroups?: RoleGroup[];
    requiredAnyRoles?: Role[];
    requiredAllRolesGroups?: RoleGroup[];
    requiredAllRoles?: Role[];
  }) => {
    const userHasAccessAny = checkIfRolesArrayContainsAny(user.roles, {
      roleGroups: requiredAnyRoleGroups,
      roles: requiredAnyRoles,
    });
    const userHasAccessAll = checkIfRolesArrayContainsAll(user.roles, {
      roleGroups: requiredAllRolesGroups,
      roles: requiredAllRoles,
    });
    return userHasAccessAll && userHasAccessAny;
  };
  return (
    <UserContext.Provider
      value={{ user, setUser, updateUser, checkIfLoggedInUserHasAccess }}
    >
      {children}
    </UserContext.Provider>
  );
};

const useUserContext = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};

export { UserContext, UserContextProvider, useUserContext };
