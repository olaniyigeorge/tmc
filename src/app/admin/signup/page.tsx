"use client";
// src/app/admin/signup/page.tsx
//
// Plain folder — NOT inside (admin) route group — so no auth guard wraps it.
// URL: /admin/signup  ✓

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/* ── Types ──────────────────────────────────────────────────────── */
interface School {
  _id: string;
  name: string;
  type: "SECONDARY" | "PRIMARY";
}

type Step = "details" | "password" | "done";

/* ── Password strength helper ───────────────────────────────────── */
function passwordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8)  score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map = [
    { label: "",        color: "transparent" },
    { label: "Weak",    color: "#ef4444" },
    { label: "Fair",    color: "#f97316" },
    { label: "Good",    color: "#eab308" },
    { label: "Strong",  color: "#22c55e" },
    { label: "Strong",  color: "#16a34a" },
  ];
  return { score, ...map[score] };
}

/* ════════════════════════════════════════════════════════════════
   PAGE COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function AdminSignupPage() {
  const router = useRouter();

  /* ── State ──────────────────────────────────────────────────── */
  const [step, setStep]           = useState<Step>("details");
  const [schools, setSchools]     = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(true);

  // Fields
  const [name,      setName]      = useState("");
  const [email,     setEmail]     = useState("");
  const [schoolId,  setSchoolId]  = useState("");
  const [role,      setRole]      = useState<"SCHOOL_ADMIN" | "TEACHER">("SCHOOL_ADMIN");
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPass,  setShowPass]  = useState(false);
  const [showConf,  setShowConf]  = useState(false);

  const [error,   setError]   = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /* ── Fetch schools for dropdown ─────────────────────────────── */
  useEffect(() => {
    fetch("/api/public/schools")
      .then((r) => r.json())
      .then((d) => { if (d.ok) setSchools(d.data); })
      .catch(() => {})
      .finally(() => setSchoolsLoading(false));
  }, []);

  const selectedSchool = schools.find((s) => s._id === schoolId);
  const strength = passwordStrength(password);

  /* ── Step 1 → Step 2 ───────────────────────────────────────── */
  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim())  return setError("Please enter your full name.");
    if (!email.trim()) return setError("Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
    if (!schoolId)     return setError("Please select your school.");
    setStep("password");
  }

  /* ── Step 2 submit — create account then auto sign-in ────────── */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8)   return setError("Password must be at least 8 characters.");
    if (strength.score < 2)    return setError("Please choose a stronger password.");
    if (password !== confirm)  return setError("Passwords do not match.");

    setLoading(true);

    try {
      // 1. Create account
      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), password, schoolId, role }),
      });
      const data = await res.json();

      if (!data.ok) {
        setLoading(false);
        return setError(data.error || "Could not create account. Please try again.");
      }

      // 2. Auto sign-in
      const signInRes = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
      });

      setLoading(false);

      if (signInRes?.error) {
        // Account created but sign-in failed — send them to login
        router.push("/admin/login?registered=1");
      } else {
        setStep("done");
        setTimeout(() => router.push("/admin/dashboard"), 1800);
      }
    } catch {
      setLoading(false);
      setError("Network error. Please check your connection and try again.");
    }
  }

  /* ── Left panel ─────────────────────────────────────────────── */
  const LeftPanel = (
    <div className="login-panel-left">
      <div className="login-panel-bg" />
      <div className="login-panel-content">
        <div className="login-logo-wrap">
          <div className="logo-emblem-lg">
            <svg viewBox="0 0 24 24">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 12.46L4.28 11 12 6.54 19.72 11 12 15.46zM5 13.18V17l7 4 7-4v-3.82l-7 3.82-7-3.82z" />
            </svg>
          </div>
        </div>
        <h2 className="login-panel-title">Join the Portal</h2>
        <p className="login-panel-sub">
          Create your admin account to manage students, enter results, and publish report cards.
        </p>
        <div className="login-panel-pills">
          <span className="lp-pill pink">TMC — Secondary</span>
          <span className="lp-pill blue">TCS — Primary</span>
        </div>

        {/* Step indicator on panel */}
        <div className="signup-steps-indicator">
          <div className={`ssi-dot ${step === "details" ? "active" : "done"}`}>1</div>
          <div className="ssi-line" />
          <div className={`ssi-dot ${step === "password" ? "active" : step === "done" ? "done" : ""}`}>2</div>
          <div className="ssi-line" />
          <div className={`ssi-dot ${step === "done" ? "done" : ""}`}>✓</div>
        </div>
        <div className="signup-steps-labels">
          <span>Details</span>
          <span>Password</span>
          <span>Done</span>
        </div>
      </div>
    </div>
  );

  /* ── Success screen ─────────────────────────────────────────── */
  if (step === "done") {
    return (
      <div className="login-page">
        {LeftPanel}
        <div className="login-form-side">
          <div className="login-form-box" style={{ textAlign: "center" }}>
            <div className="signup-success-icon">🎉</div>
            <h1 className="login-title" style={{ marginBottom: 12 }}>Account created!</h1>
            <p className="login-subtitle">
              Welcome, <strong>{name}</strong>. You&apos;re being signed in and redirected to your dashboard…
            </p>
            <div style={{ marginTop: 24 }}>
              <span className="spinner" style={{ borderTopColor: "var(--pink)", borderColor: "rgba(233,30,140,0.2)", width: 28, height: 28, borderWidth: 3 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 1 — Account details ───────────────────────────────── */
  if (step === "details") {
    return (
      <div className="login-page">
        {LeftPanel}
        <div className="login-form-side">
          <div className="login-form-box">

            <Link href="/" className="login-back-link">← Back to portal</Link>

            <div className="signup-step-badge">Step 1 of 2</div>
            <h1 className="login-title">Create account</h1>
            <p className="login-subtitle">
              Already have an account?{" "}
              <Link href="/admin/login" style={{ color: "var(--blue)", fontWeight: 600 }}>
                Sign in
              </Link>
            </p>

            <form onSubmit={handleNextStep} className="login-form" noValidate>

              {/* Name */}
              <div className="form-field">
                <label className="form-label" htmlFor="name">Full name</label>
                <input
                  id="name" type="text" autoComplete="name" required
                  className="form-input" placeholder="e.g. Chukwuemeka Obi"
                  value={name} onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="form-field">
                <label className="form-label" htmlFor="email">Email address</label>
                <input
                  id="email" type="email" autoComplete="email" required
                  className="form-input" placeholder="you@school.edu.ng"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* School */}
              <div className="form-field">
                <label className="form-label" htmlFor="schoolId">School</label>
                {schoolsLoading ? (
                  <div className="signup-schools-loading">Loading schools…</div>
                ) : (
                  <div className="signup-school-cards">
                    {schools.map((s) => (
                      <button
                        key={s._id}
                        type="button"
                        className={`signup-school-card ${schoolId === s._id ? "selected" : ""} ${s.type === "SECONDARY" ? "pink" : "blue"}`}
                        onClick={() => setSchoolId(s._id)}
                      >
                        <span className={`school-type-dot ${s.type === "SECONDARY" ? "pink" : "blue"}`} />
                        <span className="signup-school-name">{s.name}</span>
                        <span className="signup-school-type">{s.type === "SECONDARY" ? "Secondary" : "Primary"}</span>
                        {schoolId === s._id && <span className="signup-school-check">✓</span>}
                      </button>
                    ))}
                    {schools.length === 0 && (
                      <p style={{ fontSize: 13, color: "var(--muted)" }}>No schools found. Contact your super admin.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Role */}
              <div className="form-field">
                <label className="form-label">Your role</label>
                <div className="signup-role-cards">
                  {(["SCHOOL_ADMIN", "TEACHER"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      className={`signup-role-card ${role === r ? "selected" : ""}`}
                      onClick={() => setRole(r)}
                    >
                      <span className="signup-role-icon">{r === "SCHOOL_ADMIN" ? "🏫" : "📋"}</span>
                      <span className="signup-role-label">{r === "SCHOOL_ADMIN" ? "School Admin" : "Teacher"}</span>
                      <span className="signup-role-desc">
                        {r === "SCHOOL_ADMIN" ? "Manage students, classes & results" : "Enter & view results only"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="form-error" role="alert"><span>⚠️</span> {error}</div>
              )}

              <button
                type="submit"
                className="login-btn"
                disabled={!name || !email || !schoolId}
              >
                Continue → Set Password
              </button>

            </form>
          </div>
        </div>
      </div>
    );
  }

  /* ── Step 2 — Password ──────────────────────────────────────── */
  return (
    <div className="login-page">
      {LeftPanel}
      <div className="login-form-side">
        <div className="login-form-box">

          <button
            type="button"
            className="login-back-link"
            onClick={() => { setStep("details"); setError(null); }}
            style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}
          >
            ← Back
          </button>

          <div className="signup-step-badge">Step 2 of 2</div>
          <h1 className="login-title">Set password</h1>
          <p className="login-subtitle">
            Creating account for <strong>{name}</strong>
            {selectedSchool && <> at <strong>{selectedSchool.name}</strong></>}.
          </p>

          <form onSubmit={handleSubmit} className="login-form" noValidate>

            {/* Password */}
            <div className="form-field">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="form-input-wrap">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="new-password" required
                  className="form-input" placeholder="Min 8 characters"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button type="button" className="form-eye-btn"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPass ? "Hide password" : "Show password"}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Strength bar */}
              {password && (
                <div className="signup-strength">
                  <div className="signup-strength-bar">
                    {[1,2,3,4,5].map((n) => (
                      <div
                        key={n}
                        className="signup-strength-seg"
                        style={{ background: n <= strength.score ? strength.color : "var(--border)" }}
                      />
                    ))}
                  </div>
                  <span className="signup-strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
              <p className="signup-hint">Use at least 8 characters with a mix of letters, numbers, and symbols.</p>
            </div>

            {/* Confirm password */}
            <div className="form-field">
              <label className="form-label" htmlFor="confirm">Confirm password</label>
              <div className="form-input-wrap">
                <input
                  id="confirm"
                  type={showConf ? "text" : "password"}
                  autoComplete="new-password" required
                  className="form-input" placeholder="Re-enter password"
                  value={confirm} onChange={(e) => setConfirm(e.target.value)}
                  disabled={loading}
                />
                <button type="button" className="form-eye-btn"
                  onClick={() => setShowConf((p) => !p)}
                  aria-label={showConf ? "Hide" : "Show"}>
                  {showConf ? "🙈" : "👁️"}
                </button>
              </div>
              {/* Match indicator */}
              {confirm && (
                <span className="signup-match" style={{ color: confirm === password ? "#16a34a" : "#ef4444" }}>
                  {confirm === password ? "✓ Passwords match" : "✗ Passwords do not match"}
                </span>
              )}
            </div>

            {error && (
              <div className="form-error" role="alert"><span>⚠️</span> {error}</div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading || !password || !confirm}
            >
              {loading
                ? <><span className="spinner" /> Creating account…</>
                : "Create Account →"
              }
            </button>

            <p className="signup-terms">
              By creating an account you confirm you are an authorised staff member of the selected school.
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}