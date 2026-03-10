import { z } from "zod";

export const schoolSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["SECONDARY", "PRIMARY"]),
  address: z.string().optional(),
  logoUrl: z.string().url().optional(),
  abbreviation: z.string().optional(),
});

export const classSchema = z.object({
  schoolId: z.string(),
  name: z.string().min(1),
  level: z.enum(["NURSERY", "PRIMARY", "JSS", "SS"]),
});

export const studentCreateSchema = z.object({
  schoolId: z.string(),
  classId: z.string(),
  admissionNo: z.string().optional(),
  studentCode: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  otherName: z.string().optional(),
  dob: z.string().optional(),
  sex: z.enum(["M", "F"]).optional(),
  lga: z.string().optional(),
  yearAdmitted: z.number().optional(),
});

export const studentUpdateSchema = studentCreateSchema.partial();

export const resultQuerySchema = z.object({
  schoolId: z.string().optional(),
  classId: z.string().optional(),
  session: z.string().optional(),
  term: z.enum(["1st", "2nd", "3rd"]).optional(),
});
