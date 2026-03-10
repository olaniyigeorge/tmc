// src/app/api/admin/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import School from "@/models/School";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, schoolId, role } = body;

    // ── Basic validation ─────────────────────────────────────────
    if (!name?.trim())     return NextResponse.json({ ok: false, error: "Name is required." }, { status: 400 });
    if (!email?.trim())    return NextResponse.json({ ok: false, error: "Email is required." }, { status: 400 });
    if (!password)         return NextResponse.json({ ok: false, error: "Password is required." }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." }, { status: 400 });
    if (!schoolId)         return NextResponse.json({ ok: false, error: "Please select a school." }, { status: 400 });

    // Only allow SCHOOL_ADMIN or TEACHER roles via self-signup
    // SUPER_ADMIN must be created via seed script
    const allowedRoles = ["SCHOOL_ADMIN", "TEACHER"];
    const assignedRole = allowedRoles.includes(role) ? role : "SCHOOL_ADMIN";

    await connectToDatabase();

    // ── School must exist ────────────────────────────────────────
    const school = await School.findById(schoolId).lean() as any;
    if (!school) return NextResponse.json({ ok: false, error: "Selected school not found." }, { status: 400 });

    // ── Email must be unique ─────────────────────────────────────
    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) return NextResponse.json({ ok: false, error: "An account with this email already exists." }, { status: 409 });

    // ── Hash password ────────────────────────────────────────────
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS ?? "10", 10);
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // ── Create user ──────────────────────────────────────────────
    const user = await User.create({
      name:         name.trim(),
      email:        email.trim().toLowerCase(),
      passwordHash,
      role:         assignedRole,
      schoolId,
      isActive:     true,
    });

    return NextResponse.json({
      ok: true,
      data: {
        id:       user._id.toString(),
        name:     user.name,
        email:    user.email,
        role:     user.role,
        schoolId: user.schoolId?.toString(),
      },
    }, { status: 201 });

  } catch (err: any) {
    console.error("[signup]", err);
    return NextResponse.json(
      { ok: false, error: err.message || "Server error" },
      { status: 500 }
    );
  }
}
