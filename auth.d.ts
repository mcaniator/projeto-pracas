import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      isOauth: boolean;
      permissions: string[];
    };
  }

  interface User {
    id: string;
    username: string | null;
    permissions: string[];
    emailVerified?: Date | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    username: string;
    isOauth: boolean;
    permissions: string[];
  }
}
