"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const VerifyCodePage = () => {
  const params = useParams();
  const code = params.code;
  const [info, setInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (code) {
      fetch(`/api/public/verify/${code}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.ok) setInfo(j.data);
          else setError(j.error);
        });
    }
  }, [code]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Verification Result</h1>
      {info ? (
        info.valid ? (
          <div>
            <p>School: {info.schoolName}</p>
            <p>Student: {info.studentName}</p>
            <p>Class: {info.className}</p>
            <p>Session: {info.session}</p>
            <p>Term: {info.term}</p>
            <p>Issued: {new Date(info.issuedAt).toLocaleString()}</p>
          </div>
        ) : (
          <p>Invalid code</p>
        )
      ) : error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default VerifyCodePage;
