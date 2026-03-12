import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import School from "@/models/School";

/**
 * GET /api/public/schools
 * Returns the list of schools for the public check/verify forms.
 * No authentication required — only exposes name, type, and _id.
 * No sensitive data (addresses, configs, etc.) is returned.
 */
export async function GET() {
  try {
    await connectToDatabase();

    const schools = await School.find({ }, "_id name type").sort({ name: 1 }).lean();

    return NextResponse.json({ ok: true, data: schools });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Error" }, { status: 500 });
  }
}