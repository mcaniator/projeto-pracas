import { auth } from "./auth";

const getSessionUserId = async () => {
  const session = await auth();
  return session?.user.id;
};

const getSessionUser = async () => {
  const session = await auth();
  return session?.user;
};

export { getSessionUserId, getSessionUser };
