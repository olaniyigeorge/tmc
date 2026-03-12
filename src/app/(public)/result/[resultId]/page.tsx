"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ResultSheetSecondary from "@/components/public/ResultSheetSecondary";
import ResultSheetPrimary from "@/components/public/ResultSheetPrimary";
import Link from "next/link";

type ResultState = "loading" | "ok" | "unauthorized" | "error";

export default function ResultViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.resultId as string;

  const [state, setState] = useState<ResultState>("loading");
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/public/result/${id}`)
      .then(async (res) => {
        if (res.status === 401 || res.status === 403) {
          setState("unauthorized");
          return;
        }
        const json = await res.json();
        if (json.ok) {
          setResult(json.data);
          setState("ok");
        } else {
          setErrorMsg(json.error || "Could not load result");
          setState("error");
        }
      })
      .catch(() => {
        setErrorMsg("Network error. Please try again.");
        setState("error");
      });
  }, [id]);

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (state === "loading") {
    return (
      <div className="flex-col items-center justify-center min-h-screen p-4">
        <div className="rv-spinner mt-100" />
        <p className="rv-loading-text">Loading your result…</p>
        <style>{baseStyles}</style>
      </div>
    );
  }

  // ── Unauthorized (no valid cookie / expired) ─────────────────────────────────
  if (state === "unauthorized") {
    return (
      <div className="rv-center">
        <div className="rv-state-card">
          <div className="rv-state-icon">🔒</div>
          <h2 className="rv-state-title">Access Expired or Invalid</h2>
          <p className="rv-state-desc">
            Your result access session has expired or the link is invalid.
            Please check your result again using your student code and PIN.
          </p>
          <Link href="/check" className="rv-state-btn">
            ← Check Result Again
          </Link>
        </div>
        <style>{baseStyles}</style>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────────
  if (state === "error") {
    return (
      <div className="rv-center">
        <div className="rv-state-card">
          <div className="rv-state-icon">⚠️</div>
          <h2 className="rv-state-title">Something went wrong</h2>
          <p className="rv-state-desc">{errorMsg}</p>
          <Link href="/check" className="rv-state-btn">
            ← Back to Check
          </Link>
        </div>
        <style>{baseStyles}</style>
      </div>
    );
  }

  // ── Result ───────────────────────────────────────────────────────────────────
  const isSecondary = result?.templateKey === "TINABEL_SECONDARY";


  console.log("Rendering result:", result);
  return (
    <div className="rv-page">
      {/* Nav bar */}
      <header className="rv-header no-print">
        <Link href="/" className="rv-logo">
          <span>🏫</span> Results Portal
        </Link>
        <div className="rv-header-right">
          <Link href={`/verify/${result.verificationCode}`} className="rv-verify-link">
            🛡️ Verify this result
          </Link>
          <Link href="/check" className="rv-check-link">
            Check another →
          </Link>
        </div>
      </header>

      {isSecondary ? (
        <ResultSheetSecondary result={result} />
      ) : (
        <ResultSheetPrimary result={result} />
      )}

      <style>{baseStyles}</style>
    </div>
  );
}

const baseStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap');

* { box-sizing: border-box; }

body { margin: 0; background: #f8fafc; font-family: 'DM Sans','Segoe UI',sans-serif; }

.rv-page { min-height: 100vh; background: #f8fafc; }

/* Header */
.rv-header {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}
.rv-logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
  text-decoration: none;
}
.rv-header-right { display: flex; align-items: center; gap: 16px; }
.rv-verify-link {
  font-size: 12px;
  font-weight: 600;
  color: #16a34a;
  text-decoration: none;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 6px 12px;
}
.rv-check-link {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
}

/* Center states */
.rv-center {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  font-family: 'DM Sans','Segoe UI',sans-serif;
}
.rv-spinner {
  width: 40px; height: 40px;
  border: 3px solid #e2e8f0;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: rv-spin .7s linear infinite;
  margin: 100px auto 16px;
}
@keyframes rv-spin { to { transform: rotate(360deg); } }
.rv-loading-text { font-size: 14px; color: #64748b; text-align: center; }

.rv-state-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 40px 32px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,.06);
}
.rv-state-icon { font-size: 48px; margin-bottom: 12px; }
.rv-state-title { font-size: 18px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
.rv-state-desc { font-size: 14px; color: #64748b; line-height: 1.6; margin: 0 0 20px; }
.rv-state-btn {
  display: inline-block;
  background: #1e293b;
  color: #fff;
  border-radius: 10px;
  padding: 11px 24px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

@media print {
  .no-print { display: none !important; }
  body { background: #fff; }
  .rv-page { background: #fff; }
}
`;