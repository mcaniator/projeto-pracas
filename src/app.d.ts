/// <reference types="lucia" />

declare namespace Lucia {
  type Auth = import("@/lib/lucia").Auth;
  type DatabaseUserAttributes = {
    username: string;
    type: import("@prisma/client").$Enums.UserTypes;
  };
  type DatabaseSessionAttributes = Record<string, never>;
}
