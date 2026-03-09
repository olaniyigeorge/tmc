import mongoose, { Document, Schema } from "mongoose";

export interface ISchool extends Document {
  name: string;
  type: "SECONDARY" | "PRIMARY";
  address?: string;
  logoUrl?: string;
  abbreviation?: string;
}

const SchoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ["SECONDARY", "PRIMARY"] },
    address: String,
    logoUrl: String,
    abbreviation: String,
  },
  { timestamps: true }
);

export default mongoose.models.School || mongoose.model<ISchool>("School", SchoolSchema);
