import mongoose, { Document, Schema } from "mongoose";
import { Types } from "mongoose";

export interface IUser extends Document {
  schoolId: Types.ObjectId | null;
  name: string;
  email: string;
  passwordHash: string;
  role: "SUPER_ADMIN" | "SCHOOL_ADMIN" | "TEACHER";
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", default: null },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ["SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER"],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
