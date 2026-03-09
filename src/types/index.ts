export interface School {
  _id: string;
  name: string;
  type: "SECONDARY" | "PRIMARY";
  abbreviation?: string;
}

export interface Student {
  _id: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  classId: string;
}

export interface Result {
  _id: string;
  schoolId: string;
  studentId: string;
  classSnapshot: { classId: string; name: string; level: string };
  session: string;
  term: string;
  templateKey: string;
  subjects: any[];
  attendance?: any;
  ratings?: any;
  comments?: any;
  verificationCode: string;
}
