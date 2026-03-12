import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Result from "@/models/Result";
import School from "@/models/School";
import { verifyResultAccess } from "@/lib/jwt";

interface Ctx { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Ctx) {
  try {
    const token = req.cookies.get("result_access")?.value;
    if (!token) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const payload = verifyResultAccess(token);
    if (!payload || payload.resultId !== id) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Populate studentId so the result sheet gets the full object
    const result = await Result.findById(id)
      .populate("studentId", "firstName lastName otherName studentCode admissionNo sex dob")
      .lean() as any;

    if (!result) {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const school = await School.findById(result.schoolId).lean() as any;

    return NextResponse.json({
      ok: true,
      data: {
        ...result,
        // Keep studentId as the populated object — the sheet reads studentId.firstName etc.
        // Also attach flat helpers for any components that use them
        studentName: result.studentId
          ? `${result.studentId.lastName} ${result.studentId.firstName}`
          : "",
        schoolName: school?.name ?? "",
        schoolAddress: school?.address ?? "",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}