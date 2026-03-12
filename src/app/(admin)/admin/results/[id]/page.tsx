"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ResultFormSecondary from "@/components/admin/ResultFormSecondary";
import ResultFormPrimary from "@/components/admin/ResultFormPrimary";
import Link from "next/link";

export default function EditResultPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Fetch result ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/results/${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setResult(j.data);
        else setError(j.error || "Result not found");
      })
      .catch(() => setError("Failed to load result"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Save draft ──────────────────────────────────────────────────────────────
  const save = async (data: any) => {
    const res = await fetch(`/api/admin/results/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (json.ok) {
      setResult((prev: any) => ({ ...prev, ...json.data }));
    } else {
      throw new Error(json.error || "Save failed");
    }
  };

  // ── Publish (called from form, but form handles fetch directly) ─────────────
  const publish = async () => {
    // form components call the publish endpoint directly and handle the modal
    // This is a no-op fallback for the prop
  };

  // ── States ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="er-loading">
        <div className="er-loading-spinner" />
        <p>Loading result…</p>
        <style>{loadingStyles}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="er-error-state">
        <div className="er-error-icon">⚠️</div>
        <h2>Result not found</h2>
        <p>{error}</p>
        <button onClick={() => router.push("/admin/results")} className="er-back-btn">
          ← Back to Results
        </button>
        <style>{loadingStyles}</style>
      </div>
    );
  }

  const isPublished = result?.status === "PUBLISHED";
  const isSecondary = result?.templateKey === "TINABEL_SECONDARY";

  const studentName = result?.studentId
    ? `${result.studentId.lastName} ${result.studentId.firstName}`
    : "Unknown Student";

  return (
    <div className="er-page p-2" style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      {/* ── Breadcrumb ── */}
      <nav className="er-breadcrumb">
        <Link href="/admin/dashboard" className="er-bc-link">Dashboard</Link>
        <span className="er-bc-sep">›</span>
        <Link href="/admin/results" className="er-bc-link">Results</Link>
        <span className="er-bc-sep">›</span>
        <span className="er-bc-current">{studentName}</span>
      </nav>

      {/* ── Page header ── */}
      <div className="er-page-header">
        <div className="er-page-header-left">
          <h1 className="er-page-title">
            {isPublished ? "View Result" : "Edit Result"}
          </h1>
          <p className="er-page-sub">
            {isSecondary ? "Tinabel Model College — Secondary" : "Tinuola Children School — Primary/Nursery"}
          </p>
        </div>
        <div className="er-page-header-right">
          {isPublished && (
            <a
              href={`/result/${id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="er-view-btn"
            >
              👁 View Public Sheet
            </a>
          )}
          <button className="er-back-list-btn" onClick={() => router.push("/admin/results")}>
            ← Results List
          </button>
        </div>
      </div>

      {/* ── Form ── */}
      {isSecondary ? (
        <ResultFormSecondary
          initial={result}
          onSave={save}
          onPublish={publish}
          readonly={isPublished}
        />
      ) : (
        <ResultFormPrimary
          initial={result}
          onSave={save}
          onPublish={publish}
          readonly={isPublished}
        />
      )}

      <style>{pageStyles}</style>
    </div>
  );
}

const loadingStyles = `
.er-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 16px;
  color: #64748b;
  font-size: 14px;
  font-family: 'DM Sans','Segoe UI',sans-serif;
}
.er-loading-spinner {
  width: 32px; height: 32px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: er-spin .7s linear infinite;
}
@keyframes er-spin { to { transform: rotate(360deg); } }
.er-error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 10px;
  text-align: center;
  font-family: 'DM Sans','Segoe UI',sans-serif;
}
.er-error-icon { font-size: 40px; }
.er-error-state h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0; }
.er-error-state p { font-size: 14px; color: #64748b; margin: 0; }
.er-back-btn { background: #1e293b; color: #fff; border: none; border-radius: 10px; padding: 10px 20px; font-size: 13px; font-weight: 600; cursor: pointer; margin-top: 8px; }
`;

const pageStyles = `
.er-page {
  max-width: 1100px;
  margin: 0 auto;
  padding-bottom: 40px;
}
.er-breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  margin-bottom: 20px;
}
.er-bc-link { color: #6366f1; text-decoration: none; font-weight: 500; }
.er-bc-link:hover { text-decoration: underline; }
.er-bc-sep { color: #cbd5e1; }
.er-bc-current { color: #475569; font-weight: 600; }

.er-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.er-page-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.er-page-sub { font-size: 13px; color: #64748b; margin: 0; }
.er-page-header-right { display: flex; gap: 10px; align-items: center; }
.er-view-btn {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 9px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background .15s;
}
.er-view-btn:hover { background: #dcfce7; }
.er-back-list-btn {
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 9px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.er-back-list-btn:hover { background: #e2e8f0; }
`;