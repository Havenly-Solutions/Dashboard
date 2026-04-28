import { DefaultSession } from "next-auth";
import { Role } from "./index";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      status?: string;
      department?: string | null;
      accessToken?: string;
      refreshToken?: string;
      mustChangePassword?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: Role;
    status?: string;
    department?: string | null;
    accessToken?: string;
    refreshToken?: string;
    mustChangePassword?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    status?: string;
    department?: string | null;
    accessToken?: string;
    refreshToken?: string;
    mustChangePassword?: boolean;
  }
}
