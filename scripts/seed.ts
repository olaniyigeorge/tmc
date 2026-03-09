import { connectToDatabase } from "../src/lib/db";
import School from "../src/models/School";
import ClassModel from "../src/models/Class";
import User from "../src/models/User";
import bcrypt from "bcrypt";

async function run() {
  const env = process.env.NODE_ENV;
  if (env === "production") {
    console.error("Refusing to seed in production");
    process.exit(1);
  }
  await connectToDatabase();
  console.log("Seeding database...");

  // schools
  const tmc = await School.findOneAndUpdate(
    { name: "Tinabel Model College" },
    { name: "Tinabel Model College", type: "SECONDARY", abbreviation: "TMC" },
    { upsert: true, new: true }
  );
  const tcs = await School.findOneAndUpdate(
    { name: "Tinuola Children School" },
    { name: "Tinuola Children School", type: "PRIMARY", abbreviation: "TCS" },
    { upsert: true, new: true }
  );

  // classes
  await ClassModel.updateOne(
    { schoolId: tmc._id, name: "JSS1A" },
    { schoolId: tmc._id, name: "JSS1A", level: "JSS" },
    { upsert: true }
  );
  await ClassModel.updateOne(
    { schoolId: tcs._id, name: "Primary 3" },
    { schoolId: tcs._id, name: "Primary 3", level: "PRIMARY" },
    { upsert: true }
  );

  // super admin
  const email = "admin@tinabel.local";
  const password = "Admin123!";
  const existing = await User.findOne({ email });
  if (!existing) {
    const hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10));
    await User.create({
      schoolId: null,
      name: "Super Admin",
      email,
      passwordHash: hash,
      role: "SUPER_ADMIN",
      isActive: true,
    });
    console.log(`Created super admin with email ${email} password ${password}`);
  } else {
    console.log("Super admin already exists");
  }

  console.log("Seeding complete.");
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
