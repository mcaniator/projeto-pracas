import { Role } from "@prisma/client";

type TableUser = {
  id: string;
  image: string | null;
  username?: string | null;
  email: string;
  name: string | null;
  active: boolean;
  createdAt: Date;
  roles: Role[];
};

export { type TableUser };
