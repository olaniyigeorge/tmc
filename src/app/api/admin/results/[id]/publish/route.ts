import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Result from "@/models/Result";
import { getSessionUser, ensureSchoolAccess } from "@/lib/auth";
import { generatePin, hashPin, generateVerificationCode } from "@/lib/codes";


interface Ctx { params: Promise<{ id: string }> }

export async function POST(
  req: NextRequest,
  { params }: Ctx) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "SCHOOL_ADMIN" && user.role !== "TEACHER")) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    await connectToDatabase();
    const result = await Result.findById((await params).id);
    if (!result) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }
    ensureSchoolAccess(user, result.schoolId.toString());
    if (result.status === "PUBLISHED") {
      return NextResponse.json({ ok: false, error: "Already published" }, { status: 400 });
    }
    const pin = generatePin();
    const pinHash = await hashPin(pin);
    // generate verification code
    // need school abbreviation and other info
    const School = (await import("@/models/School")).default;
    const school = await School.findById(result.schoolId);
    const schoolAbbr = school?.abbreviation || school?.name?.split(" ")[0].toUpperCase();
    const code = await generateVerificationCode(
      schoolAbbr,
      result.session,
      result.term,
      result.classSnapshot.name
    );
    result.status = "PUBLISHED";
    result.publishedAt = new Date();
    result.issuedAt = new Date();
    result.pinHash = pinHash;
    result.verificationCode = code;
    await result.save();
    return NextResponse.json({ ok: true, data: { verificationCode: code, pin } });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}
