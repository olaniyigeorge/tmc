"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) return;
    setSubmitting(true);
    setError("");

    // Quick pre-check: hit the API before navigating so we can show errors inline
    try {
      const res = await fetch(`/api/public/verify/${encodeURIComponent(trimmed)}`);
      const json = await res.json();
      if (json.ok && json.data?.valid) {
        router.push(`/verify/${encodeURIComponent(trimmed)}`);
      } else if (json.ok && !json.data?.valid) {
        setError("No result found with that code. Please check and try again.");
      } else {
        setError(json.error || "Verification failed. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="vp-page">
      {/* ── Header ── */}
      <header className="vp-header">
        <Link href="/" className="vp-logo">
          <span>🏫</span>
          <span className="vp-logo-text">Results Portal</span>
        </Link>
        <Link href="/check" className="vp-check-link">Check a result →</Link>
      </header>

      <main className="vp-main">
        {/* ── Left: form ── */}
        <div className="vp-form-panel">
          <div className="vp-form-card">
            <div className="vp-card-header">
              <div className="vp-card-icon">🛡️</div>
              <h1 className="vp-card-title">Verify Result Authenticity</h1>
              <p className="vp-card-sub">
                Enter the verification code printed at the bottom of a result sheet
                to confirm it is genuine and issued by the school.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="vp-form" noValidate>
              <div className="vp-field">
                <label className="vp-label" htmlFor="code">Verification Code</label>
                <div className="vp-input-wrap">
                  <span className="vp-input-icon">🔑</span>
                  <input
                    id="code"
                    className="vp-input"
                    value={code}
                    onChange={(e) => { setCode(e.target.value); setError(""); }}
                    placeholder="e.g. TMC-2526-1ST-JSS1A-8F3K2"
                    autoCapitalize="characters"
                    autoComplete="off"
                    spellCheck={false}
                  />
                  {code && (
                    <button type="button" className="vp-clear-btn" onClick={() => setCode("")}>✕</button>
                  )}
                </div>
                <p className="vp-hint">
                  The code is printed at the bottom of every published result sheet,
                  in the format: <code className="vp-code-eg">TMC-2526-1ST-JSS1A-XXXXX</code>
                </p>
              </div>

              {error && (
                <div className="vp-error" role="alert">
                  <span>⚠️</span>
                  <div>
                    <strong>Not found</strong>
                    <p>{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="vp-submit"
                disabled={!code.trim() || submitting}
              >
                {submitting
                  ? <><span className="vp-spinner" /> Verifying…</>
                  : <>Verify Code →</>
                }
              </button>
            </form>
          </div>
        </div>

        {/* ── Right: info ── */}
        <aside className="vp-info-panel">
          <div className="vp-info-card">
            <h2 className="vp-info-title">How verification works</h2>
            <ol className="vp-steps">
              <li>
                <span className="vp-step-num">1</span>
                <div>
                  <strong>Find the code</strong>
                  <p>Look at the footer of the printed or downloaded result sheet</p>
                </div>
              </li>
              <li>
                <span className="vp-step-num">2</span>
                <div>
                  <strong>Enter it here</strong>
                  <p>Type or paste the code exactly as shown (not case-sensitive)</p>
                </div>
              </li>
              <li>
                <span className="vp-step-num">3</span>
                <div>
                  <strong>View confirmation</strong>
                  <p>We'll confirm the student name, class, session, and issue date</p>
                </div>
              </li>
            </ol>
          </div>

          <div className="vp-trust-card">
            <div className="vp-trust-icon">✅</div>
            <h3 className="vp-trust-title">Why verify?</h3>
            <p className="vp-trust-desc">
              Each result is assigned a unique code when published by the school.
              Verification confirms the document is authentic and unaltered.
            </p>
          </div>

          <div className="vp-check-cta">
            <p>Looking to access a result?</p>
            <Link href="/check" className="vp-check-cta-btn">Check Result →</Link>
          </div>
        </aside>
      </main>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
* { box-sizing: border-box; }
.vp-page { min-height: 100vh; background: #f8fafc; font-family: 'DM Sans','Segoe UI',sans-serif; display: flex; flex-direction: column; }

/* Header */
.vp-header { background: #fff; border-bottom: 1px solid #e2e8f0; padding: 0 32px; height: 60px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 50; }
.vp-logo { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.vp-logo span:first-child { font-size: 22px; }
.vp-logo-text { font-size: 15px; font-weight: 800; color: #1e293b; }
.vp-check-link { font-size: 13px; font-weight: 600; color: #6366f1; text-decoration: none; }
.vp-check-link:hover { text-decoration: underline; }

/* Main */
.vp-main { flex: 1; display: grid; grid-template-columns: 1fr 300px; gap: 24px; max-width: 900px; width: 100%; margin: 40px auto; padding: 0 24px; align-items: start; }
@media (max-width: 680px) { .vp-main { grid-template-columns: 1fr; } .vp-info-panel { order: -1; } }

/* Form card */
.vp-form-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.05); }
.vp-card-header { padding: 28px 28px 20px; text-align: center; border-bottom: 1px solid #f1f5f9; }
.vp-card-icon { font-size: 40px; margin-bottom: 10px; }
.vp-card-title { font-size: 20px; font-weight: 800; color: #0f172a; margin: 0 0 6px; }
.vp-card-sub { font-size: 13px; color: #64748b; margin: 0; line-height: 1.5; }

/* Form */
.vp-form { padding: 24px 28px 28px; display: flex; flex-direction: column; gap: 0; }
.vp-field { margin-bottom: 16px; }
.vp-label { display: block; font-size: 12px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: .07em; margin-bottom: 8px; }
.vp-input-wrap { display: flex; align-items: center; border: 2px solid #e2e8f0; border-radius: 12px; background: #fff; overflow: hidden; transition: border .18s, box-shadow .18s; }
.vp-input-wrap:focus-within { border-color: #1e293b; box-shadow: 0 0 0 3px rgba(30,41,59,.08); }
.vp-input-icon { padding: 0 12px; font-size: 16px; flex-shrink: 0; }
.vp-input { flex: 1; border: none; outline: none; padding: 14px 0; font-size: 14px; color: #1e293b; background: transparent; font-family: monospace; letter-spacing: .06em; }
.vp-input::placeholder { color: #cbd5e1; font-family: 'DM Sans','Segoe UI',sans-serif; letter-spacing: 0; font-size: 13px; }
.vp-clear-btn { background: transparent; border: none; padding: 0 14px; color: #94a3b8; cursor: pointer; font-size: 14px; }
.vp-clear-btn:hover { color: #475569; }
.vp-hint { font-size: 12px; color: #94a3b8; margin: 7px 0 0; line-height: 1.5; }
.vp-code-eg { background: #f1f5f9; border-radius: 4px; padding: 1px 6px; font-size: 11px; color: #475569; }

/* Error */
.vp-error { display: flex; gap: 12px; background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 10px; padding: 14px 16px; margin-bottom: 16px; animation: vp-shake .3s; }
@keyframes vp-shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
.vp-error span { font-size: 18px; flex-shrink: 0; line-height: 1.4; }
.vp-error strong { font-size: 13px; color: #dc2626; display: block; margin-bottom: 2px; }
.vp-error p { font-size: 12px; color: #7f1d1d; margin: 0; line-height: 1.4; }

/* Submit */
.vp-submit { width: 100%; background: #1e293b; color: #fff; border: none; border-radius: 12px; padding: 15px 20px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: background .15s, transform .1s, box-shadow .15s; box-shadow: 0 4px 14px rgba(30,41,59,.18); }
.vp-submit:hover:not(:disabled) { background: #0f172a; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(30,41,59,.25); }
.vp-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }
.vp-spinner { width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.4); border-top-color: #fff; border-radius: 50%; animation: vp-spin .6s linear infinite; display: inline-block; }
@keyframes vp-spin { to { transform: rotate(360deg); } }

/* Info panel */
.vp-info-panel { display: flex; flex-direction: column; gap: 14px; }
.vp-info-card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,.04); }
.vp-info-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .07em; color: #94a3b8; margin: 0 0 16px; }
.vp-steps { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
.vp-steps li { display: flex; gap: 12px; align-items: flex-start; }
.vp-step-num { width: 24px; height: 24px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: #475569; flex-shrink: 0; }
.vp-steps strong { display: block; font-size: 13px; color: #1e293b; margin-bottom: 2px; }
.vp-steps p { font-size: 12px; color: #64748b; margin: 0; line-height: 1.4; }

.vp-trust-card { background: linear-gradient(135deg, #f0fdf4, #dcfce7); border: 1px solid #bbf7d0; border-radius: 14px; padding: 18px; text-align: center; }
.vp-trust-icon { font-size: 28px; margin-bottom: 6px; }
.vp-trust-title { font-size: 14px; font-weight: 700; color: #14532d; margin: 0 0 6px; }
.vp-trust-desc { font-size: 12px; color: #166534; line-height: 1.5; margin: 0; }

.vp-check-cta { background: #fff; border: 1px solid #e2e8f0; border-radius: 14px; padding: 16px; display: flex; align-items: center; justify-content: space-between; gap: 10px; }
.vp-check-cta p { font-size: 13px; color: #64748b; margin: 0; }
.vp-check-cta-btn { background: #1e293b; color: #fff; border-radius: 8px; padding: 8px 14px; font-size: 12px; font-weight: 700; text-decoration: none; white-space: nowrap; }
`;