import jwt from "jsonwebtoken";

const SECRET = process.env.NEXTAUTH_SECRET || "secret";

export function signResultAccess(resultId: string) {
  return jwt.sign({ resultId }, SECRET, { expiresIn: "30m" });
}

export function verifyResultAccess(token: string) {
  try {
    return jwt.verify(token, SECRET) as { resultId: string };
  } catch (e) {
    return null;
  }
}
