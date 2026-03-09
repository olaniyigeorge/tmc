// src/app/(public)/page.tsx
// ─────────────────────────────────────────────────────────────
// Pure SERVER component — no "use client" needed here.
// All interactivity is isolated inside child client components.
// ─────────────────────────────────────────────────────────────

import HeroSection from "@/components/sections/HeroSection";

import SchoolsSection from "@/components/sections/SchoolsSection";
import HowItWorksSection from "@/components/sections/HowItWorks";
import VerifyStrip from "@/components/sections/VerifyStrip";
import SiteFooter from "@/components/sections/SiteFooter";

export const metadata = {
  title: "Results Portal — Tinabel & Tinuola Schools",
  description:
    "Access and verify term report sheets for Tinabel Model College and Tinuola Children School.",
};

export default function HomePage() {
  return (
    <>
      {/* ── 1. HERO (nav + headline + CTA cards) ── */}
      <HeroSection />

      {/* ── 2. SCHOOL PICKER CARDS (dark section) ── */}
      <SchoolsSection />

      {/* ── 3. HOW IT WORKS (3 steps) ── */}
      <HowItWorksSection />

      {/* ── 4. QUICK VERIFY INPUT (client island) ── */}
      <VerifyStrip />

      {/* ── 5. FOOTER ── */}
      <SiteFooter />
    </>
  );
}