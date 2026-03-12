"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface VerifyData {
  valid: boolean;
  schoolName?: string;
  studentName?: string;
  className?: string;
  session?: string;
  term?: string;
  issuedAt?: string;
  status?: string;
}

type PageState = "loading" | "valid" | "invalid" | "error";

export default function VerifyCodePage() {
  const params = useParams();
  const code = params.code as string;

  const [state, setState] = useState<PageState>("loading");
  const [data, setData] = useState<VerifyData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!code) return;
    fetch(`/api/public/verify/${encodeURIComponent(code)}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && j.data?.valid) {
          setData(j.data);
          setState("valid");
        } else if (j.ok && !j.data?.valid) {
          setState("invalid");
        } else {
          setErrorMsg(j.error || "Verification failed");
          setState("error");
        }
      })
      .catch(() => {
        setErrorMsg("Network error. Please try again.");
        setState("error");
      });
  }, [code]);

  return (
    <div className="vc-page">
      {/* Header */}
      <header className="vc-header">
        <Link href="/" className="vc-logo">
          <span>🏫</span>
          <span className="vc-logo-text">Results Portal</span>
        </Link>
        <div className="vc-header-right">
          <Link href="/verify" className="vc-nav-link">Verify another</Link>
          <Link href="/check" className="vc-nav-link">Check result →</Link>
        </div>
      </header>

      <main className="vc-main">
        {/* ── Loading ── */}
        {state === "loading" && (
          <div className="vc-state-wrap">
            <div className="vc-loading-card">
              <div className="vc-spinner" />
              <p className="vc-loading-text">Checking verification code…</p>
              <code className="vc-code-display">{decodeURIComponent(code)}</code>
            </div>
          </div>
        )}

        {/* ── Valid ── */}
        {state === "valid" && data && (
          <div className="vc-result-wrap">
            {/* Big status banner */}
            <div className="vc-valid-banner">
              <div className="vc-valid-icon">✅</div>
              <div className="vc-valid-text">
                <h1 className="vc-valid-title">Authentic Result</h1>
                <p className="vc-valid-sub">
                  This result has been verified as genuine and was issued by the school.
                </p>
              </div>
              <div className="vc-valid-badge">VERIFIED</div>
            </div>

            {/* Details card */}
            <div className="vc-details-card">
              <div className="vc-details-header">
                <h2 className="vc-details-title">Result Details</h2>
                <span className="vc-details-status published">
                  {data.status === "PUBLISHED" ? "Published" : data.status}
                </span>
              </div>

              <div className="vc-details-grid">
                <div className="vc-detail-item">
                  <span className="vc-detail-label">School</span>
                  <span className="vc-detail-val">{data.schoolName ?? "—"}</span>
                </div>
                <div className="vc-detail-item">
                  <span className="vc-detail-label">Student Name</span>
                  <span className="vc-detail-val vc-detail-name">{data.studentName ?? "—"}</span>
                </div>
                <div className="vc-detail-item">
                  <span className="vc-detail-label">Class</span>
                  <span className="vc-detail-val">{data.className ?? "—"}</span>
                </div>
                <div className="vc-detail-item">
                  <span className="vc-detail-label">Academic Session</span>
                  <span className="vc-detail-val">{data.session ?? "—"}</span>
                </div>
                <div className="vc-detail-item">
                  <span className="vc-detail-label">Term</span>
                  <span className="vc-detail-val">{data.term ? `${data.term} Term` : "—"}</span>
                </div>
                <div className="vc-detail-item">
                  <span className="vc-detail-label">Date Issued</span>
                  <span className="vc-detail-val">
                    {data.issuedAt
                      ? new Date(data.issuedAt).toLocaleDateString("en-GB", {
                          day: "numeric", month: "long", year: "numeric",
                        })
                      : "—"}
                  </span>
                </div>
              </div>

              {/* Verification code display */}
              <div className="vc-code-row">
                <div>
                  <span className="vc-code-label">Verification Code</span>
                  <code className="vc-code-val">{decodeURIComponent(code)}</code>
                </div>
                <button
                  className="vc-copy-btn"
                  onClick={() => navigator.clipboard.writeText(decodeURIComponent(code))}
                >
                  Copy code
                </button>
              </div>
            </div>

            {/* Info note */}
            <div className="vc-info-note">
              <span>ℹ️</span>
              <p>
                This verification confirms the result sheet is genuine. The subject scores
                and grades shown on the printed sheet are exactly as recorded by the school.
              </p>
            </div>

            {/* Actions */}
            <div className="vc-actions">
              <Link href="/verify" className="vc-action-secondary">
                ← Verify another code
              </Link>
              <Link href="/check" className="vc-action-primary">
                Check a result
              </Link>
            </div>
          </div>
        )}

        {/* ── Invalid ── */}
        {state === "invalid" && (
          <div className="vc-state-wrap">
            <div className="vc-invalid-card">
              <div className="vc-invalid-icon">❌</div>
              <h1 className="vc-invalid-title">Result Not Found</h1>
              <p className="vc-invalid-desc">
                No published result was found with the code:
              </p>
              <code className="vc-code-display vc-code-invalid">{decodeURIComponent(code)}</code>
              <p className="vc-invalid-reasons">This may mean:</p>
              <ul className="vc-invalid-list">
                <li>The code was typed incorrectly — check for typos</li>
                <li>The result has not been published yet</li>
                <li>The result sheet may have been altered</li>
              </ul>
              <div className="vc-invalid-actions">
                <Link href="/verify" className="vc-action-primary">
                  Try a different code
                </Link>
                <Link href="/check" className="vc-action-secondary">
                  Check a result
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {state === "error" && (
          <div className="vc-state-wrap">
            <div className="vc-invalid-card">
              <div className="vc-invalid-icon">⚠️</div>
              <h1 className="vc-invalid-title">Something went wrong</h1>
              <p className="vc-invalid-desc">{errorMsg}</p>
              <div className="vc-invalid-actions">
                <button
                  className="vc-action-primary"
                  onClick={() => window.location.reload()}
                >
                  Try again
                </button>
                <Link href="/verify" className="vc-action-secondary">← Back</Link>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
* { box-sizing: border-box; }
.vc-page { min-height: 100vh; background: #f8fafc; font-family: 'DM Sans','Segoe UI',sans-serif; }

/* Header */
.vc-header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
.vc-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.vc-logo span:first-child { font-size: 22px; }
.vc-logo-text { font-size: 15px; font-weight: 800; color: #1e293b; }
.vc-header-right { display: flex; align-items: center; gap: 16px; }
.vc-nav-link { font-size: 13px; font-weight: 600; color: #6366f1; text-decoration: none; }
.vc-nav-link:hover { text-decoration: underline; }

/* Main */
.vc-main { max-width: 680px; margin: 0 auto; padding: 40px 24px 80px; }

/* Loading */
.vc-state-wrap { display: flex; justify-content: center; }
.vc-loading-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 4px 24px rgba(0,0,0,.05);
  max-width: 420px;
  width: 100%;
}
.vc-spinner { width: 40px; height: 40px; border: 3px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: vc-spin .7s linear infinite; margin: 0 auto 16px; }
@keyframes vc-spin { to { transform: rotate(360deg); } }
.vc-loading-text { font-size: 14px; color: #64748b; margin: 0 0 14px; }

/* Code display */
.vc-code-display {
  display: inline-block;
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  color: #475569;
  background: #f1f5f9;
  border-radius: 8px;
  padding: 8px 16px;
  letter-spacing: .06em;
  word-break: break-all;
}
.vc-code-invalid { background: #fef2f2; color: #dc2626; }

/* Valid result */
.vc-result-wrap { display: flex; flex-direction: column; gap: 16px; animation: vc-fade-in .4s; }
@keyframes vc-fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }

.vc-valid-banner {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1.5px solid #86efac;
  border-radius: 18px;
  padding: 24px 28px;
  display: flex;
  align-items: center;
  gap: 18px;
  flex-wrap: wrap;
}
.vc-valid-icon { font-size: 44px; line-height: 1; flex-shrink: 0; }
.vc-valid-text { flex: 1; min-width: 180px; }
.vc-valid-title { font-size: 22px; font-weight: 800; color: #14532d; margin: 0 0 4px; }
.vc-valid-sub { font-size: 13px; color: #166534; margin: 0; line-height: 1.4; }
.vc-valid-badge {
  background: #16a34a;
  color: #fff;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: .12em;
  border-radius: 8px;
  padding: 6px 14px;
  flex-shrink: 0;
}

/* Details card */
.vc-details-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,.04); }
.vc-details-header { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
.vc-details-title { font-size: 13px; font-weight: 700; color: #1e293b; margin: 0; text-transform: uppercase; letter-spacing: .06em; }
.vc-details-status { font-size: 11px; font-weight: 700; border-radius: 20px; padding: 3px 10px; }
.vc-details-status.published { background: #dcfce7; color: #16a34a; }

.vc-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; }
.vc-detail-item { padding: 14px 20px; border-bottom: 1px solid #f1f5f9; border-right: 1px solid #f1f5f9; display: flex; flex-direction: column; gap: 3px; }
.vc-detail-item:nth-child(even) { border-right: none; }
.vc-detail-item:nth-last-child(-n+2) { border-bottom: none; }
.vc-detail-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; }
.vc-detail-val { font-size: 14px; font-weight: 600; color: #1e293b; }
.vc-detail-name { font-size: 15px; font-weight: 700; }

.vc-code-row { display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; background: #f8fafc; border-top: 1px solid #f1f5f9; gap: 12px; flex-wrap: wrap; }
.vc-code-label { display: block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #94a3b8; margin-bottom: 4px; }
.vc-code-val { font-family: monospace; font-size: 13px; font-weight: 700; color: #1e293b; letter-spacing: .06em; }
.vc-copy-btn { background: #1e293b; color: #fff; border: none; border-radius: 8px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap; }
.vc-copy-btn:hover { background: #0f172a; }

/* Info note */
.vc-info-note { display: flex; gap: 10px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 14px 16px; font-size: 12px; color: #1e40af; line-height: 1.5; }
.vc-info-note span { font-size: 16px; flex-shrink: 0; }
.vc-info-note p { margin: 0; }

/* Actions */
.vc-actions { display: flex; gap: 10px; justify-content: flex-end; flex-wrap: wrap; }

/* Invalid */
.vc-invalid-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  padding: 40px 32px;
  text-align: center;
  max-width: 460px;
  width: 100%;
  box-shadow: 0 4px 24px rgba(0,0,0,.05);
}
.vc-invalid-icon { font-size: 48px; margin-bottom: 14px; }
.vc-invalid-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 8px; }
.vc-invalid-desc { font-size: 14px; color: #64748b; margin: 0 0 12px; }
.vc-invalid-reasons { font-size: 13px; font-weight: 600; color: #475569; margin: 16px 0 6px; }
.vc-invalid-list { text-align: left; font-size: 13px; color: #64748b; padding: 0 0 0 20px; margin: 0 0 24px; line-height: 1.8; }
.vc-invalid-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }

/* Shared action buttons */
.vc-action-primary {
  background: #1e293b;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 11px 22px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
  transition: background .15s;
}
.vc-action-primary:hover { background: #0f172a; }
.vc-action-secondary {
  background: #f1f5f9;
  color: #475569;
  border: none;
  border-radius: 10px;
  padding: 11px 22px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
  transition: background .15s;
}
.vc-action-secondary:hover { background: #e2e8f0; }

@media (max-width: 480px) {
  .vc-details-grid { grid-template-columns: 1fr; }
  .vc-detail-item { border-right: none; }
  .vc-detail-item:nth-last-child(-n+2) { border-bottom: 1px solid #f1f5f9; }
  .vc-detail-item:last-child { border-bottom: none; }
  .vc-valid-banner { flex-direction: column; text-align: center; }
}
`;