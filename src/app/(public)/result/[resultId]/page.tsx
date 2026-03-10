"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ResultSheetSecondary from "@/components/public/ResultSheetSecondary";
import ResultSheetPrimary from "@/components/public/ResultSheetPrimary";

const ResultViewPage: React.FC = () => {
  const params = useParams();
  const id = params.resultId;
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/public/result/${id}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.ok) setResult(j.data);
          else setError(j.error);
        });
    }
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!result) return <p>Loading...</p>;

  const template = result.templateKey;
  return (
    <div>
      {template === "TINABEL_SECONDARY" ? (
        <ResultSheetSecondary result={result} />
      ) : (
        <ResultSheetPrimary result={result} />
      )}
    </div>
  );
};

export default ResultViewPage;
