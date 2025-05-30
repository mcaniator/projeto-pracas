import { auth } from "./auth";

const getSessionUserIdServer = async () => {
  const session = await auth();
  return session?.user.id;
};

export { getSessionUserIdServer };
