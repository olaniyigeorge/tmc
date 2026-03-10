import React from "react";
import { Result } from "@/types";
import PrintButton from "./PrintButton";

interface Props {
  result: Result;
}

const ResultSheetSecondary: React.FC<Props> = ({ result }) => {
  const r: any = result;
  return (
    <div className="p-4">
      <div className="no-print mb-4">
        <PrintButton />
      </div>
      <h1 className="text-center text-2xl font-bold">{r.schoolName || ""}</h1>
      <p>Class: {r.classSnapshot.name} - {r.session} {r.term}</p>
      <p>Student: {r.studentName}</p>
      <table className="w-full border-collapse" border={1}>
        <thead>
          <tr>
            <th>Subject</th>
            <th>Test1</th>
            <th>Test2</th>
            <th>Exam</th>
            <th>Total</th>
            <th>Grade</th>
          </tr>
        </thead>
        <tbody>
          {r.subjects.map((s: any, idx: number) => (
            <tr key={idx}>
              <td>{s.name}</td>
              <td>{s.scores.test1}</td>
              <td>{s.scores.test2}</td>
              <td>{s.scores.exam}</td>
              <td>{s.total}</td>
              <td>{s.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <footer className="mt-4">
        Verify at /verify with code: {r.verificationCode}
      </footer>
    </div>
  );
};

export default ResultSheetSecondary;