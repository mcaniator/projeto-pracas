import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string | null;
      email: string;
      image: string | null;
      isOauth: boolean;
      permissions: string[];
    };
  }

  interface User {
    //This interface is used in auth.js internal funcions.
    id: string;
    username: string | null;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string;
    username: string;
    email: string;
    image: string | null;
    isOauth: boolean;
    permissions: string[];
  }
}
