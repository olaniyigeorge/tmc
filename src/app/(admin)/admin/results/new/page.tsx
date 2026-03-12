"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface School { _id: string; name: string; type: string; }
interface ClassItem { _id: string; name: string; level: string; }
interface StudentItem { _id: string; firstName: string; lastName: string; studentCode: string; }

const SESSIONS = ["2024/2025", "2025/2026", "2026/2027"];
const TERMS = ["1st", "2nd", "3rd"] as const;

export default function NewResultPage() {
  const router = useRouter();

  // ── State ──────────────────────────────────────────────────────────────────
  const [schools, setSchools] = useState<School[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);

  const [schoolId, setSchoolId] = useState("");
  const [classId, setClassId] = useState("");
  const [studentId, setStudentId] = useState("");
  const [session, setSession] = useState("");
  const [customSession, setCustomSession] = useState("");
  const [term, setTerm] = useState<string>("");

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── Load schools on mount ──────────────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/schools")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setSchools(j.data);
          // If only one school, auto-select
          if (j.data.length === 1) setSchoolId(j.data[0]._id);
        }
      });
  }, []);

  // ── Load classes when school changes ──────────────────────────────────────
  useEffect(() => {
    if (!schoolId) { setClasses([]); setClassId(""); return; }
    fetch(`/api/admin/classes?schoolId=${schoolId}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setClasses(j.data);
        setClassId("");
        setStudents([]);
        setStudentId("");
      });
  }, [schoolId]);

  // ── Load students when class or school changes ─────────────────────────────
  useEffect(() => {
    if (!schoolId) return;
    setLoadingStudents(true);
    const params = new URLSearchParams({ schoolId });
    if (classId) params.set("classId", classId);
    fetch(`/api/admin/students?${params}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setStudents(j.data);
        setStudentId("");
      })
      .finally(() => setLoadingStudents(false));
  }, [schoolId, classId]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const effectiveSession = session === "__custom__" ? customSession.trim() : session;

  const canSubmit = studentId && effectiveSession && term;

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/results", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, session: effectiveSession, term }),
      });
      const json = await res.json();
      if (json.ok) {
        router.push(`/admin/results/${json.data._id}`);
      } else {
        setError(json.error || "Failed to create result.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedStudent = students.find((s) => s._id === studentId);
  const selectedSchool = schools.find((s) => s._id === schoolId);

  return (
    <div className="nr-page">
      <div className="nr-header">
        <button className="nr-back-btn" onClick={() => router.back()}>← Back</button>
        <div>
          <h1 className="nr-title">Create New Result</h1>
          <p className="nr-subtitle">Select a student, session and term to begin entering scores</p>
        </div>
      </div>

      <div className="nr-layout">
        {/* ── Left: Form ── */}
        <div className="nr-form-card">
          {/* Step 1: School + Class */}
          <div className="nr-step">
            <div className="nr-step-label">
              <span className="nr-step-num">1</span>
              Select School & Class
            </div>
            <div className="nr-fields">
              {schools.length > 1 && (
                <div className="nr-field">
                  <label className="nr-label">School</label>
                  <div className="nr-select-wrap">
                    <select
                      className="nr-select"
                      value={schoolId}
                      onChange={(e) => setSchoolId(e.target.value)}
                    >
                      <option value="">Choose school…</option>
                      {schools.map((s) => (
                        <option key={s._id} value={s._id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
              <div className="nr-field">
                <label className="nr-label">Class <span className="nr-optional">(optional filter)</span></label>
                <div className="nr-select-wrap">
                  <select
                    className="nr-select"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    disabled={!schoolId}
                  >
                    <option value="">All classes</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="nr-divider" />

          {/* Step 2: Student */}
          <div className="nr-step">
            <div className="nr-step-label">
              <span className="nr-step-num">2</span>
              Choose Student
            </div>
            <div className="nr-field">
              <label className="nr-label">Student</label>
              <div className="nr-select-wrap">
                <select
                  className="nr-select"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  disabled={!schoolId || loadingStudents}
                >
                  <option value="">
                    {loadingStudents ? "Loading students…" : `Select student (${students.length} available)`}
                  </option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.lastName} {s.firstName} — {s.studentCode}
                    </option>
                  ))}
                </select>
              </div>
              {students.length === 0 && schoolId && !loadingStudents && (
                <p className="nr-hint nr-hint-warn">No students found. <a href="/admin/students/new" className="nr-link">Add a student first</a>.</p>
              )}
            </div>
          </div>

          <div className="nr-divider" />

          {/* Step 3: Session + Term */}
          <div className="nr-step">
            <div className="nr-step-label">
              <span className="nr-step-num">3</span>
              Session & Term
            </div>
            <div className="nr-fields nr-fields-row">
              <div className="nr-field nr-field-grow">
                <label className="nr-label">Academic Session</label>
                <div className="nr-select-wrap">
                  <select
                    className="nr-select"
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                  >
                    <option value="">Select session…</option>
                    {SESSIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    <option value="__custom__">Other (type manually)</option>
                  </select>
                </div>
                {session === "__custom__" && (
                  <input
                    className="nr-input nr-input-mt"
                    placeholder="e.g. 2027/2028"
                    value={customSession}
                    onChange={(e) => setCustomSession(e.target.value)}
                  />
                )}
              </div>
              <div className="nr-field nr-field-fixed">
                <label className="nr-label">Term</label>
                <div className="nr-term-pills">
                  {TERMS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={`nr-term-pill ${term === t ? "active" : ""}`}
                      onClick={() => setTerm(t)}
                    >
                      {t} Term
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="nr-error">
              ⚠️ {error}
            </div>
          )}

          <button
            className="nr-submit-btn"
            disabled={!canSubmit || submitting}
            onClick={submit}
          >
            {submitting ? (
              <><span className="nr-spinner" /> Creating result…</>
            ) : (
              "Continue to Enter Scores →"
            )}
          </button>
        </div>

        {/* ── Right: Preview card ── */}
        <div className="nr-preview-card">
          <div className="nr-preview-title">Result Preview</div>
          <div className="nr-preview-rows">
            <div className="nr-preview-row">
              <span className="nr-preview-label">School</span>
              <span className="nr-preview-val">{selectedSchool?.name ?? <span className="nr-preview-empty">Not selected</span>}</span>
            </div>
            <div className="nr-preview-row">
              <span className="nr-preview-label">Student</span>
              <span className="nr-preview-val">
                {selectedStudent
                  ? <>{selectedStudent.lastName} {selectedStudent.firstName} <code className="nr-preview-code">{selectedStudent.studentCode}</code></>
                  : <span className="nr-preview-empty">Not selected</span>
                }
              </span>
            </div>
            <div className="nr-preview-row">
              <span className="nr-preview-label">Class</span>
              <span className="nr-preview-val">
                {classes.find((c) => c._id === classId)?.name ?? <span className="nr-preview-empty">All classes</span>}
              </span>
            </div>
            <div className="nr-preview-row">
              <span className="nr-preview-label">Session</span>
              <span className="nr-preview-val">{effectiveSession || <span className="nr-preview-empty">Not set</span>}</span>
            </div>
            <div className="nr-preview-row">
              <span className="nr-preview-label">Term</span>
              <span className="nr-preview-val">{term ? `${term} Term` : <span className="nr-preview-empty">Not set</span>}</span>
            </div>
            <div className="nr-preview-row">
              <span className="nr-preview-label">Template</span>
              <span className="nr-preview-val">
                {selectedSchool?.type === "SECONDARY"
                  ? "🏫 Secondary (Test1 + Test2 + Exam)"
                  : selectedSchool?.type === "PRIMARY"
                  ? "🎒 Primary (CA1 + CA2 + CA3 + Exam)"
                  : <span className="nr-preview-empty">—</span>
                }
              </span>
            </div>
          </div>

          <div className="nr-preview-divider" />

          <div className="nr-checklist">
            <div className={`nr-check-item ${schoolId ? "done" : ""}`}>
              {schoolId ? "✅" : "⭕"} School selected
            </div>
            <div className={`nr-check-item ${studentId ? "done" : ""}`}>
              {studentId ? "✅" : "⭕"} Student selected
            </div>
            <div className={`nr-check-item ${effectiveSession ? "done" : ""}`}>
              {effectiveSession ? "✅" : "⭕"} Session set
            </div>
            <div className={`nr-check-item ${term ? "done" : ""}`}>
              {term ? "✅" : "⭕"} Term selected
            </div>
          </div>
        </div>
      </div>

      <style>{styles}</style>
    </div>
  );
}

const styles = `
.nr-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 8px 0 60px;
  font-family: 'DM Sans', 'Segoe UI', sans-serif;
}
.nr-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 28px;
}
.nr-back-btn {
  background: #f1f5f9;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  color: #475569;
  cursor: pointer;
  white-space: nowrap;
  margin-top: 4px;
}
.nr-back-btn:hover { background: #e2e8f0; }
.nr-title { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 4px; }
.nr-subtitle { font-size: 13px; color: #64748b; margin: 0; }

.nr-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 700px) {
  .nr-layout { grid-template-columns: 1fr; }
  .nr-preview-card { order: -1; }
}

/* Form card */
.nr-form-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 0;
}
.nr-step { padding: 20px 0; }
.nr-step:first-child { padding-top: 0; }
.nr-step:last-child { padding-bottom: 0; }
.nr-step-label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: .06em;
  margin-bottom: 16px;
}
.nr-step-num {
  width: 24px;
  height: 24px;
  background: #1e293b;
  color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 800;
  flex-shrink: 0;
}
.nr-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 0 -28px;
}
.nr-fields { display: flex; flex-direction: column; gap: 14px; }
.nr-fields-row { flex-direction: row; align-items: flex-start; flex-wrap: wrap; gap: 16px; }
.nr-field { display: flex; flex-direction: column; gap: 6px; }
.nr-field-grow { flex: 1; min-width: 180px; }
.nr-field-fixed { flex-shrink: 0; }
.nr-label { font-size: 12px; font-weight: 600; color: #475569; }
.nr-optional { font-weight: 400; color: #94a3b8; }
.nr-select-wrap { position: relative; }
.nr-select {
  width: 100%;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 36px 10px 12px;
  font-size: 14px;
  color: #1e293b;
  background: #fff;
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: border .15s, box-shadow .15s;
}
.nr-select:focus { border-color: #6366f1; box-shadow: 0 0 0 3px #6366f115; }
.nr-select:disabled { background: #f8fafc; color: #94a3b8; cursor: not-allowed; }
.nr-select-wrap::after {
  content: '▾';
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
  font-size: 12px;
}
.nr-input {
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  color: #1e293b;
  outline: none;
  width: 100%;
  transition: border .15s, box-shadow .15s;
  box-sizing: border-box;
}
.nr-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px #6366f115; }
.nr-input-mt { margin-top: 8px; }

.nr-hint { font-size: 12px; color: #64748b; margin: 4px 0 0; }
.nr-hint-warn { color: #d97706; }
.nr-link { color: #6366f1; text-decoration: underline; }

.nr-term-pills { display: flex; gap: 8px; flex-wrap: wrap; }
.nr-term-pill {
  border: 1.5px solid #e2e8f0;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
  cursor: pointer;
  transition: all .15s;
}
.nr-term-pill:hover { border-color: #6366f1; color: #6366f1; }
.nr-term-pill.active { background: #1e293b; color: #fff; border-color: #1e293b; }

.nr-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 13px;
  margin-top: 16px;
}

.nr-submit-btn {
  width: 100%;
  background: #1e293b;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 14px 20px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background .15s, transform .1s;
}
.nr-submit-btn:hover:not(:disabled) { background: #0f172a; transform: translateY(-1px); }
.nr-submit-btn:disabled { opacity: .5; cursor: not-allowed; transform: none; }
.nr-spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: nr-spin .6s linear infinite;
  display: inline-block;
}
@keyframes nr-spin { to { transform: rotate(360deg); } }

/* Preview card */
.nr-preview-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  position: sticky;
  top: 20px;
}
.nr-preview-title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .08em;
  color: #94a3b8;
  margin-bottom: 16px;
}
.nr-preview-rows { display: flex; flex-direction: column; gap: 12px; }
.nr-preview-row { display: flex; flex-direction: column; gap: 2px; }
.nr-preview-label { font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .06em; }
.nr-preview-val { font-size: 13px; font-weight: 600; color: #1e293b; }
.nr-preview-empty { color: #cbd5e1; font-weight: 400; }
.nr-preview-code { font-family: monospace; font-size: 11px; background: #f1f5f9; border-radius: 4px; padding: 1px 5px; color: #64748b; }
.nr-preview-divider { height: 1px; background: #f1f5f9; margin: 16px 0; }
.nr-checklist { display: flex; flex-direction: column; gap: 8px; }
.nr-check-item { font-size: 12px; color: #94a3b8; transition: color .2s; }
.nr-check-item.done { color: #16a34a; font-weight: 600; }
`;