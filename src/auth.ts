// src/auth.ts
// Auth.js v5 (next-auth@5) configuration.
// Exports { handlers, auth, signIn, signOut } — NOT a default export.
// Used in:
//   - src/app/api/auth/[...nextauth]/route.ts  → handlers
//   - any server component / route handler     → auth()
//   - client "use client" components           → signIn/signOut from next-auth/react

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Use JWT strategy — no database adapter needed
  session: { strategy: "jwt" },

  pages: {
    signIn: "/admin/login",
    error:  "/admin/login",
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          await connectToDatabase();

          const user = await User.findOne({
            email:    (credentials.email as string).toLowerCase().trim(),
            isActive: true,
          }).lean() as any;

          if (!user) return null;

          const valid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!valid) return null;

          // Shape returned here becomes the JWT token payload (via jwt callback below)
          return {
            id:       user._id.toString(),
            name:     user.name,
            email:    user.email,
            role:     user.role,
            schoolId: user.schoolId?.toString() ?? null,
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    // Persist extra fields into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id ?? "";
        token.role     = (user as any).role;
        token.schoolId = (user as any).schoolId ?? null;
      }
      return token;
    },

    // Expose token fields on the session.user object
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id       = token.id       as string;
        (session.user as any).role     = token.role     as string;
        (session.user as any).schoolId = token.schoolId as string | null;
      }
      return session;
    },
  },
});