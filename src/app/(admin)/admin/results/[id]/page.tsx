"use client";
import React, { useEffect, useState } from "react";
import {useParams } from "next/navigation"; // useRouter
import ResultFormSecondary from "@/components/admin/ResultFormSecondary";
import ResultFormPrimary from "@/components/admin/ResultFormPrimary";

const EditResultPage: React.FC = () => {
  const params = useParams();
  const id = params.id;
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  // const router = useRouter();



  useEffect(() => {
    if (id) {
      fetch(`/api/admin/results/${id}`)
        .then((r) => r.json())
        .then((j) => {
          if (j.ok) setResult(j.data);
          else setError(j.error);
        });
    }
  }, [id]);

  const save = async (data: any) => {
    const res = await fetch(`/api/admin/results/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.ok) setResult(json.data);
    else alert(json.error);
  };

  const publish = async () => {
    const confirm = window.confirm("Publish result? PIN shown once.");
    if (!confirm) return;
    const res = await fetch(`/api/admin/results/${id}/publish`, {
      method: "POST",
    });
    const json = await res.json();
    if (json.ok) {
      alert(`PIN: ${json.data.pin}\nCode: ${json.data.verificationCode}`);
      setResult({ ...result, status: "PUBLISHED" });
    } else {
      alert(json.error);
    }
  };

  if (error) return <p className="text-red-600">{error}</p>;
  if (!result) return <p>Loading...</p>;

  const readonly = result.status === "PUBLISHED";
  const template = result.templateKey;
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Edit Result</h1>
      {template === "TINABEL_SECONDARY" ? (
        <ResultFormSecondary
          initial={result}
          onSave={save}
          onPublish={publish}
          readonly={readonly}
        />
      ) : (
        <ResultFormPrimary
          initial={result}
          onSave={save}
          onPublish={publish}
          readonly={readonly}
        />
      )}
    </div>
  );
};

export default EditResultPage;