import { z } from "zod";

export const checkSchema = z.object({
  schoolId: z.string(),
  studentCode: z.string(),
  pin: z.string(),
  session: z.string(),
  term: z.enum(["1st", "2nd", "3rd"]),
});

export const verifySchema = z.object({
  code: z.string().min(1),
});
