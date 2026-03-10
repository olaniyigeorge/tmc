// src/types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id:       string;
      name:     string | null;
      email:    string;
      role:     "SUPER_ADMIN" | "SCHOOL_ADMIN" | "TEACHER";
      schoolId: string | null;
    };
  }
  interface User {
    role:     "SUPER_ADMIN" | "SCHOOL_ADMIN" | "TEACHER";
    schoolId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id:       string;
    role:     "SUPER_ADMIN" | "SCHOOL_ADMIN" | "TEACHER";
    schoolId: string | null;
  }
}