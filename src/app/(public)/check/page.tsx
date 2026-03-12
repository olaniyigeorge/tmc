"use client";
import React, { Suspense } from "react";
import CheckForm from "@/components/public/CheckForm";
import Link from "next/link";

export default function CheckPage() {
  return (
    <div className="cp-page">
      {/* ── Header ── */}
      <header className="cp-header">
        <Link href="/" className="cp-logo-link">
          <span className="cp-logo-icon">🏫</span>
          <span className="cp-logo-text">Results Portal</span>
        </Link>
        <Link href="/verify" className="cp-verify-link">
          Verify authenticity →
        </Link>
      </header>

      <main className="cp-main">
        {/* ── Left panel: form ── */}
        <div className="cp-form-panel">
          <div className="cp-form-card">
            <div className="cp-card-header">
              <div className="cp-card-icon">📋</div>
              <h1 className="cp-card-title">Check Your Result</h1>
              <p className="cp-card-sub">
                Enter your details below to access your academic result sheet.
              </p>
            </div>

            <Suspense fallback={<div className="cp-loading">Loading…</div>}>
              <CheckForm />
            </Suspense>
          </div>
        </div>

        {/* ── Right panel: info ── */}
        <aside className="cp-info-panel">
          <div className="cp-info-card">
            <h2 className="cp-info-title">What you'll need</h2>
            <ul className="cp-info-list">
              <li>
                <span className="cp-info-icon">🏫</span>
                <div>
                  <strong>School</strong>
                  <p>Select the school your ward attends</p>
                </div>
              </li>
              <li>
                <span className="cp-info-icon">🪪</span>
                <div>
                  <strong>Student Code</strong>
                  <p>Found on the student's admission letter or ID card</p>
                </div>
              </li>
              <li>
                <span className="cp-info-icon">📅</span>
                <div>
                  <strong>Session & Term</strong>
                  <p>The academic session and term (e.g. 2025/2026, 1st Term)</p>
                </div>
              </li>
              <li>
                <span className="cp-info-icon">🔐</span>
                <div>
                  <strong>PIN</strong>
                  <p>The 6-digit PIN provided by the school when results were published</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="cp-verify-card">
            <div className="cp-verify-icon">🛡️</div>
            <h3 className="cp-verify-title">Verify Authenticity</h3>
            <p className="cp-verify-desc">
              Each result has a unique verification code printed at the bottom.
              Use it to confirm the result is genuine.
            </p>
            <Link href="/verify" className="cp-verify-btn">
              Go to Verify Page →
            </Link>
          </div>
        </aside>
      </main>

      <footer className="cp-footer">
        <p>© {new Date().getFullYear()} Tinabel Model College & Tinuola Children School. All rights reserved.</p>
      </footer>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
* { box-sizing: border-box; }

.cp-page {
  min-height: 100vh;
  background: #f8fafc;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
  display: flex;
  flex-direction: column;
}

/* Header */
.cp-header {
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 0 32px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 50;
}
.cp-logo-link {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
}
.cp-logo-icon { font-size: 22px; }
.cp-logo-text {
  font-size: 15px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -.01em;
}
.cp-verify-link {
  font-size: 13px;
  font-weight: 600;
  color: #6366f1;
  text-decoration: none;
}
.cp-verify-link:hover { text-decoration: underline; }

/* Main layout */
.cp-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 28px;
  max-width: 960px;
  width: 100%;
  margin: 40px auto;
  padding: 0 24px;
  align-items: start;
}
@media (max-width: 720px) {
  .cp-main { grid-template-columns: 1fr; }
  .cp-info-panel { order: -1; }
}

/* Form card */
.cp-form-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,.05);
}
.cp-card-header {
  padding: 28px 28px 0;
  text-align: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 20px;
}
.cp-card-icon { font-size: 36px; margin-bottom: 8px; }
.cp-card-title {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 6px;
}
.cp-card-sub {
  font-size: 13px;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Wrap CheckForm in padding */
.cp-form-panel .cf-wrap { padding: 0 28px 28px; padding-top: 4px; }
.cp-form-panel .cf-section:first-child { padding-top: 20px; }

.cp-loading { padding: 40px; text-align: center; color: #94a3b8; font-size: 14px; }

/* Info panel */
.cp-info-panel { display: flex; flex-direction: column; gap: 16px; }

.cp-info-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,.04);
}
.cp-info-title {
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: .07em;
  margin: 0 0 16px;
}
.cp-info-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.cp-info-list li {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.cp-info-icon { font-size: 18px; flex-shrink: 0; margin-top: 2px; }
.cp-info-list strong { display: block; font-size: 13px; color: #1e293b; margin-bottom: 2px; }
.cp-info-list p { font-size: 12px; color: #64748b; margin: 0; line-height: 1.4; }

.cp-verify-card {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  color: #fff;
}
.cp-verify-icon { font-size: 28px; margin-bottom: 8px; }
.cp-verify-title { font-size: 15px; font-weight: 700; margin: 0 0 6px; }
.cp-verify-desc { font-size: 12px; color: #94a3b8; line-height: 1.5; margin: 0 0 14px; }
.cp-verify-btn {
  display: inline-block;
  background: #fff;
  color: #1e293b;
  border-radius: 10px;
  padding: 9px 18px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
  transition: background .15s;
}
.cp-verify-btn:hover { background: #f1f5f9; }

/* Footer */
.cp-footer {
  text-align: center;
  padding: 20px;
  font-size: 12px;
  color: #94a3b8;
  border-top: 1px solid #f1f5f9;
  background: #fff;
  margin-top: auto;
}
`;