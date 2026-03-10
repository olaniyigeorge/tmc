import mongoose, { Document, Schema } from "mongoose";
import { Types } from "mongoose";

export interface IClass extends Document {
  schoolId: Types.ObjectId;
  name: string;
  level: "NURSERY" | "PRIMARY" | "JSS" | "SS";
}

const ClassSchema = new Schema<IClass>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    name: { type: String, required: true },
    level: {
      type: String,
      required: true,
      enum: ["NURSERY", "PRIMARY", "JSS", "SS"],
    },
  },
  { timestamps: true }
);

ClassSchema.index({ schoolId: 1, name: 1 }, { unique: true });

export default mongoose.models.Class || mongoose.model<IClass>("Class", ClassSchema);
