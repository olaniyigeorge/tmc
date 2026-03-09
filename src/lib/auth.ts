import { auth } from "@/auth"; // your Auth.js config file at /src/auth.ts

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  schoolId?: string | null;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user) return null;
  return session.user as SessionUser;
}

export function requireRole(user: SessionUser | null, roles: string[]) {
  if (!user) throw new Error("Unauthorized");
  if (!roles.includes(user.role)) throw new Error("Forbidden");
}

export async function requireAdmin(roles: string[]): Promise<SessionUser> {
  const user = await getSessionUser();
  requireRole(user, roles);
  return user as SessionUser;
}

export function isSuperAdmin(user: SessionUser | null): boolean {
  return user?.role === "SUPER_ADMIN";
}

export function ensureSchoolAccess(
  user: SessionUser | null,
  schoolId: string | null | undefined
): void {
  if (!user) throw new Error("Unauthorized");
  if (user.role === "SUPER_ADMIN") return;
  if (!user.schoolId || user.schoolId !== schoolId) {
    throw new Error("Forbidden");
  }
}


