import { type RoleName } from "@prisma/client";
import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      roles: RoleName[];
    };
  }

  interface User {
    id: string;
    roles: { name: RoleName }[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    roles?: RoleName[];
  }
}
