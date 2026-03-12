"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface School {
  _id: string;
  name: string;
  type: string;
  address?: string;
}

const SESSIONS = ["2024/2025", "2025/2026", "2026/2027"];
const TERMS = ["1st", "2nd", "3rd"] as const;

export default function CheckForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [schools, setSchools] = useState<School[]>([]);
  const [schoolId, setSchoolId] = useState(searchParams.get("schoolId") ?? "");
  const [studentCode, setStudentCode] = useState("");
  const [session, setSession] = useState("");
  const [customSession, setCustomSession] = useState("");
  const [term, setTerm] = useState<string>("");
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    fetch("/api/public/schools")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSchools(j.data); });
  }, []);

  const effectiveSession = session === "__custom__" ? customSession.trim() : session;
  const canSubmit = schoolId && studentCode.trim() && effectiveSession && term && pin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/public/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schoolId,
          studentCode: studentCode.trim().toUpperCase(),
          session: effectiveSession,
          term,
          pin,
        }),
      });
      const json = await res.json();
      if (json.ok) {
        router.push(`/result/${json.data.resultId}`);
      } else {
        setAttempts((n) => n + 1);
        // Friendly error messages
        const msg = json.error || "Invalid details";
        if (msg.toLowerCase().includes("pin") || msg.toLowerCase().includes("invalid")) {
          setErrorMsg("The details you entered don't match any published result. Please check your Student Code, PIN, Session and Term.");
        } else if (msg.toLowerCase().includes("published")) {
          setErrorMsg("This result has not been published yet. Please contact your school.");
        } else if (msg.toLowerCase().includes("not found")) {
          setErrorMsg("No student found with that code in the selected school.");
        } else {
          setErrorMsg(msg);
        }
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSchool = schools.find((s) => s._id === schoolId);

  return (
    <div className="cf-wrap">
      <form onSubmit={handleSubmit} className="cf-form" noValidate>

        {/* ── School Selection ── */}
        <div className="cf-section">
          <label className="cf-section-label">
            <span className="cf-label-num">1</span> Select School
          </label>
          <div className="cf-school-cards">
            {schools.length === 0 && (
              <div className="cf-schools-loading">
                <span className="cf-spinner" /> Loading schools…
              </div>
            )}
            {schools.map((s) => (
              <button
                key={s._id}
                type="button"
                className={`cf-school-card ${schoolId === s._id ? "active" : ""}`}
                onClick={() => { setSchoolId(s._id); setErrorMsg(""); }}
              >
                <div className="cf-school-icon">
                  {s.type === "SECONDARY" ? "🏫" : "🎒"}
                </div>
                <div className="cf-school-info">
                  <div className="cf-school-name">{s.name}</div>
                  <div className="cf-school-type">
                    {s.type === "SECONDARY" ? "Secondary School" : "Nursery / Primary"}
                  </div>
                </div>
                {schoolId === s._id && <span className="cf-school-check">✓</span>}
              </button>
            ))}
          </div>
        </div>

        {/* ── Student Code ── */}
        <div className="cf-section">
          <label className="cf-section-label" htmlFor="studentCode">
            <span className="cf-label-num">2</span> Student Code
          </label>
          <div className="cf-input-wrap">
            <span className="cf-input-icon">🪪</span>
            <input
              id="studentCode"
              className="cf-input"
              value={studentCode}
              onChange={(e) => { setStudentCode(e.target.value); setErrorMsg(""); }}
              placeholder="e.g. TMC/2024/001"
              autoCapitalize="characters"
              autoComplete="off"
            />
          </div>
          <p className="cf-hint">Enter the student code exactly as printed on your school ID or admission letter.</p>
        </div>

        {/* ── Session + Term ── */}
        <div className="cf-section">
          <label className="cf-section-label">
            <span className="cf-label-num">3</span> Session & Term
          </label>
          <div className="cf-row">
            <div className="cf-field cf-field-grow">
              <label className="cf-sub-label">Academic Session</label>
              <div className="cf-select-wrap">
                <select
                  className="cf-select"
                  value={session}
                  onChange={(e) => { setSession(e.target.value); setErrorMsg(""); }}
                >
                  <option value="">Select session…</option>
                  {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  <option value="__custom__">Other…</option>
                </select>
              </div>
              {session === "__custom__" && (
                <input
                  className="cf-input cf-input-mt"
                  value={customSession}
                  onChange={(e) => { setCustomSession(e.target.value); setErrorMsg(""); }}
                  placeholder="e.g. 2027/2028"
                />
              )}
            </div>
            <div className="cf-field">
              <label className="cf-sub-label">Term</label>
              <div className="cf-term-pills">
                {TERMS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`cf-term-pill ${term === t ? "active" : ""}`}
                    onClick={() => { setTerm(t); setErrorMsg(""); }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── PIN ── */}
        <div className="cf-section">
          <label className="cf-section-label" htmlFor="pin">
            <span className="cf-label-num">4</span> PIN
          </label>
          <div className="cf-input-wrap">
            <span className="cf-input-icon">🔐</span>
            <input
              id="pin"
              className="cf-input"
              type={showPin ? "text" : "password"}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setErrorMsg(""); }}
              placeholder="6-digit PIN"
              maxLength={10}
              inputMode="numeric"
              autoComplete="one-time-code"
            />
            <button
              type="button"
              className="cf-pin-toggle"
              onClick={() => setShowPin(!showPin)}
              tabIndex={-1}
            >
              {showPin ? "Hide" : "Show"}
            </button>
          </div>
          <p className="cf-hint">Your PIN was provided by the school when the result was published.</p>
        </div>

        {/* ── Error ── */}
        {errorMsg && (
          <div className="cf-error" role="alert">
            <span className="cf-error-icon">⚠️</span>
            <div>
              <strong>Could not find result</strong>
              <p>{errorMsg}</p>
              {attempts >= 2 && (
                <p className="cf-error-contact">
                  Having trouble? Contact your school admin for assistance.
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Submit ── */}
        <button
          type="submit"
          className="cf-submit"
          disabled={!canSubmit || submitting}
        >
          {submitting ? (
            <><span className="cf-submit-spinner" /> Checking result…</>
          ) : (
            <>Check My Result →</>
          )}
        </button>

        {/* ── Progress indicator ── */}
        <div className="cf-progress">
          <div className={`cf-prog-dot ${schoolId ? "done" : ""}`} />
          <div className={`cf-prog-line ${schoolId && studentCode ? "done" : ""}`} />
          <div className={`cf-prog-dot ${studentCode ? "done" : ""}`} />
          <div className={`cf-prog-line ${studentCode && effectiveSession ? "done" : ""}`} />
          <div className={`cf-prog-dot ${effectiveSession && term ? "done" : ""}`} />
          <div className={`cf-prog-line ${effectiveSession && term && pin ? "done" : ""}`} />
          <div className={`cf-prog-dot ${pin ? "done" : ""}`} />
        </div>
      </form>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.cf-wrap { width: 100%; }

.cf-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Section */
.cf-section {
  padding: 24px 0;
  border-bottom: 1px solid #f1f5f9;
}
.cf-section:last-of-type { border-bottom: none; }

.cf-section-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: .07em;
  margin-bottom: 14px;
}
.cf-label-num {
  width: 22px; height: 22px;
  background: #1e293b;
  color: #fff;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

/* School cards */
.cf-school-cards { display: flex; flex-direction: column; gap: 10px; }
.cf-schools-loading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #94a3b8;
  padding: 12px 0;
}
.cf-school-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  cursor: pointer;
  text-align: left;
  transition: all .18s;
  width: 100%;
  position: relative;
}
.cf-school-card:hover { border-color: #94a3b8; background: #f8fafc; }
.cf-school-card.active { border-color: #1e293b; background: #f8fafc; }
.cf-school-icon { font-size: 24px; line-height: 1; }
.cf-school-info { flex: 1; }
.cf-school-name { font-size: 14px; font-weight: 700; color: #1e293b; }
.cf-school-type { font-size: 12px; color: #64748b; margin-top: 2px; }
.cf-school-check {
  width: 22px; height: 22px;
  background: #1e293b;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  flex-shrink: 0;
}

/* Input */
.cf-input-wrap {
  display: flex;
  align-items: center;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  transition: border .18s, box-shadow .18s;
}
.cf-input-wrap:focus-within {
  border-color: #1e293b;
  box-shadow: 0 0 0 3px rgba(30,41,59,.08);
}
.cf-input-icon {
  padding: 0 12px;
  font-size: 16px;
  flex-shrink: 0;
  line-height: 1;
}
.cf-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 13px 12px 13px 0;
  font-size: 15px;
  color: #1e293b;
  background: transparent;
  font-family: inherit;
  letter-spacing: .02em;
}
.cf-input::placeholder { color: #cbd5e1; }
.cf-input-mt { margin-top: 8px; padding: 13px 12px; }
.cf-pin-toggle {
  background: transparent;
  border: none;
  padding: 0 14px;
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  cursor: pointer;
  flex-shrink: 0;
}

.cf-hint {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 7px;
  line-height: 1.5;
}

/* Row layout */
.cf-row { display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap; }
.cf-field { display: flex; flex-direction: column; gap: 8px; }
.cf-field-grow { flex: 1; min-width: 160px; }
.cf-sub-label { font-size: 12px; font-weight: 600; color: #475569; }

/* Select */
.cf-select-wrap { position: relative; }
.cf-select {
  width: 100%;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 36px 12px 14px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  outline: none;
  appearance: none;
  cursor: pointer;
  font-family: inherit;
  transition: border .18s;
}
.cf-select:focus { border-color: #1e293b; box-shadow: 0 0 0 3px rgba(30,41,59,.08); }
.cf-select-wrap::after {
  content: '▾';
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
  font-size: 12px;
}

/* Term pills */
.cf-term-pills { display: flex; gap: 8px; }
.cf-term-pill {
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  background: #fff;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.cf-term-pill:hover { border-color: #94a3b8; }
.cf-term-pill.active { background: #1e293b; color: #fff; border-color: #1e293b; }

/* Error */
.cf-error {
  display: flex;
  gap: 12px;
  background: #fef2f2;
  border: 1.5px solid #fecaca;
  border-radius: 12px;
  padding: 14px 16px;
  margin-top: 8px;
  animation: cf-shake .3s;
}
@keyframes cf-shake {
  0%,100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}
.cf-error-icon { font-size: 18px; flex-shrink: 0; line-height: 1.4; }
.cf-error strong { font-size: 13px; font-weight: 700; color: #dc2626; }
.cf-error p { font-size: 12px; color: #7f1d1d; margin: 3px 0 0; line-height: 1.5; }
.cf-error-contact { color: #991b1b !important; font-weight: 600; margin-top: 6px !important; }

/* Submit */
.cf-submit {
  width: 100%;
  background: #1e293b;
  color: #fff;
  border: none;
  border-radius: 14px;
  padding: 16px 20px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background .15s, transform .1s, box-shadow .15s;
  letter-spacing: .01em;
  box-shadow: 0 4px 14px rgba(30,41,59,.18);
}
.cf-submit:hover:not(:disabled) {
  background: #0f172a;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(30,41,59,.25);
}
.cf-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }

/* Spinners */
.cf-spinner, .cf-submit-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: cf-spin .6s linear infinite;
  display: inline-block;
}
.cf-spinner { border-color: #94a3b8; border-top-color: #475569; }
@keyframes cf-spin { to { transform: rotate(360deg); } }

/* Progress dots */
.cf-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-top: 20px;
  padding: 0 8px;
}
.cf-prog-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: #e2e8f0;
  transition: background .3s;
  flex-shrink: 0;
}
.cf-prog-dot.done { background: #1e293b; }
.cf-prog-line {
  flex: 1;
  height: 2px;
  background: #e2e8f0;
  transition: background .3s;
}
.cf-prog-line.done { background: #1e293b; }
`;