// scripts/seed.ts
// Run with:  npx tsx scripts/seed.ts
// Or add to package.json: "seed": "tsx scripts/seed.ts"
//
// SAFE TO RE-RUN — uses upsert/findOrCreate patterns, won't duplicate data.

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import path from "path";

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI is not set in .env");
  process.exit(1);
}

// ── Inline schema definitions (avoids tsconfig path alias issues in scripts) ──

const SchoolSchema = new mongoose.Schema(
  {
    name:    { type: String, required: true, unique: true, trim: true },
    type:    { type: String, required: true, enum: ["SECONDARY", "PRIMARY"] },
    abbrev:  { type: String, required: true, unique: true, trim: true, uppercase: true },
    address: { type: String },
    logoUrl: { type: String },
  },
  { timestamps: true }
);

const UserSchema = new mongoose.Schema(
  {
    schoolId:     { type: mongoose.Schema.Types.ObjectId, ref: "School", default: null },
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role:         { type: String, required: true, enum: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"] },
    isActive:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ClassSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    name:     { type: String, required: true },
    level:    { type: String, required: true, enum: ["NURSERY", "PRIMARY", "JSS", "SS"] },
  },
  { timestamps: true }
);
ClassSchema.index({ schoolId: 1, name: 1 }, { unique: true });

// Use existing models if already registered (safe for re-runs)
const School = mongoose.models.School ?? mongoose.model("School", SchoolSchema);
const User   = mongoose.models.User   ?? mongoose.model("User",   UserSchema);
const Class  = mongoose.models.Class  ?? mongoose.model("Class",  ClassSchema);

// ── Data ──────────────────────────────────────────────────────────────────────

const SCHOOLS = [
  {
    name:   "Tinabel Model College",
    type:   "SECONDARY" as const,
    abbrev: "TMC",
    address: "Tinabel, Nigeria",
  },
  {
    name:   "Tinuola Children School",
    type:   "PRIMARY" as const,
    abbrev: "TCS",
    address: "Tinuola, Nigeria",
  },
];

const SECONDARY_CLASSES = [
  { name: "JSS1A", level: "JSS" },
  { name: "JSS1B", level: "JSS" },
  { name: "JSS2A", level: "JSS" },
  { name: "JSS2B", level: "JSS" },
  { name: "JSS3A", level: "JSS" },
  { name: "JSS3B", level: "JSS" },
  { name: "SS1A",  level: "SS"  },
  { name: "SS1B",  level: "SS"  },
  { name: "SS2A",  level: "SS"  },
  { name: "SS2B",  level: "SS"  },
  { name: "SS3A",  level: "SS"  },
  { name: "SS3B",  level: "SS"  },
];

const PRIMARY_CLASSES = [
  { name: "Nursery 1",  level: "NURSERY" },
  { name: "Nursery 2",  level: "NURSERY" },
  { name: "KG",         level: "NURSERY" },
  { name: "Primary 1",  level: "PRIMARY" },
  { name: "Primary 2",  level: "PRIMARY" },
  { name: "Primary 3",  level: "PRIMARY" },
  { name: "Primary 4",  level: "PRIMARY" },
  { name: "Primary 5",  level: "PRIMARY" },
  { name: "Primary 6",  level: "PRIMARY" },
];

const SUPER_ADMIN = {
  name:     "Super Admin",
  email:    "admin@tinabel.local",
  password: "Admin123!",
  role:     "SUPER_ADMIN" as const,
};

// ── Seed function ─────────────────────────────────────────────────────────────

async function seed() {
  console.log("\n🌱  Connecting to MongoDB…");
  await mongoose.connect(MONGODB_URI as string, {dbName: process.env.MONGO_DB_NAME as string});
  console.log("✅  Connected\n");

  // 1. Schools
  console.log("📚  Seeding schools…");
  const schoolIds: Record<string, mongoose.Types.ObjectId> = {};

  for (const s of SCHOOLS) {
    const school = await School.findOneAndUpdate(
      { abbrev: s.abbrev },
      { $setOnInsert: s },
      { upsert: true, new: true }
    );
    schoolIds[s.abbrev] = school._id;
    console.log(`   ${school.abbrev} — ${school.name} (${school.type})`);
  }

  // 2. Classes
  console.log("\n🏫  Seeding classes…");

  const tmcId = schoolIds["TMC"];
  const tcsId = schoolIds["TCS"];

  let classCount = 0;
  for (const c of SECONDARY_CLASSES) {
    await Class.findOneAndUpdate(
      { schoolId: tmcId, name: c.name },
      { $setOnInsert: { schoolId: tmcId, ...c } },
      { upsert: true, new: true }
    );
    classCount++;
  }
  for (const c of PRIMARY_CLASSES) {
    await Class.findOneAndUpdate(
      { schoolId: tcsId, name: c.name },
      { $setOnInsert: { schoolId: tcsId, ...c } },
      { upsert: true, new: true }
    );
    classCount++;
  }
  console.log(`   ${classCount} classes seeded (TMC: ${SECONDARY_CLASSES.length}, TCS: ${PRIMARY_CLASSES.length})`);

  // 3. Super admin
  console.log("\n👤  Seeding super admin…");
  const existing = await User.findOne({ email: SUPER_ADMIN.email });

  if (existing) {
    console.log(`   Already exists — ${SUPER_ADMIN.email}`);
  } else {
    const hash = await bcrypt.hash(SUPER_ADMIN.password, 10);
    await User.create({
      name:         SUPER_ADMIN.name,
      email:        SUPER_ADMIN.email,
      passwordHash: hash,
      role:         SUPER_ADMIN.role,
      schoolId:     null,
      isActive:     true,
    });
    console.log(`   Created — ${SUPER_ADMIN.email}`);
  }

  // 4. Summary
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✅  Seed complete!\n");
  console.log("   Super Admin login:");
  console.log(`   Email    : ${SUPER_ADMIN.email}`);
  console.log(`   Password : ${SUPER_ADMIN.password}`);
  console.log("\n   Schools created:");
  for (const s of SCHOOLS) {
    console.log(`   • ${s.name} (${s.abbrev}) — ${s.type}`);
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  mongoose.disconnect();
  process.exit(1);
});