import Link from "next/link";

export default function SchoolsSection() {
  return (
    <>
      {/* Wave divider */}
      <div className="divider-wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none" height={60}>
          <path d="M0,60 C360,0 1080,80 1440,20 L1440,60 Z" fill="#0F172A" />
        </svg>
      </div>

      <section className="schools-section">
        <p className="section-eyebrow">Our Schools</p>
        <h2 className="section-title">Choose Your School</h2>

        <div className="schools-grid">
          {/* TINABEL */}
          <div className="school-card tinabel">
            <div className="school-glow" />
            <span className="school-badge">Secondary</span>
            <h2>Tinabel Model College</h2>
            <p className="school-sub">Afin Road, Okeagbe-Akoko, Ondo State</p>
            <div className="school-actions">
              <Link href="/check?school=tinabel" className="s-btn">
                <span>📋 Check Result</span>
                <span>→</span>
              </Link>
              <Link href="/verify?school=tinabel" className="s-btn">
                <span>🔐 Verify Sheet</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* TINUOLA */}
          <div className="school-card tinuola">
            <div className="school-glow" />
            <span className="school-badge">Nursery / Primary</span>
            <h2>Tinuola Children School</h2>
            <p className="school-sub">Afin Road, Okeagbe-Akoko, Ondo State</p>
            <div className="school-actions">
              <Link href="/check?school=tinuola" className="s-btn">
                <span>📋 Check Result</span>
                <span>→</span>
              </Link>
              <Link href="/verify?school=tinuola" className="s-btn">
                <span>🔐 Verify Sheet</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}