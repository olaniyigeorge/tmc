import mongoose, { Document, Schema } from "mongoose";
import { Types } from "mongoose";

export type RatingScale = "A_E" | "ONE_FIVE";

export interface IResultSubject {
  name: string;
  scores: Record<string, number>;
  total: number;
  grade?: string;
  remark?: string;
  lastTermTotal?: number | null;
  cumulative?: number | null;
  average?: number | null;
}

export interface IResult extends Document {
  schoolId: Types.ObjectId;
  studentId: Types.ObjectId;
  classSnapshot: { classId: Types.ObjectId; name: string; level: string };
  session: string;
  term: "1st" | "2nd" | "3rd";
  totalInClass?: number;
  templateKey: string;
  attendance?: {
    opened?: number;
    present?: number;
    punctual?: number;
    absent?: number;
  };
  subjects: IResultSubject[];
  ratings?: {
    scale: RatingScale;
    items: Record<string, string>;
  };
  comments?: {
    classTeacher?: string;
    headmaster?: string;
    principal?: string;
    parent?: string;
  };
  status: "DRAFT" | "PUBLISHED";
  publishedAt?: Date;
  pinHash?: string;
  verificationCode: string;
  issuedAt?: Date;
  createdBy: Types.ObjectId;
}

const SubjectSchema = new Schema<IResultSubject>(
  {
    name: { type: String, required: true },
    scores: { type: Map, of: Number },
    total: { type: Number, required: true },
    grade: String,
    remark: String,
    lastTermTotal: { type: Number, default: null },
    cumulative: { type: Number, default: null },
    average: { type: Number, default: null },
  },
  { _id: false }
);

const ResultSchema = new Schema<IResult>(
  {
    schoolId: { type: Schema.Types.ObjectId, ref: "School", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    classSnapshot: {
      classId: { type: Schema.Types.ObjectId, ref: "Class", required: true },
      name: { type: String, required: true },
      level: { type: String, required: true },
    },
    session: { type: String, required: true },
    term: { type: String, required: true, enum: ["1st", "2nd", "3rd"] },
    totalInClass: Number,
    templateKey: { type: String, required: true },
    attendance: {
      opened: Number,
      present: Number,
      punctual: Number,
      absent: Number,
    },
    subjects: [SubjectSchema],
    ratings: {
      scale: { type: String, enum: ["A_E", "ONE_FIVE"] },
      items: { type: Map, of: String },
    },
    comments: {
      classTeacher: String,
      headmaster: String,
      principal: String,
      parent: String,
    },
    status: { type: String, default: "DRAFT", enum: ["DRAFT", "PUBLISHED"] },
    publishedAt: Date,
    pinHash: String,
    verificationCode: { type: String, required: true, unique: true },
    issuedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

ResultSchema.index({ schoolId: 1, studentId: 1, session: 1, term: 1 }, { unique: true });

export default mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);
