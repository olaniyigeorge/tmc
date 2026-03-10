import mongoose, { Document, Schema } from "mongoose";
import { Types } from "mongoose";

export interface IStudent extends Document {
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  admissionNo?: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  otherName?: string;
  dob?: Date;
  sex?: "M" | "F";
  lga?: string;
  yearAdmitted?: number;
  isActive: boolean;
}

const StudentSchema = new Schema<IStudent>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
    admissionNo: { type: String },
    studentCode: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    otherName: String,
    dob: Date,
    sex: { type: String, enum: ["M", "F"] },
    lga: String,
    yearAdmitted: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

StudentSchema.index({ schoolId: 1, studentCode: 1 }, { unique: true });
StudentSchema.index({ schoolId: 1, admissionNo: 1 }, { unique: true, sparse: true });

export default mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);
