import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { connectToDatabase } from "./db";
import Result from "models/Result";

export function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function hashPin(pin: string): Promise<string> {
  const rounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);
  return bcrypt.hash(pin, rounds);
}

// generate a friendly verification code. tries to avoid collisions.
export async function generateVerificationCode(
  schoolAbbrev: string,
  session: string,
  term: string,
  className: string
): Promise<string> {
  await connectToDatabase();
  // build prefix
  const prefix = `${schoolAbbrev}-${session.replace("/", "")}-${
    term.toUpperCase().replace("ST", "").replace("ND", "").replace("RD", "")
  }-${className}`;
  let code: string;
  let exists = true;
  // try loop
  do {
    code = `${prefix}-${nanoid(5).toUpperCase()}`;
    exists = !!(await Result.exists({ verificationCode: code }));
  } while (exists);
  return code;
}
