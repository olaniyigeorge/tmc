"use client";
// src/app/(auth)/admin/login/page.tsx
//
// IMPORTANT: This file lives in (auth)/ NOT (admin)/
// This means it is NOT wrapped by the admin layout.tsx that calls auth()
// and redirects to /admin/login — which is what was causing the loop.

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email: email.trim().toLowerCase(),
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError(
        res.error === "CredentialsSignin"
          ? "Incorrect email or password. Please try again."
          : res.error
      );
    } else {
      router.push("/admin/dashboard");
    }
  }

  return (
    <div className="login-page">

      {/* ── LEFT PANEL ── */}
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
          <h2 className="login-panel-title">Results Portal</h2>
          <p className="login-panel-sub">
            Tinabel Model College<br />
            &amp; Tinuola Children School
          </p>
          <div className="login-panel-pills">
            <span className="lp-pill pink">TMC — Secondary</span>
            <span className="lp-pill blue">TCS — Primary</span>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div className="login-form-side">
        <div className="login-form-box">

          <Link href="/" className="login-back-link">
            ← Back to portal
          </Link>

          <h1 className="login-title">Admin Sign In</h1>
          <p className="login-subtitle">
            Enter your credentials to access the admin panel.
          </p>

          <form onSubmit={handleSubmit} className="login-form" noValidate>

            <div className="form-field">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="form-input"
                placeholder="you@school.edu.ng"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="form-input-wrap">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="form-eye-btn"
                  onClick={() => setShowPass((p) => !p)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && (
              <div className="form-error" role="alert">
                <span>⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="login-btn"
              disabled={loading || !email || !password}
            >
              {loading ? <><span className="spinner" /> Signing in…</> : "Sign In →"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}