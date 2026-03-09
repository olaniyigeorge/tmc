"use client";
import React from "react";
import { useRouter } from "next/navigation";

interface Props {
  results: any[];
}

const ResultsTable: React.FC<Props> = ({ results }) => {
  const router = useRouter();
  return (
    <table className="w-full border">
      <thead>
        <tr>
          <th>School</th>
          <th>Student</th>
          <th>Session</th>
          <th>Term</th>
          <th>Status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {results.map((r) => (
          <tr key={r._id} className="border-t">
            <td>{r.schoolName}</td>
            <td>{r.studentName || r.studentId}</td>
            <td>{r.session}</td>
            <td>{r.term}</td>
            <td>{r.status}</td>
            <td>
              <button
                className="text-blue-600 underline"
                onClick={() => router.push(`/admin/results/${r._id}/edit`)}
              >
                Open
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResultsTable;