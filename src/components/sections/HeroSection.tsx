import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Decorative background layers */}
      <div className="hero-bg" />
      <div className="dot-grid" />
      <div className="circle c1" />
      <div className="circle c2" />
      <div className="circle c3" />
      <div className="circle c4" />

      {/* ── NAV ── */}
      <nav>
        <div className="nav-logo">
          <div className="logo-emblem">
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zm0 12.46L4.28 11 12 6.54 19.72 11 12 15.46zM5 13.18V17l7 4 7-4v-3.82l-7 3.82-7-3.82z" />
            </svg>
          </div>
          <div className="logo-text">
            Tinabel · Tinuola
            <span>Schools Results Portal</span>
          </div>
        </div>

        <div className="nav-links">
          <a href="#how" className="nav-link">How it works</a>
          <Link href="/admin/login" className="nav-link admin">Admin Login →</Link>
        </div>
      </nav>

      {/* ── HERO BODY ── */}
      <div className="hero-body">
        <div className="badge">
          <span className="badge-dot" />
          Academic Results — Secure &amp; Verified
        </div>

        <h1>
          Your Child&apos;s Results,<br />
          <span className="pink">Instantly</span> &amp;{" "}
          <span className="blue">Securely</span>
        </h1>

        <p className="hero-sub">
          Access and print term report sheets for Tinabel Model College and
          Tinuola Children School — from anywhere, anytime.
        </p>

        <div className="cta-row">
          <Link href="/check" className="cta-card pink-card">
            <div className="icon">📋</div>
            <h3>Check Result</h3>
            <p>Enter your student code and PIN to access your term report sheet.</p>
            <div className="cta-arrow">
              Get started
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>

          <Link href="/verify" className="cta-card blue-card">
            <div className="icon">🔐</div>
            <h3>Verify Authenticity</h3>
            <p>Confirm a result sheet is genuine using the verification code printed on it.</p>
            <div className="cta-arrow">
              Verify now
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}