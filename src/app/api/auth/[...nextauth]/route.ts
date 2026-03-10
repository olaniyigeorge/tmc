// src/app/api/auth/[...nextauth]/route.ts
// Simply re-exports the handlers from src/auth.ts.
// Do NOT put NextAuth config here — it lives in src/auth.ts.

import { handlers } from "@/auth";

export const { GET, POST } = handlers;