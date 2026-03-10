// /src/types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role: string;
    schoolId: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: string;
      schoolId: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    schoolId: string | null;
  }
}