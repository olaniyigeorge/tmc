// src/app/(auth)/admin/login/layout.tsx
// This file intentionally has NO auth check.
// It just renders the page bare (no sidebar shell).
// The already-logged-in redirect is handled in the page itself.

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}